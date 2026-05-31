import { z } from "zod";

export const createCapsuleFromGitHubInput = {
  owner: z.string(),
  repo: z.string(),
  type: z.enum(["issue", "pull_request", "readme", "repository"]),
  number: z.number().int().positive().optional()
};
