import { evaluatePaper } from "@/services/systematic-review.service";
import { PaperColumnService } from "@/services/supabase/paper-column.service";
import { PaperColumnValueService } from "@/services/supabase/paper-column-value.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { papers, extractions, criteria, chatbotId } = await req.json();

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json(
        { error: "Papers array is required" },
        { status: 400 }
      );
    }

    if (!extractions || !Array.isArray(extractions)) {
      return NextResponse.json(
        { error: "Extractions array is required" },
        { status: 400 }
      );
    }

    if (!criteria) {
      return NextResponse.json(
        { error: "Criteria object is required" },
        { status: 400 }
      );
    }

    if (!chatbotId) {
      return NextResponse.json(
        { error: "Chatbot ID is required" },
        { status: 400 }
      );
    }

    // Create columns for evaluation fields based on criteria
    const evaluationFields = [
      { 
        label: "Overall Score", 
        instruction: "Overall relevance score based on all criteria",
        key: 'overallScore'
      },
      { 
        label: "Keyword Count", 
        instruction: "Number of keywords found in paper",
        key: 'keywordCount'
      },
    ];

    // Add columns for each inclusion criterion
    for (const [idx, criterion] of criteria.inclusionCriteria.entries()) {
      evaluationFields.push({
        label: `Inclusion ${idx + 1}`,
        instruction: criterion,
        key: `inclusion_${idx}`
      });
    }

    // Add columns for each exclusion criterion
    for (const [idx, criterion] of criteria.exclusionCriteria.entries()) {
      evaluationFields.push({
        label: `Exclusion ${idx + 1}`,
        instruction: criterion,
        key: `exclusion_${idx}`
      });
    }

    const existingColumns = await PaperColumnService.getColumnsByChatbotId(chatbotId);
    const columnMap = {};

    for (const field of evaluationFields) {
      let column = existingColumns.find(c => c.label === field.label && c.step === 'evaluation');
      if (!column) {
        let step = 'evaluation';

        if (field.key.startsWith('inclusion')) {
          step = 'inclusion';
        } else if (field.key.startsWith('exclusion')) {
          step = 'exclusion';
        }

        column = await PaperColumnService.createColumn({
          chatbotId,
          label: field.label,
          instruction: field.instruction,
          step,
        });
      }
      columnMap[field.key] = column;
    }

    // Process papers sequentially
    const results = [];
    for (const paper of papers) {
      try {
        // Find extraction data for this paper
        const extractionData = extractions.find(e => e.paperId === paper.id);
        if (!extractionData?.success) {
          console.warn(`No extraction data for paper ${paper.id}, skipping evaluation`);
          results.push({
            title: paper.title,
            paperId: paper.id,
            success: false,
            error: "No extraction data available",
          });
          continue;
        }

        // Evaluate paper with criteria
        const evaluation = await evaluatePaper(paper, extractionData.data, criteria);

        // Save evaluation results
        const columnValues = [
          { 
            paper_id: paper.id, 
            column_id: columnMap['overallScore'].id, 
            chatbot_id: chatbotId, 
            value: evaluation.overallScore,
            step: 'evaluation',
            label: 'Overall Score'
          },
          { 
            paper_id: paper.id, 
            column_id: columnMap['keywordCount'].id, 
            chatbot_id: chatbotId, 
            value: evaluation.keywordCount,
            step: 'evaluation',
            label: 'Keyword Count'
          },
        ];

        // Add inclusion criteria scores
        for (const [idx, score] of evaluation.inclusionScores.entries()) {
          columnValues.push({
            paper_id: paper.id,
            column_id: columnMap[`inclusion_${idx}`].id,
            chatbot_id: chatbotId,
            value: score.toString(),
            step: 'inclusion',
            label: `Inclusion ${idx + 1}`
          });
        }

        // Add exclusion criteria scores
        for (const [idx, score] of evaluation.exclusionScores.entries()) {
          columnValues.push({
            paper_id: paper.id,
            column_id: columnMap[`exclusion_${idx}`].id,
            chatbot_id: chatbotId,
            value: score.toString(),
            step: 'exclusion',
            label: `Exclusion ${idx + 1}`
          });
        }

        await PaperColumnValueService.bulkInsertPaperColumnValues(columnValues);

        results.push({
          title: paper.title,
          paperId: paper.id,
          success: true,
          data: columnValues,
        });

        // Wait 1 second before next paper
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error evaluating paper ${paper.id}:`, error);
        results.push({
          title: paper.title,
          paperId: paper.id,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Evaluate papers API error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate papers", details: error.message },
      { status: 500 }
    );
  }
}

