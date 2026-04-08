import { z } from "zod";

export const brandVoiceSchema = z.object({
  formality_level: z.number().min(1).max(5),
  style: z.string(),
  persona_prompt: z.string().min(1),
});
