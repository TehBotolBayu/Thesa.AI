import { ChatMistralAI, MistralAIEmbeddings } from "@langchain/mistralai";
import { Mistral } from "@mistralai/mistralai";
// import { ChatDeepSeek } from "@langchain/deepseek";

export const llm = new ChatMistralAI({
  // model: "mistral-medium-latest",
  model: "mistral-medium-latest",
  temperature: 0,
});

export const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
});

export const mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });


// export const deepseekLLM = new ChatDeepSeek({
//   model: "deepseek-reasoner",
//   temperature: 0,
// });