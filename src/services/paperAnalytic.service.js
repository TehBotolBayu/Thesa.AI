import { getAIResponse } from "./ai.service";
import { queryPineCone } from "./pinecone";

export async function paperAnalyticService(papersData = [], column) {
  // get all paper data

  // way 1 : iterate all data, generate analysis for each
  const analysisPromises = papersData.map(async (paper) => {
    try {
      // Placeholder - replace with your actual async logic
      const analysis = await performAnalysis(paper, column);
      return {
        paperId: paper.id,
        success: true,
        data: analysis,
      };
    } catch (error) {
      return {
        paperId: paper.id,
        success: false,
        error: error.message,
      };
    }
  });

  // wait for all data to be processed
  const results = await Promise.all(analysisPromises);

  // return the analysis
  return results;
}

export async function sequentialPaperAnalyticService(papersData = [], column) {
  const results = [];

  // const analysisPromises = papersData.map(async (paper) => {
  for (const paper of papersData) {
    try {
      // Perform the analysis for the current paper
      const analysis = await performAnalysis(paper, column);
      results.push({
        paper_id: paper.id,
        column_id: column.id,
        chatbot_id: paper.chatbotId,
        value: analysis,
        label: column.label,
        step: column.step || '',
      });
    } catch (error) {
      results.push({
        paper_id: paper.id,
        column_id: column.id,
        chatbot_id: paper.chatbotId,
        value: null,
        label: column.label,
        step: column.step || '',
      });
    }
    // Wait for 1 second before continuing to next paper
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return results;
}

// Helper function - implement your actual analysis logic here
async function performAnalysis(paper, column) {
  //   call llm
  // query pinecone for relevant context
  const relevantContext = await queryPineCone('convi', column.instruction, paper.pdfUrl);
  
  const serialized = "";
  const analystSystemPrompt =
    "youre AI agent that help analyze document. Be direct and concise.";

  const prompt = `Given the document and required column to fill in, 
  analyze the document per the instruction. 
  If relevant, extract the required info; 
  otherwise, reply “No information found.” 
  Reject if the instruction is outside your role.
        Document abstract: ${paper.abstract}
        ${relevantContext && 'Relevant context from the paper: ' + relevantContext}
        Column to fill: ${JSON.stringify({
          columnId: column.id,
          columnInstruction: column.instruction,
          columnName: column.label,
        })}
    `;

  const response = await getAIResponse(serialized, prompt, analystSystemPrompt);

  return response.content;
}
