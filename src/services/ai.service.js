import { systemPrompt } from "@/const/ai";
import { llm, mistralClient } from "@/lib/llm/model";
import {
  aiResponseSchema,
  ColumnValueArraySchema,
  ColumnValueSchema,
} from "@/schema/writerSchema";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { namesToFunctions, tools } from "./toolCallingService";

export function testFuncton() {
  return "asdkjfb";
}

export async function getAIResponse(
  serialized,
  prompt,
  defaultSystemPrompt = `You are AI Agent that will help user`,
  schema = null
) {
  // console.log("getAIResponse is starting");
  // console.log("serialized: ", serialized);
  // console.log("prompt: ", prompt);
  // console.log("defaultSystemPrompt: ", defaultSystemPrompt);

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

    const systemPrompt = new SystemMessage({ content: defaultSystemPrompt });
    memory = memory.length > 0 ? [systemPrompt, ...memory] : [systemPrompt];

    console.log("adding structured output");

    let response = "";

    if (schema) {
      const structuredLLM = llm.withStructuredOutput(ColumnValueSchema);

      response = await structuredLLM.invoke([
        ...memory,
        new HumanMessage(prompt),
      ]);
    } else {
      response = await llm.invoke([
        ...memory,
        new HumanMessage(prompt),
      ]);
    }

    // console.log("Response received:", response);
    return response;
  } catch (err) {
    console.error("❌ Error in getAIResponse:", err);
    throw err;
  }
}

// 3. Main wrapper function
export async function getAIPaperResponse(
  userPrompt,
  chatHistory = [
    {
      role: "system",
      content: systemPrompt,
    },
  ]
) {
  const memory = chatHistory.map((msg) => {
    switch (msg.type) {
      case "user":
        return { role: "user", content: msg.content };
      case "assistant":
        return { role: "assistant", content: msg.content };
      case "system":
        return { role: "system", content: msg.content };
      default:
        throw new Error("Unknown message type");
    }
  });

  let messages = [...memory];
  // Step A: Send user query to Mistral with tools
  let response = await mistralClient.chat.complete({
    model: "mistral-medium-latest",
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

  // Step D: Append results back into conversation safely
  const assistantMsg = response.choices[0].message;

  // Only push if valid (non-empty content or has tool_calls)
  // if (
  //   assistantMsg.content?.trim() ||
  //   (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0)
  // ) {
  messages.push(assistantMsg);
  // } else  {
  //   messages.push({
  //     role: "assistant",
  //     content: 'here are result from the tool',
  //   });
  // }

  const toolResult = JSON.parse(functionResult);
  const toolResultSimplified = toolResult.map((paper, index) => ({
    title: paper.title,
    abstract: paper.abstract,
  }));
  console.log("toolResultSimplified: ", JSON.stringify(toolResultSimplified));

  messages.push({
    role: "tool",
    name: functionName,
    content: JSON.stringify(toolResultSimplified),
    tool_call_id: toolCall.id,
    toolCallId: toolCall.id,
  });

  // Step E: Get final AI answer
  response = await mistralClient.chat.complete({
    model: "mistral-medium-latest",
    messages,
  });

  return {
    finalAnswer: response.choices[0].message.content,
    toolResult: JSON.parse(functionResult), // raw data from API
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
    switch (msg.type) {
      case "user":
      case "human":
        return new HumanMessage({ content: msg.content });
      case "assistant":
      case "ai":
        return new AIMessage({ content: msg.content });
      case "system":
        return new SystemMessage({
          content: "You are an AI writing assistant.",
        });
      default:
        throw new Error("Unknown message type");
    }
  });

  const structuredLLM = llm.withStructuredOutput(aiResponseSchema);

  const response = await structuredLLM.invoke([
    ...memory,
    new HumanMessage(prompt),
  ]);

  return response;
}
