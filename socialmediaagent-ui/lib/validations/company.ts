import { z } from "zod";

export const companyCreateSchema = z.object({
  name: z.string().min(2),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  industry: z.string().optional(),
  target_audience: z.string().optional(),
  value_proposition: z.string().optional(),
  differentiators: z.string().optional(),
  key_messages: z.array(z.string()).optional(),
});

export const companyUpdateSchema = companyCreateSchema.partial();
