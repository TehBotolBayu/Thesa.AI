import { llm } from "@/lib/llm/model";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { ReviewCriteriaService } from "./supabase/review_criteria";
import { safeParseArray } from "@/lib/general/parser";

// Zod schemas for structured outputs
const CriteriaSchema = z.object({
  researchQuestion: z.string().describe("The main research question derived from user"),
  keywords: z.array(z.string()).describe("List of relevant keywords for the research"),
  inclusionCriteria: z.array(z.string()).describe("Criteria for including papers in the review"),
  exclusionCriteria: z.array(z.string()).describe("Criteria for excluding papers from the review"),
});

const ExtractionSchema = z.object({
  objective: z.string().describe("The main objective or purpose of the study"),
  method: z.string().describe("The methodology used in the study"),
  result: z.string().describe("The key results or findings"),
  limitation: z.string().describe("Limitations acknowledged or identified in the study"),
  optimization: z.string().optional().describe("Optimization approaches or techniques mentioned"),
  technicalImplementation: z.string().optional().describe("Technical implementation details"),
  applicability: z.string().optional().describe("Applicability and practical use cases"),
});

const EvaluationSchema = z.object({
  overallScore: z.number().min(0).max(10).describe("Overall relevance score from 0-10 based on all criteria"),
  inclusionScores: z.array(z.number().min(0).max(10)).describe("Score (0-10) for each inclusion criterion in order"),
  exclusionScores: z.array(z.number().min(0).max(10)).describe("Score (0-10) for each exclusion criterion in order (higher = more reason to exclude)"),
});


/**
 * Generate research criteria from chat history and user context
 * @param {Array} chatHistory - Array of chat messages with role and content
 * @param {string} userQuery - Optional specific user query for criteria generation
 * @param {number} paperCount - Number of papers in the collection
 * @param {string} chatbot_id - Chatbot ID for saving criteria
 * @returns {Promise<Object>} Generated criteria
 */
export async function generateCriteria(chatHistory, userQuery, paperCount, chatbot_id) {
  try {
    // Build chat history context (limit to recent messages to save tokens)
    const recentMessages = chatHistory.slice(-10); // Last 10 messages
    const chatContext = recentMessages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const systemPrompt = new SystemMessage({
      content: `You are an expert research methodologist specializing in systematic literature reviews.
Your task is to generate comprehensive review criteria based on the user's research interests and conversation context.`
    });

    const userPrompt = new HumanMessage({
      content: `Based on the following conversation and research context, generate systematic review criteria for ${paperCount} academic papers:

Chat History:
${chatContext}

${userQuery ? `\nSpecific Research Focus:\n${userQuery}\n` : ''}

Generate:
1. A clear research question that encompasses the main research themes from the conversation
2. A testable hypothesis
3. Relevant keywords (5-10 keywords) that would help identify relevant papers. 
Each keyword should be only in one word dor two as phrase in same language as the chat history or english.
4. Inclusion criteria (3-5 criteria for what papers should be included in the review)
5. Exclusion criteria (3-5 criteria for what papers should be excluded from the review)

Be specific and actionable in your criteria. Base the criteria on the research interests, topics, and goals discussed in the conversation.`
    });

    const structuredLLM = llm.withStructuredOutput(CriteriaSchema);
    const response = await structuredLLM.invoke([systemPrompt, userPrompt]);


    const inclusionCriteria = safeParseArray(response.inclusionCriteria, "inclusionCriteria");
    const exclusionCriteria = safeParseArray(response.exclusionCriteria, "exclusionCriteria");
    const keywords = safeParseArray(response.keywords, "keywords");


    const criteriaData = {
      researchQuestion: response.researchQuestion, 
      keywords,
      inclusionCriteria,
      exclusionCriteria
    };

    //check if criteria already exists
    const existingCriteria = await ReviewCriteriaService.getByChatbotId(chatbot_id);
    console.log('existingCriteria: ', JSON.stringify(existingCriteria, null, 2));
    if(existingCriteria && existingCriteria.length > 0) {
      console.log('Criteria already exists');
      //update criteria
      const updateResponse = await ReviewCriteriaService.update(existingCriteria.id, criteriaData);
      if(!updateResponse) {
        console.error('failed to update data');
      }
      return criteriaData;
    }

    //save to criteria table
    const saveResponse = await ReviewCriteriaService.create(response, chatbot_id);
    if(!saveResponse) {
      console.error('failed to save data');
    }

    return criteriaData;
  } catch (error) {
    console.error("Error in generateCriteria:", error);
    throw new Error(`Failed to generate criteria: ${error.message}`);
  }
}

