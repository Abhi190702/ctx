import { useEffect, useState } from "react";
import type { Capsule } from "../types";
import { fetchCapsules, getCtxPageUrl } from "../services/ctx-api";
import { getSettings, saveSettings } from "../services/storage";

export function Popup() {
  const [apiUrl, setApiUrl] = useState("http://localhost:3000/api");
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [message, setMessage] = useState("");
  const logoUrl = chrome.runtime.getURL("assets/ctx-mark.png");

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
    const tabUrl = tab.url || tab.pendingUrl || "";
    if (!tab.id) throw new Error("No active tab found.");
    if (!tabUrl) throw new Error("Chrome did not expose this tab URL. Reload CTX from chrome://extensions.");
    if (!isSupportedPage(tabUrl)) return false;

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: "ctx:ping-content" });
      if (response?.ok) return true;
    } catch {
      // The content script may not be attached to this already-open tab yet.
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    } catch (error) {
      throw new Error(`Chrome blocked CTX injection. ${formatError(error)} ${siteAccessHint(tabUrl)}`);
    }

    await wait(150);

    let response: { ok?: boolean } | undefined;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { type: "ctx:ping-content" });
    } catch (error) {
      throw new Error(`CTX injected, but the page did not answer. ${formatError(error)} Refresh ChatGPT and try again.`);
    }
    return Boolean(response?.ok);
  }

  async function send(type: string) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;
      await ensureContentScript();
      const response = await chrome.tabs.sendMessage(tab.id, { type });
      setMessage(response?.ok ? "Captured into CTX." : response?.error ?? "Action failed.");
    } catch (error) {
      setMessage(formatError(error));
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
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <main>
      <header>
        <span className="brand-mark" aria-hidden="true">
          <img src={logoUrl} alt="" />
        </span>
        <span>
          <strong>CTX</strong>
          <span>Portable memory for AI workflows</span>
        </span>
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

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : "Could not inject CTX on this page.";
}

function siteAccessHint(url: string) {
  if (!url.startsWith("https://")) return "";
  return "Open chrome://extensions > CTX Details > Site access, then choose On all sites or add this site.";
}

function isSupportedPage(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const exactHosts = new Set([
      "chatgpt.com",
      "chat.openai.com",
      "claude.ai",
      "gemini.google.com",
      "notebooklm.google.com",
      "www.perplexity.ai",
      "perplexity.ai",
      "chat.deepseek.com",
      "grok.com",
      "poe.com",
      "chat.mistral.ai",
      "copilot.microsoft.com",
      "www.meta.ai",
      "chat.qwen.ai",
      "lovable.dev",
      "replit.com",
      "app.emergent.sh",
      "v0.dev",
      "bolt.new",
      "cursor.com",
      "github.com"
    ]);
    return exactHosts.has(host) || host.endsWith(".copilot.microsoft.com") || host.endsWith(".lovable.dev");
  } catch {
    return false;
  }
}
