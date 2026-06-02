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
    fetchCapsules()
      .then((items) => {
        setCapsules(items.slice(0, 4));
        setMessage(items.length ? "" : "No capsules yet. Create or capture one first.");
      })
      .catch(() => {
        setCapsules([]);
        setMessage("CTX app is not reachable. Start pnpm dev and keep this URL as /api.");
      });
    ensureContentScript().catch(() => undefined);
  }, []);

  async function ensureContentScript() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id || !tab.url || !isSupportedPage(tab.url)) return false;

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: "ctx:ping-content" });
      if (response?.ok) return true;
    } catch {
      // The content script may not be attached to this already-open tab yet.
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
    const response = await chrome.tabs.sendMessage(tab.id, { type: "ctx:ping-content" });
    return Boolean(response?.ok);
  }

  async function send(type: string) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;
      await ensureContentScript();
      const response = await chrome.tabs.sendMessage(tab.id, { type });
      setMessage(response?.ok ? "Captured into CTX." : response?.error ?? "Action failed.");
    } catch {
      setMessage("Reload this AI page once after installing or updating CTX.");
    }
  }

  async function saveApiUrl(value: string) {
    setApiUrl(value);
    await saveSettings({ apiUrl: value });
  }

  async function openCtx(path = "") {
    await chrome.tabs.create({ url: await getCtxPageUrl(path) });
  }

  async function showButton() {
    try {
      const injected = await ensureContentScript();
      setMessage(injected ? "CTX button injected. Check near the prompt box." : "Open ChatGPT, Claude, Gemini, Perplexity, or GitHub first.");
    } catch {
      setMessage("Could not inject here. Refresh the AI page, then click Show CTX Button again.");
    }
  }

  return (
    <main>
      <header>
        <strong>CTX</strong>
        <span>Portable memory for AI workflows</span>
      </header>
      <section className="actions" aria-label="Actions">
        <button type="button" onClick={showButton}>Show CTX Button</button>
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

function isSupportedPage(url: string) {
  return [
    "https://chatgpt.com/",
    "https://chat.openai.com/",
    "https://claude.ai/",
    "https://gemini.google.com/",
    "https://www.perplexity.ai/",
    "https://github.com/"
  ].some((prefix) => url.startsWith(prefix));
}