/**
 * Extract key points from a single paper
 * @param {Object} paper - Paper object with abstract, title
 * @param {Object} criteria - Research criteria from step 1
 * @returns {Promise<Object>} Extracted data
 */
export async function extractKeyPoints(paper, criteria) {
  try {
    const systemPrompt = new SystemMessage({
      content: `You are an expert at extracting structured information from academic papers.
Your task is to carefully read and extract key information according to the systematic review criteria.`
    });

    const userPrompt = new HumanMessage({
      content: `Extract key information from this paper based on our systematic review criteria:

Research Question: ${criteria.researchQuestion}
Keywords: ${criteria.keywords.join(', ')}

Paper:
Title: ${paper.title}
Abstract: ${paper.abstract || 'N/A'}

Extract the following information:
1. Objective: What is the main purpose or objective of this study?
2. Method: What methodology was used?
3. Result: What are the key findings or results?
4. Limitation: What limitations are mentioned or apparent?
5. Optimization: What optimization techniques or approaches are discussed? (if applicable)
6. Technical Implementation: What technical details are provided? (if applicable)
7. Applicability: What are the practical applications or use cases? (if applicable)

Be concise but comprehensive. If information is not available, state "Not mentioned in abstract."`
    });

    const structuredLLM = llm.withStructuredOutput(ExtractionSchema);
    const response = await structuredLLM.invoke([systemPrompt, userPrompt]);

    return response;
  } catch (error) {
    console.error("Error in extractKeyPoints:", error);
    throw new Error(`Failed to extract key points: ${error.message}`);
  }
}

/**
 * Count keywords present in paper content (case-insensitive)
 * @param {Object} paper - Paper object with title and abstract
 * @param {Array<string>} keywords - List of keywords to search for
 * @returns {number} Count of keywords found
 */
function countKeywords(paper, keywords) {
  const content = `${paper.title || ''} ${paper.abstract || ''}`.toLowerCase();
  let count = 0;
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    const regex = new RegExp(String.raw`\b${keywordLower.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}\b`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      count += matches.length;
    }
  }
  
  return count;
}

/**
 * Evaluate a paper based on systematic review criteria
 * @param {Object} paper - Paper object
 * @param {Object} extractedData - Extracted data from step 2
 * @param {Object} criteria - Research criteria from step 1
 * @returns {Promise<Object>} Evaluation results with keyword count
 */
export async function evaluatePaper(paper, extractedData, criteria) {
  try {
    // Count keywords (no LLM needed)
    const keywordCount = countKeywords(paper, criteria.keywords);

    const systemPrompt = new SystemMessage({
      content: `You are an expert in systematic literature review methodology.
Your task is to evaluate whether a research paper meets the specified inclusion and exclusion criteria.
Provide numerical scores only, be objective and evidence-based.`
    });

    const inclusionList = criteria.inclusionCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n');
    const exclusionList = criteria.exclusionCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n');

    const userPrompt = new HumanMessage({
      content: `Evaluate this research paper against systematic review criteria and provide scores:

Research Question: ${criteria.researchQuestion}

Paper Information:
Title: ${paper.title}
Abstract: ${paper.abstract || 'N/A'}

Extracted Data:
- Objective: ${extractedData.objective}
- Method: ${extractedData.method}
- Result: ${extractedData.result}
- Limitation: ${extractedData.limitation}

Provide scores (0-10) for:

1. Overall Score: Overall relevance to the research question and criteria (0-10)

2. Inclusion Criteria (score each 0-10, where 10 = fully meets, 0 = doesn't meet):
${inclusionList}

3. Exclusion Criteria (score each 0-10, where 10 = strongly applies/should exclude, 0 = doesn't apply):
${exclusionList}

Return ONLY numerical scores in the exact order listed above.`
    });

    const structuredLLM = llm.withStructuredOutput(EvaluationSchema);
    const response = await structuredLLM.invoke([systemPrompt, userPrompt]);

    console.log('response from evaluatePaper: ', JSON.stringify(response, null, 2));

    // Add keyword count to response
    return {
      ...response,
      keywordCount
    };
  } catch (error) {
    console.error("Error in evaluatePaper:", error);
    throw new Error(`Failed to evaluate paper: ${error.message}`);
  }
}

