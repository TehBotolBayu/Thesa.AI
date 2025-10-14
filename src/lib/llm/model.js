import { ChatMistralAI, MistralAIEmbeddings } from "@langchain/mistralai";
import { Mistral } from "@mistralai/mistralai";

export const llm = new ChatMistralAI({
  // model: "mistral-large-latest",
  model: "mistral-large-latest",
  temperature: 0,
});

export const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
});

export const mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });