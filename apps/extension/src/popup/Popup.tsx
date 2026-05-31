import { useEffect, useState } from "react";
import type { Capsule } from "../types";
import { fetchCapsules, getCtxPageUrl } from "../services/ctx-api";
import { getSettings, saveSettings } from "../services/storage";

export function Popup() {
  const [apiUrl, setApiUrl] = useState("http://localhost:3000/api");
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getSettings().then((settings) => setApiUrl(settings.apiUrl));
    fetchCapsules().then((items) => setCapsules(items.slice(0, 4))).catch(() => setCapsules([]));
  }, []);

  async function send(type: string) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;
    const response = await chrome.tabs.sendMessage(tab.id, { type });
    setMessage(response?.ok ? "Captured into CTX." : response?.error ?? "Action failed.");
  }

  async function saveApiUrl(value: string) {
    setApiUrl(value);
    await saveSettings({ apiUrl: value });
  }

  async function openCtx(path = "") {
    await chrome.tabs.create({ url: await getCtxPageUrl(path) });
  }

  return (
    <main>
      <header>
        <strong>CTX</strong>
        <span>Portable memory for AI workflows</span>
      </header>
      <section className="actions" aria-label="Actions">
        <button type="button" onClick={() => send("ctx:capture-selection")}>Capture Selection</button>
        <button type="button" onClick={() => send("ctx:capture-page")}>Capture Page</button>
        <button type="button" onClick={() => openCtx()}>Open Dashboard</button>
        <button type="button" onClick={() => openCtx("/search")}>Search Capsules</button>
      </section>
      <label htmlFor="api-url">CTX API URL</label>
      <input id="api-url" name="apiUrl" value={apiUrl} onChange={(event) => saveApiUrl(event.target.value)} spellCheck={false} />
      <section aria-label="Recent capsules">
        <h2>Recent Capsules</h2>
        {capsules.length ? capsules.map((capsule) => <p key={capsule.id}>{capsule.title}</p>) : <p>No capsules loaded.</p>}
      </section>
      {message ? <p className="message" aria-live="polite">{message}</p> : null}
    </main>
  );
}
