import { rerankerSystemPrompt } from "@/const/ai";
import { llm } from "@/lib/llm/model";
import { RerankerArraySchema, RerankerSchema } from "@/schema/rerankerSchema";
import { SystemMessage } from "@langchain/core/messages";
import { HumanMessage } from "langchain";

export async function rerankerService(data = [], query = "") {
  
  // create llm and apply schema
  // pause the program for 2 second here
  if (data.length === 0) {
    return [];
  }

  const structuredLLM = llm.withStructuredOutput(RerankerSchema);
  // build prompt
  const prompt = new SystemMessage({
    content: rerankerSystemPrompt,
  });

  

  // loop the data here to get response from ai

  // const result = await Promise.all(data.map(async (item) => {
  //     const userPrompt = new HumanMessage({
  //         content: `
  //         Strictly output an objects with the following format:
  //         { "score": number, "dataSummary": string }
  //         Query: ${query}
  //         Data: ${JSON.stringify(item)}`,
  //     });
  //     
  //     const response = await structuredLLM.invoke([prompt, userPrompt]);
  //     
  //     return { ...response, id: item.id };
  // }));

  // to prevent rate limit error on free tier
  const result = [];
  for (const item of data) {
    const userPrompt = new HumanMessage({
      content: `
    Strictly output an object with the following format:
    { "score": number, "dataSummary": string }
    Query: ${query}
    Data: ${JSON.stringify(item)}`,
    });

    const response = await structuredLLM.invoke([prompt, userPrompt]);
    

    await new Promise((resolve) => setTimeout(resolve, 1000)); // waits 2s before next
    result.push({ ...response, id: item.id });
  }

  // return parsed result
  
  
  return result;
}
