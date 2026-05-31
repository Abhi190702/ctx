import { z } from "zod";

export const createCapsuleInput = {
  title: z.string(),
  summary: z.string().optional(),
  rawText: z.string().optional(),
  tags: z.array(z.string()).optional()
};
