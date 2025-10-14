import { llm } from "@/lib/llm/model";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";


export async function getAIResponse(serialized, prompt) {
  const memory = serialized.map((msg) => {
    switch (msg.type) {
      case "human":
        return new HumanMessage({ content: msg.content });
      case "ai":
        return new AIMessage({ content: msg.content });
      case "system":
        return new SystemMessage({ content: msg.content });
      default:
        throw new Error("Unknown message type");
    }
  });

  const response = await llm.invoke([...memory, new HumanMessage(prompt)]);
  return { message: response.content.toString() };
}