import { z } from "zod";

export const connectPlatformSchema = z.object({
  platform: z.string().min(2),
});
