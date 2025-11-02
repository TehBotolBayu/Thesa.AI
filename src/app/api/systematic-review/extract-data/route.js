import { extractKeyPoints } from "@/services/systematic-review.service";
import { PaperColumnService } from "@/services/supabase/paper-column.service";
import { PaperColumnValueService } from "@/services/supabase/paper-column-value.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { papers, criteria, chatbotId } = await req.json();

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json(
        { error: "Papers array is required" },
        { status: 400 }
      );
    }

    if (!criteria) {
      return NextResponse.json(
        { error: "Criteria is required" },
        { status: 400 }
      );
    }

    if (!chatbotId) {
      return NextResponse.json(
        { error: "Chatbot ID is required" },
        { status: 400 }
      );
    }

    // Create columns for extraction fields if they don't exist
    const columnFields = [
      { label: "Objective", instruction: "Main objective or purpose of the study", chatbotId, step: 'extract_data' },
      { label: "Method", instruction: "Methodology used in the study", chatbotId, step: 'extract_data' },
      { label: "Result", instruction: "Key results or findings", chatbotId, step: 'extract_data' },
      { label: "Limitation", instruction: "Limitations of the study", chatbotId, step: 'extract_data' },
      { label: "Optimization", instruction: "Optimization approaches mentioned", chatbotId, step: 'extract_data' },
      { label: "Technical Implementation", instruction: "Technical implementation details", chatbotId, step: 'extract_data' },
      { label: "Applicability", instruction: "Practical applications and use cases", chatbotId, step: 'extract_data' },
    ];

    // Get existing columns or create new ones
    // const existingColumns = await PaperColumnService.getColumnsByChatbotId(chatbotId);

    const columns = await PaperColumnService.bulkInsertColumns(columnFields);

    const columnMap = {};
    for (const field of columns) {
      columnMap[field.label.toLowerCase().replace(/\s+/g, '')] = field;
    }

    // Process papers sequentially with delay
    const results = [];
    for (const paper of papers) {
      try {
        // Extract key points
        const extraction = await extractKeyPoints(paper, criteria);

        // Prepare column values
        const columnValues = [
          { paper_id: paper.id, column_id: columnMap['objective'].id, chatbot_id: chatbotId, value: extraction.objective },
          { paper_id: paper.id, column_id: columnMap['method'].id, chatbot_id: chatbotId, value: extraction.method },
          { paper_id: paper.id, column_id: columnMap['result'].id, chatbot_id: chatbotId, value: extraction.result },
          { paper_id: paper.id, column_id: columnMap['limitation'].id, chatbot_id: chatbotId, value: extraction.limitation },
          { paper_id: paper.id, column_id: columnMap['optimization'].id, chatbot_id: chatbotId, value: extraction.optimization || 'N/A' },
          { paper_id: paper.id, column_id: columnMap['technicalimplementation'].id, chatbot_id: chatbotId, value: extraction.technicalImplementation || 'N/A' },
          { paper_id: paper.id, column_id: columnMap['applicability'].id, chatbot_id: chatbotId, value: extraction.applicability || 'N/A' },
        ];

        // Save to database
        await PaperColumnValueService.bulkInsertPaperColumnValues(columnValues);


        const result = Object.entries(extraction).map(([key, value]) => ({
          label: key,
          value: value,
        }));

        results.push({
          paperId: paper.id,
          success: true,
          data: result,
        });

        console.log(`Processed paper: ${paper.id}`);
        // Wait 1 second before next paper
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing paper ${paper.id}:`, error);
        results.push({
          paperId: paper.id,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Extract data API error:", error);
    return NextResponse.json(
      { error: "Failed to extract data", details: error.message },
      { status: 500 }
    );
  }
}

