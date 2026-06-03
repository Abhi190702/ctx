import type { ExtensionSettings, TokenBudgetSettings } from "../types";

const defaultWelcomeMessages = [
  "Your AI needs context",
  "Drop memory before you prompt",
  "Bring yesterday into this chat",
  "Capture now, reuse later",
  "Let CTX carry the context",
  "Use a capsule, skip the recap",
  "Keep the work moving"
].join("\n");

export const defaultTokenBudgetsUSD: TokenBudgetSettings = {
  openai: { dailyUSD: 5, weeklyUSD: 25 },
  gemini: { dailyUSD: 3, weeklyUSD: 15 },
  anthropic: { dailyUSD: 5, weeklyUSD: 25 },
  other: { dailyUSD: 2, weeklyUSD: 10 }
};

const defaults: ExtensionSettings = {
  apiUrl: "http://localhost:3000/api",
  welcomeMessage: defaultWelcomeMessages,
  tokenBudgetsUSD: defaultTokenBudgetsUSD
};

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.local.get(defaults);
  return {
    ...defaults,
    ...stored,
    tokenBudgetsUSD: normalizeTokenBudgets(stored.tokenBudgetsUSD)
  };
}

export async function saveSettings(settings: Partial<ExtensionSettings>) {
  await chrome.storage.local.set(settings);
}

function normalizeTokenBudgets(value: unknown): TokenBudgetSettings {
  const input = value as Partial<TokenBudgetSettings> | undefined;
  return {
    openai: normalizeBudget(input?.openai, defaultTokenBudgetsUSD.openai),
    gemini: normalizeBudget(input?.gemini, defaultTokenBudgetsUSD.gemini),
    anthropic: normalizeBudget(input?.anthropic, defaultTokenBudgetsUSD.anthropic),
    other: normalizeBudget(input?.other, defaultTokenBudgetsUSD.other)
  };
}

function normalizeBudget(value: unknown, fallback: { dailyUSD: number; weeklyUSD: number }) {
  const budget = value as Partial<{ dailyUSD: number; weeklyUSD: number }> | undefined;
  const dailyUSD = Math.max(0.01, Number(budget?.dailyUSD) || fallback.dailyUSD);
  const weeklyUSD = Math.max(dailyUSD, Number(budget?.weeklyUSD) || fallback.weeklyUSD);
  return { dailyUSD, weeklyUSD };
}
