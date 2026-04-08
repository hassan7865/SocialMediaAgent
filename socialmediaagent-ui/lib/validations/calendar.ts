import { z } from "zod";

export const calendarGenerateSchema = z.object({
  week_start: z.string(),
  goals: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
});
