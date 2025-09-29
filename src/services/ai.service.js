import { llm, mistralClient } from "@/lib/llm/model";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { namesToFunctions, searchSemanticScholar, tools } from "./toolCallingService";
import { systemPrompt } from "@/const/ai";

export async function getAIResponse(serialized, prompt) {
  const memory = serialized.map((msg) => {
    switch (msg.type) {
      case "user":
        return new HumanMessage({ content: msg.content });
      case "assistant":
        return new AIMessage({ content: msg.content });
      case "system":
        return new SystemMessage({ content: msg.content });
      default:
        throw new Error("Unknown message type");
    }
  });

  // Create a structured LLM with the Zod schema
  // const structuredLLM = llm.withStructuredOutput(chatSchema);

  // Add a system message to guide the LLM on the expected output format
  const systemPrompt = new SystemMessage({
    content: `You are AI Agent that will help user`,
  });

  const response = await llm.invoke([
    systemPrompt,
    ...memory,
    new HumanMessage(prompt),
  ]);

  return response;
}

// 3. Main wrapper function
export async function getAIPaperResponse(userPrompt, chatHistory = [
  {
    role: "system", content: systemPrompt
  }
]) {
  const memory = chatHistory.map((msg) => {
    switch (msg.type) {
      case "user":
        return { role: 'user', content: msg.content };
      case "assistant":
        return { role: "assistant", content: msg.content };
      case "system":
        return { role: 'system', content: msg.content };
      default:
        throw new Error("Unknown message type");
    }
  });

  let messages = [...memory];
  // Step A: Send user query to Mistral with tools
  let response = await mistralClient.chat.complete({
    model: "mistral-large-latest",
    messages,
    tools,
    toolChoice: "auto",
  });

  const toolCall = response.choices[0].message.toolCalls?.[0];

  // Step B: If no tool call → return model’s direct answer
  if (!toolCall) {
    return {
      finalAnswer: response.choices[0].message.content,
      toolResult: null,
    };
  }

  // Step C: Run the tool
  const functionName = toolCall.function.name;
  const functionParams = JSON.parse(toolCall.function.arguments);
  const functionResult = await namesToFunctions[functionName](functionParams);

  // Step D: Append results back into conversation
  messages.push(response.choices[0].message);
  messages.push({
    role: "tool",
    name: functionName,
    content: functionResult,
    toolCallId: toolCall.id,
  });

  // Step E: Get final AI answer
  response = await mistralClient.chat.complete({
    model: "mistral-large-latest",
    messages,
  });

  return {
    finalAnswer: response.choices[0].message.content,
    toolResult: JSON.parse(functionResult), // raw data from API
  };
}
