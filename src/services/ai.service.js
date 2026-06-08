import { systemPrompt } from "@/const/ai";
import { logDev } from "@/lib/logger";
import { llm } from "@/lib/llm/model";
import { aiResponseSchema, ColumnValueSchema } from "@/schema/writerSchema";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { namesToFunctions, tools } from "./toolCallingService";
import { rerankerService } from "./reranker.service";
import { extractPdfTextFromUrl } from "@/lib/paperPDFUtil";
import { BM25 } from "@/lib/bm25";
import { getChunksFromCache, saveChunksToCache } from "@/lib/localCache";

export async function getAIResponse(
  serialized,
  prompt,
  defaultSystemPrompt = `You are AI Agent that will help user`,
  schema = null
) {
  try {
    let memory = [];
    if (serialized) {
      memory = serialized.map((msg) => {
        switch (msg.type) {
          case "user":
            return new HumanMessage({ content: msg.content });
          case "assistant":
            return new AIMessage({ content: msg.content });
          default:
            throw new Error("Unknown message type");
        }
      });
    }

    const sysPromptMsg = new SystemMessage({ content: defaultSystemPrompt });
    memory = memory.length > 0 ? [sysPromptMsg, ...memory] : [sysPromptMsg];

    let response = "";

    if (schema) {
      const structuredLLM = llm.withStructuredOutput(ColumnValueSchema);
      response = await structuredLLM.invoke([...memory, new HumanMessage(prompt)]);
    } else {
      response = await llm.invoke([...memory, new HumanMessage(prompt)]);
    }

    return response;
  } catch (err) {
    console.error("❌ Error in getAIResponse:", err);
    throw err;
  }
}

