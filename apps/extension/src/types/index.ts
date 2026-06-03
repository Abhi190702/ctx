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
  welcomeMessage: string;
  tokenBudgetsUSD: TokenBudgetSettings;
};

export type TokenBudgetSettings = {
  openai: { dailyUSD: number; weeklyUSD: number };
  gemini: { dailyUSD: number; weeklyUSD: number };
  anthropic: { dailyUSD: number; weeklyUSD: number };
  other: { dailyUSD: number; weeklyUSD: number };
};
