export type Platform = "chatgpt" | "claude" | "gemini" | "perplexity" | "github" | "cursor" | "generic";

export type Capsule = {
  id: string;
  title: string;
  summary?: string;
  rawText?: string;
  markdown?: string;
  tags?: string;
  platform?: string;
};

export type ExtensionSettings = {
  apiUrl: string;
};