/**
 * Synthesize results from all papers
 * @param {Array} papers - All papers
 * @param {Array} evaluations - All evaluation results
 * @param {Array} extractions - All extraction results
 * @param {Object} criteria - Research criteria
 * @returns {Promise<string>} Synthesis report as formatted text
 */
export async function synthesizeResults(papers, evaluations, extractions, criteria) {
  console.log('synthesizeResults');
  console.log('papers: ', JSON.stringify(papers, null, 2));
  console.log('evaluations: ', JSON.stringify(evaluations, null, 2));
  console.log('extractions: ', JSON.stringify(extractions, null, 2));
  console.log('criteria: ', JSON.stringify(criteria, null, 2));
  try {
    // Combine all data for context
    const paperSummaries = papers.map((paper, idx) => {
      const extraction = extractions.find(e => e.paperId === paper.id) || {};
      const evaluation = evaluations.find(e => e.paperId === paper.id) || {};
      
      return `
Paper ${idx + 1}: ${paper.title}
Overall Score: ${evaluation.overallScore || 'N/A'}/10
Objective: ${extraction.objective || 'N/A'}
Method: ${extraction.method || 'N/A'}
Result: ${extraction.result || 'N/A'}
Limitation: ${extraction.limitation || 'N/A'}
---`;
    }).join('\n');

    const systemPrompt = new SystemMessage({
      content: `You are an expert research synthesizer specializing in systematic literature reviews.
Your task is to identify patterns, contradictions, and relationships across multiple studies 
and provide a comprehensive synthesis that addresses the research question.

Format your response as a well-structured markdown document with clear headings and sections.`
    });

    const userPrompt = new HumanMessage({
      content: `Synthesize findings from ${papers.length} papers for this systematic review:

Research Question: ${criteria.researchQuestion}

Papers Summary:
${paperSummaries}

Create a comprehensive synthesis report with the following structure:

# Systematic Literature Review - Synthesis Report

## Overall Findings
What do we know from these studies collectively?

## Key Patterns Identified
What common themes or patterns emerge? (Use numbered list)

## Contradictions Found
What conflicting findings exist? (Use numbered list, or state if none found)

## Relationships Between Studies
How do these studies relate to and build upon each other?

## Evidence Analysis
Analyze the evidence in relation to the research question

## Limitations and Research Gaps
What are the overall limitations and research gaps? (Use numbered list)

## Recommendations for Future Research
What should future research focus on?

---

Be analytical, objective, and evidence-based. Cite patterns across multiple papers. Use markdown formatting for clarity.`
    });

    const response = await llm.invoke([systemPrompt, userPrompt]);

    console.log('response from synthesizeResults: ', JSON.stringify(response, null, 2));

    return response.content;
  } catch (error) {
    console.error("Error in synthesizeResults:", error);
    throw new Error(`Failed to synthesize results: ${error.message}`);
  }
}

/**
 * Format synthesis report for display
 * @param {string} synthesis - Synthesis text from AI (already formatted)
 * @returns {string} Formatted markdown report
 */
export function formatSynthesisReport(synthesis) {
  // AI now returns pre-formatted text, so just return it as-is
  return synthesis;
}


