import { useEffect, useState } from "react";
import type { TokenBudgetSettings } from "../types";
import { defaultTokenBudgetsUSD, getSettings, saveSettings } from "../services/storage";

const defaultWelcomeMessages = [
  "Your AI needs context",
  "Drop memory before you prompt",
  "Bring yesterday into this chat",
  "Capture now, reuse later",
  "Let CTX carry the context",
  "Use a capsule, skip the recap",
  "Keep the work moving"
].join("\n");

export function Options() {
  const [apiUrl, setApiUrl] = useState("http://localhost:3000/api");
  const [welcomeMessage, setWelcomeMessage] = useState(defaultWelcomeMessages);
  const [tokenBudgetsUSD, setTokenBudgetsUSD] = useState<TokenBudgetSettings>(defaultTokenBudgetsUSD);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      setApiUrl(settings.apiUrl);
      setWelcomeMessage(settings.welcomeMessage);
      setTokenBudgetsUSD(settings.tokenBudgetsUSD);
    });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSettings({
      apiUrl,
      welcomeMessage: welcomeMessage.trim() || defaultWelcomeMessages,
      tokenBudgetsUSD: normalizeBudgets(tokenBudgetsUSD)
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function updateBudget(provider: keyof TokenBudgetSettings, field: "dailyUSD" | "weeklyUSD", value: number) {
    setTokenBudgetsUSD((current) => ({
      ...current,
      [provider]: {
        ...current[provider],
        [field]: value
      }
    }));
  }

  return (
    <main>
      <h1>CTX Options</h1>
      <form onSubmit={submit}>
        <label htmlFor="api-url">CTX API URL</label>
        <input id="api-url" name="apiUrl" value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} spellCheck={false} />
        <label htmlFor="welcome-message">Welcome messages</label>
        <textarea
          id="welcome-message"
          maxLength={420}
          name="welcomeMessage"
          rows={7}
          value={welcomeMessage}
          onChange={(event) => setWelcomeMessage(event.target.value)}
          spellCheck={false}
        />
        <fieldset>
          <legend>USD usage budgets</legend>
          {(Object.keys(tokenBudgetsUSD) as Array<keyof TokenBudgetSettings>).map((provider) => (
            <section className="budget-row" key={provider}>
              <strong>{providerLabels[provider]}</strong>
              <label htmlFor={`${provider}-daily-budget`}>Daily $</label>
              <input
                id={`${provider}-daily-budget`}
                min={0.01}
                step={0.25}
                type="number"
                value={tokenBudgetsUSD[provider].dailyUSD}
                onChange={(event) => updateBudget(provider, "dailyUSD", Number(event.target.value))}
              />
              <label htmlFor={`${provider}-weekly-budget`}>Weekly $</label>
              <input
                id={`${provider}-weekly-budget`}
                min={0.01}
                step={0.25}
                type="number"
                value={tokenBudgetsUSD[provider].weeklyUSD}
                onChange={(event) => updateBudget(provider, "weeklyUSD", Number(event.target.value))}
              />
            </section>
          ))}
        </fieldset>
        <button type="submit">Save Settings</button>
      </form>
      {saved ? <p aria-live="polite">Saved.</p> : null}
    </main>
  );
}

const providerLabels: Record<keyof TokenBudgetSettings, string> = {
  openai: "OpenAI / ChatGPT",
  gemini: "Google Gemini",
  anthropic: "Anthropic Claude",
  other: "Other AI"
};

function normalizeBudgets(value: TokenBudgetSettings): TokenBudgetSettings {
  return {
    openai: normalizeBudget(value.openai),
    gemini: normalizeBudget(value.gemini),
    anthropic: normalizeBudget(value.anthropic),
    other: normalizeBudget(value.other)
  };
}

function normalizeBudget(value: { dailyUSD: number; weeklyUSD: number }) {
  const dailyUSD = Math.max(0.01, Number(value.dailyUSD) || 0.01);
  const weeklyUSD = Math.max(dailyUSD, Number(value.weeklyUSD) || dailyUSD);
  return { dailyUSD, weeklyUSD };
}
