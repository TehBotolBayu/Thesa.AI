import { z } from "zod";

export const chatSchema = z.object({
  isNeedCall: z.boolean(),
  question: z.string(),
});

// export default chatSchema;
