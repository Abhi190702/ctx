import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../services/storage";

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
  const [tokenDailyLimit, setTokenDailyLimit] = useState(50000);
  const [tokenWeeklyLimit, setTokenWeeklyLimit] = useState(300000);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      setApiUrl(settings.apiUrl);
      setWelcomeMessage(settings.welcomeMessage);
      setTokenDailyLimit(settings.tokenDailyLimit);
      setTokenWeeklyLimit(settings.tokenWeeklyLimit);
    });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSettings({
      apiUrl,
      welcomeMessage: welcomeMessage.trim() || defaultWelcomeMessages,
      tokenDailyLimit: Math.max(1000, Math.round(tokenDailyLimit || 50000)),
      tokenWeeklyLimit: Math.max(1000, Math.round(tokenWeeklyLimit || 300000))
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
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
          <legend>Token usage meter</legend>
          <label htmlFor="token-daily-limit">Daily token budget</label>
          <input
            id="token-daily-limit"
            min={1000}
            name="tokenDailyLimit"
            step={1000}
            type="number"
            value={tokenDailyLimit}
            onChange={(event) => setTokenDailyLimit(Number(event.target.value))}
          />
          <label htmlFor="token-weekly-limit">Weekly token budget</label>
          <input
            id="token-weekly-limit"
            min={1000}
            name="tokenWeeklyLimit"
            step={1000}
            type="number"
            value={tokenWeeklyLimit}
            onChange={(event) => setTokenWeeklyLimit(Number(event.target.value))}
          />
        </fieldset>
        <button type="submit">Save Settings</button>
      </form>
      {saved ? <p aria-live="polite">Saved.</p> : null}
    </main>
  );
}
