import { z } from "zod";

export const aiResponseSchema = z.object({
    response: z.string().describe("Response to the user prompt"),
    content: z.string().describe("Updated document content"),
  });