import { z } from "zod";

export const listRecentCapsulesInput = { limit: z.number().int().min(1).max(50).default(10) };
