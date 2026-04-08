import { z } from "zod";

export const postCreateSchema = z.object({
  company_id: z.uuid(),
  platform: z.string().min(2),
  content_text: z.string().min(1),
  scheduled_at: z.string().optional(),
});

export const postUpdateSchema = z.object({
  content_text: z.string().min(1).optional(),
  scheduled_at: z.string().optional(),
});