function chunkText(text, chunkSize = 1000, overlap = 200) {
  if (!text) return [];
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

export async function getAIPaperResponse(
  userPrompt,
  chatHistory = [{ role: "system", content: systemPrompt }],
  namespaces = [],
  onProgress = () => {},
  onToken = null,
  paperData = []
) {
  const memory = chatHistory.map((msg) => {
    switch (msg.type || msg.role) {
      case "user":
        return new HumanMessage(msg.content);
      case "assistant":
        return new AIMessage(msg.content);
      case "system":
        return new SystemMessage(msg.content);
      default:
        return new HumanMessage(msg.content);
    }
  });

  memory.unshift(new SystemMessage(
    "You are an AI research assistant. Your first priority is to classify the user's intent: SEARCH or ASK.\n" +
    "- If SEARCH (e.g., user wants to find new papers on a topic), call the searchAcademicPapers tool with at least 3 distinct queries.\n" +
    "- If ASK (e.g., user is asking a detailed question about the current papers, or wants to deep dive into paper content), DO NOT call any tools. Just reply directly, and the system will automatically fetch relevant context from the papers."
  ));

  const modelWithTools = llm.bindTools(tools);
  onProgress("Analyzing request...");

  const response = await modelWithTools.invoke([...memory, new HumanMessage(userPrompt)]);
  const toolCalls = response.tool_calls;

  // QA FLOW (No tool calls)
  if (!toolCalls || toolCalls.length === 0) {
    if (paperData && paperData.length > 0) {
      onProgress("Analyzing user intent for paper retrieval...");
      // Step 1: generate relevant topic keyword 
      const keywordResponse = await llm.invoke([
        new SystemMessage("Extract a few highly relevant topic keywords or a concise search phrase from the user's query that can be used to find the most relevant papers from their existing library."),
        new HumanMessage(userPrompt)
      ]);
      const topicKeywords = keywordResponse.content;

      // Step 2 & 3: use keyword to find relevant paper by matching topic to each paper title
      onProgress("Searching for relevant papers...");
      const bm25 = new BM25(paperData);
      const searchResults = bm25.search(topicKeywords);
      
      const topK = 3;
      const topPapers = searchResults
        .filter(res => res.score > 0)
        .slice(0, topK)
        .map(res => paperData.find(p => p.id === res.id))
        .filter(Boolean);

      let combinedContext = "";

      for (let i = 0; i < topPapers.length; i++) {
        const topPaper = topPapers[i];
        combinedContext += `Title: ${topPaper.title}\nAbstract: ${topPaper.abstract}\n`;

        if (topPaper.pdfUrl) {
          try {
            // Step 4: Chunk content, save to local cache.
            onProgress(`Processing document ${i + 1}/${topPapers.length}: ${topPaper.title}...`);
            let chunks = await getChunksFromCache(topPaper.pdfUrl);
            
            if (!chunks) {
              onProgress(`Downloading and extracting PDF for: ${topPaper.title}...`);
              const pdfText = await extractPdfTextFromUrl(topPaper.pdfUrl);
              const extractedChunks = chunkText(pdfText);
              chunks = extractedChunks.map((c, idx) => ({ id: `${topPaper.id}_${idx}`, paperTitle: topPaper.title, content: c }));
              await saveChunksToCache(topPaper.pdfUrl, chunks);
            }

            if (chunks && chunks.length > 0) {
              // Step 5: Generate hypothetical answer
              onProgress(`Generating hypothetical answer for ${topPaper.title}...`);
              const hydeResponse = await llm.invoke([
                new SystemMessage("You are an expert. Please write a detailed, hypothetical, fake answer to the following question. Do not worry about being factual, just write what a good answer might look like structurally and topically."),
                new HumanMessage(userPrompt)
              ]);
              const hypotheticalAnswer = hydeResponse.content;

              // Step 6: Use BM25 on the chunks using hypothetical answer
              onProgress(`Finding relevant context in ${topPaper.title}...`);
              const chunkBm25 = new BM25(chunks.map(c => ({ id: c.id, abstract: c.content })));
              const chunkResults = chunkBm25.search(hypotheticalAnswer);
              
              const topChunks = chunkResults.slice(0, 3).map(r => chunks.find(c => c.id === r.id).content);
              combinedContext += `Relevant Excerpts from ${topPaper.title}:\n${topChunks.join("\n...\n")}\n\n`;
            }
          } catch (e) {
            console.error(`PDF Parsing failed for ${topPaper.title}:`, e.message);
          }
        }
      }

      memory.push(new SystemMessage(`Here is the relevant context from the user's existing papers:\n${combinedContext}\n\nPlease generate an answer for the user based on the context above. If the context doesn't contain the answer, you can respond generally or say you don't know.`));
      logDev("Prepared context for answering:", combinedContext);
    }

    onProgress("Generating relevant answer...");
    if (onToken) {
      let fullAnswer = "";
      const streamRes = await llm.stream([...memory, new HumanMessage(userPrompt)]);
      for await (const chunk of streamRes) {
        const token = chunk.content || "";
        if (token) {
          fullAnswer += token;
          onToken(token);
        }
      }
      logDev("Generated answer (streamed):", fullAnswer);
      return { finalAnswer: fullAnswer, toolResult: null, streamed: true };
    }
    
    const finalResponse = await llm.invoke([...memory, new HumanMessage(userPrompt)]);
    logDev("Generated answer:", finalResponse.content);
    return {
      finalAnswer: finalResponse.content,
      toolResult: null,
    };
  }

  // SEARCH FLOW (Tool calls present)
  const toolCall = toolCalls[0];
  const functionName = toolCall.name;
  onProgress(`Using tool: ${functionName}...`);
  const functionParams = toolCall.args;
  const functionResult = await namesToFunctions[functionName](functionParams);

  let toolResult = JSON.parse(functionResult).data;
  const query = JSON.parse(functionResult).queries ? JSON.parse(functionResult).queries.join(", ") : "search query";
  
  // const rerankerInput = toolResult.map((paper) => ({
  //   id: paper.id,
  //   data: paper.title,
  //   abstract: paper.abstract,
  // }));

  // onProgress("Reranking relevant documents...");
  // const rerankedToolResult = await rerankerService(rerankerInput, query);

  // const toolResultSimplified = rerankedToolResult.map((item) => ({
  //   id: item.id,
  //   title: toolResult.find((input) => input.id === item.id)?.title,
  //   dataSummary: item.dataSummary,
  //   pdfUrl: toolResult.find((input) => input.id === item.id)?.pdfUrl,
  // }));

  // toolResult = toolResult.map((item) => ({
  //   ...item,
  //   score: rerankedToolResult.find((rerankedItem) => rerankedItem.id === item.id)?.score,
  // }));

  const toolResultSimplified = toolResult.map((item) => ({
    id: item.id,
    title: item.title,
    dataSummary: item.abstract || item.title || "",
    pdfUrl: item.pdfUrl,
  }));

  const rerankedToolResult = [];

  memory.push(response); // Assistant message with tool call
  memory.push({
    role: "tool",
    name: functionName,
    content: JSON.stringify(toolResultSimplified),
    tool_call_id: toolCall.id,
  });

  onProgress("Generating relevant answer...");
  const finalAnswerRes = await llm.invoke([...memory, new HumanMessage("Provide a summary of the search results to the user.")]);
  logDev("Generated answer (search summary):", finalAnswerRes.content);

  return {
    finalAnswer: finalAnswerRes.content,
    toolResult: toolResult,
    rerankedToolResult: rerankedToolResult,
  };
}

export async function getAIWriterResponse(
  userPrompt,
  documentContent,
  chatHistory = [
    {
      role: "system",
      content: "You are an AI writing assistant.",
    },
  ]
) {
  const prompt = `You are an AI writing assistant to help user write their document.
User's Document:
---
${documentContent}
---
Task: ${userPrompt}
- if user's task is to write, put the main output in "content".
- Reply only in this JSON format, no extra text or markdown.
{
  "response": "brief reply to user",
  "content": "main output of the task answer"
}
`;

  const memory = chatHistory.map((msg) => {
    switch (msg.type || msg.role) {
      case "user":
      case "human":
        return new HumanMessage(msg.content);
      case "assistant":
      case "ai":
        return new AIMessage(msg.content);
      case "system":
        return new SystemMessage("You are an AI writing assistant.");
      default:
        return new HumanMessage(msg.content);
    }
  });

  const structuredLLM = llm.withStructuredOutput(aiResponseSchema);
  const response = await structuredLLM.invoke([...memory, new HumanMessage(prompt)]);

  return response;
}
