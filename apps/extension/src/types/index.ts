export type Platform = "chatgpt" | "claude" | "gemini" | "perplexity" | "github" | "cursor" | "generic";

export type Capsule = {
  id: string;
  title: string;
  summary?: string;
  rawText?: string;
  markdown?: string;
  tags?: string | string[];
  platform?: string;
  tokenEstimate?: number;
  updatedAt?: string;
  lastInjectedAt?: string | null;
  project?: { name?: string | null } | null;
};

export type ExtensionSettings = {
  apiUrl: string;
};
