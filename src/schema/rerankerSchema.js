import { z } from "zod";

export const  RerankerSchema = z.object({
  score: z.number().describe("Relevancy score of the data"),
  dataSummary: z.string().describe("Summary of the data, keep it short and concise"),
});

export const RerankerArraySchema = z.array(RerankerSchema);
