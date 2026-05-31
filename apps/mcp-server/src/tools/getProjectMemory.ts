import { z } from "zod";

export const getProjectMemoryInput = {
  projectId: z.string().optional(),
  projectName: z.string().optional()
};
