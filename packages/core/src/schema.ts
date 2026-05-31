import { z } from "zod";

export const SourceSchema = z.object({
  type: z.string().default("manual"),
  platform: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  capturedAt: z.string().datetime().optional()
});

export const ProjectRefSchema = z.object({
  name: z.string().min(1).optional(),
  repository: z.string().optional()
});

export const CapsuleSchema = z.object({
  schemaVersion: z.string().default("0.1.0"),
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  source: SourceSchema.optional(),
  project: ProjectRefSchema.optional(),
  summary: z.string().optional().nullable(),
  goals: z.array(z.string()).default([]),
  decisions: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  openQuestions: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  content: z
    .object({
      rawText: z.string().default(""),
      markdown: z.string().default("")
    })
    .default({ rawText: "", markdown: "" }),
  metadata: z
    .object({
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
      version: z.number().int().positive().default(1),
      tokenEstimate: z.number().int().nonnegative().default(0),
      importance: z.number().int().min(0).max(10).default(0)
    })
    .default({ version: 1, tokenEstimate: 0, importance: 0 })
});

export const CreateCapsuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  rawText: z.string().optional().nullable(),
  markdown: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  sourceType: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  projectName: z.string().optional().nullable(),
  repository: z.string().optional().nullable(),
  goals: z.union([z.array(z.string()), z.string()]).optional(),
  decisions: z.union([z.array(z.string()), z.string()]).optional(),
  constraints: z.union([z.array(z.string()), z.string()]).optional(),
  openQuestions: z.union([z.array(z.string()), z.string()]).optional(),
  nextSteps: z.union([z.array(z.string()), z.string()]).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  importance: z.coerce.number().int().min(0).max(10).default(0)
});

export const UpdateCapsuleSchema = CreateCapsuleSchema.partial();

export const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  repository: z.string().optional().nullable()
});

export type PortableCapsule = z.infer<typeof CapsuleSchema>;
export type CreateCapsuleInput = z.input<typeof CreateCapsuleSchema>;
export type UpdateCapsuleInput = z.input<typeof UpdateCapsuleSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
