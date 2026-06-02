import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../services/storage";

export function Options() {
  const [apiUrl, setApiUrl] = useState("http://localhost:3000/api");
  const [welcomeMessage, setWelcomeMessage] = useState("Your AI needs context");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      setApiUrl(settings.apiUrl);
      setWelcomeMessage(settings.welcomeMessage);
    });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSettings({ apiUrl, welcomeMessage: welcomeMessage.trim() || "Your AI needs context" });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main>
      <h1>CTX Options</h1>
      <form onSubmit={submit}>
        <label htmlFor="api-url">CTX API URL</label>
        <input id="api-url" name="apiUrl" value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} spellCheck={false} />
        <label htmlFor="welcome-message">Welcome message</label>
        <input
          id="welcome-message"
          maxLength={44}
          name="welcomeMessage"
          value={welcomeMessage}
          onChange={(event) => setWelcomeMessage(event.target.value)}
          spellCheck={false}
        />
        <button type="submit">Save Settings</button>
      </form>
      {saved ? <p aria-live="polite">Saved.</p> : null}
    </main>
  );
}
