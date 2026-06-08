import { ChatOpenAI } from "@langchain/openai";
import { MistralAIEmbeddings } from "@langchain/mistralai";

// Initialize OpenRouter model using LangChain's ChatOpenAI
export const llm = new ChatOpenAI({
  modelName: process.env.OPENROUTER_MODEL || "openai/gpt-4o",
  temperature: 0,
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
      "X-Title": "Thesa.AI",
    },
  },
});

export const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
});