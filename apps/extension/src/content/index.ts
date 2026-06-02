(() => {
type Platform = "chatgpt" | "claude" | "gemini" | "perplexity" | "github" | "cursor" | "generic";

type Capsule = {
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

type DropMode = "smart" | "brief" | "full";

let buttonHost: HTMLElement | null = null;
let picker: HTMLElement | null = null;
let menuOpen = false;

mountCtxButton();

const observer = new MutationObserver(() => mountCtxButton());
observer.observe(document.documentElement, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ctx:capture-selection") {
    captureSelection().then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === "ctx:capture-page") {
    capturePage().then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  return false;
});

function detectPlatform(host = location.hostname): Platform {
  const normalized = host.toLowerCase();
  if (normalized.includes("chatgpt.com") || normalized.includes("chat.openai.com")) return "chatgpt";
  if (normalized.includes("claude.ai")) return "claude";
  if (normalized.includes("gemini.google.com")) return "gemini";
  if (normalized.includes("perplexity.ai")) return "perplexity";
  if (normalized.includes("github.com")) return "github";
  if (normalized.includes("cursor.com")) return "cursor";
  return "generic";
}

function mountCtxButton() {
  if (buttonHost?.isConnected) {
    placeButton(buttonHost);
    return;
  }

  const host = document.createElement("div");
  host.dataset.ctxExtension = "launcher";
  host.style.position = "fixed";
  host.style.right = "20px";
  host.style.bottom = "86px";
  host.style.zIndex = "2147483647";
  document.documentElement.append(host);
  buttonHost = host;
  placeButton(host);
  window.addEventListener("resize", () => placeButton(host), { passive: true });
  window.addEventListener("scroll", () => placeButton(host), { passive: true });

  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      :host { all: initial; color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      .wrap { position: relative; display: flex; align-items: flex-end; gap: 10px; }
      .launcher {
        width: 44px;
        height: 44px;
        border: 1px solid rgba(15,118,110,.42);
        border-radius: 999px;
        background: linear-gradient(135deg, #ccfbf1, #2dd4bf);
        color: #052e2b;
        font: 900 12px ui-sans-serif, system-ui, sans-serif;
        cursor: pointer;
        box-shadow: 0 12px 36px rgba(0,0,0,.35);
      }
      .launcher:hover { filter: brightness(1.04); transform: translateY(-1px); }
      .launcher:focus-visible, .menu button:focus-visible { outline: 2px solid #5eead4; outline-offset: 2px; }
      .menu {
        position: absolute;
        right: 54px;
        bottom: 0;
        width: 236px;
        display: none;
        overflow: hidden;
        border: 1px solid #283044;
        border-radius: 14px;
        background: #111827;
        box-shadow: 0 24px 90px rgba(0,0,0,.52);
      }
      .menu[data-open="true"] { display: block; }
      .menu button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 0;
        background: transparent;
        color: #e5e7eb;
        padding: 14px 16px;
        text-align: left;
        font: 800 14px ui-sans-serif, system-ui, sans-serif;
        cursor: pointer;
      }
      .menu button:hover { background: rgba(255,255,255,.06); }
      .icon { color: #8bf5cf; font-size: 18px; line-height: 1; }
      .status {
        margin: 0;
        padding: 10px 16px 12px;
        border-top: 1px solid #283044;
        color: #9ca3af;
        font: 700 11px/1.4 ui-sans-serif, system-ui, sans-serif;
      }
      .toast {
        position: absolute;
        right: 0;
        bottom: 54px;
        min-width: 210px;
        max-width: 300px;
        display: none;
        border: 1px solid #283044;
        border-radius: 12px;
        background: #0b1020;
        color: #e5e7eb;
        padding: 10px 12px;
        font: 700 12px ui-sans-serif, system-ui, sans-serif;
        box-shadow: 0 14px 44px rgba(0,0,0,.42);
      }
      .toast[data-show="true"] { display: block; }
    </style>
    <div class="wrap">
      <section class="menu" aria-label="CTX actions">
        <button type="button" class="generate"><span class="icon">+</span><span>Generate Capsule</span></button>
        <button type="button" class="drop"><span class="icon">↵</span><span>Drop Capsule</span></button>
        <button type="button" class="open"><span class="icon">⌂</span><span>Open CTX</span></button>
        <p class="status">Local CTX memory</p>
      </section>
      <button type="button" class="launcher" title="CTX memory" aria-label="CTX memory">CTX</button>
      <div class="toast" role="status" aria-live="polite"></div>
    </div>
  `;

  const launcher = root.querySelector(".launcher") as HTMLButtonElement;
  const menu = root.querySelector(".menu") as HTMLElement;
  const toast = root.querySelector(".toast") as HTMLElement;
  const status = root.querySelector(".status") as HTMLElement;

  launcher.addEventListener("click", () => {
    menuOpen = !menuOpen;
    menu.dataset.open = String(menuOpen);
    if (menuOpen) void refreshStatus(status);
  });

  root.querySelector(".generate")?.addEventListener("click", async () => {
    menuOpen = false;
    menu.dataset.open = "false";
    if (!(await pingCtx())) {
      showToast(toast, "Start CTX on localhost:3000 first.");
      return;
    }
    showToast(toast, "Generating capsule...");
    try {
      const result = await captureCurrentContext();
      showToast(toast, result.ok ? "Capsule generated" : result.error ?? "Capture failed");
    } catch (error) {
      showToast(toast, error instanceof Error ? error.message : "Capture failed");
    }
  });

  root.querySelector(".drop")?.addEventListener("click", async () => {
    menuOpen = false;
    menu.dataset.open = "false";
    if (!(await pingCtx())) {
      showToast(toast, "Start CTX on localhost:3000 first.");
      return;
    }
    await openCapsulePicker(findPrompt(detectPlatform()));
  });

  root.querySelector(".open")?.addEventListener("click", async () => {
    menuOpen = false;
    menu.dataset.open = "false";
    window.open(await getCtxAppUrl(), "_blank", "noopener,noreferrer");
  });
}

function placeButton(host: HTMLElement) {
  const prompt = findPrompt(detectPlatform());
  const rect = prompt?.getBoundingClientRect();
  if (!rect || rect.width < 120 || rect.height < 24) {
    host.style.right = "20px";
    host.style.bottom = "86px";
    return;
  }
  host.style.right = `${Math.max(16, window.innerWidth - rect.right + 10)}px`;
  host.style.bottom = `${Math.max(18, window.innerHeight - rect.bottom + 10)}px`;
}

const promptSelectors: Record<Platform, string[]> = {
  chatgpt: [
    "#prompt-textarea",
    "[data-testid='composer-slate-editor']",
    "[contenteditable='true'][id='prompt-textarea']",
    "div.ProseMirror[contenteditable='true']",
    "div[role='textbox'][contenteditable='true']",
    "textarea"
  ],
  claude: ["div[contenteditable='true']", "div[role='textbox']", "textarea"],
  gemini: ["rich-textarea div[contenteditable='true']", "div[role='textbox']", "textarea", "[contenteditable='true']"],
  perplexity: ["textarea", "div[contenteditable='true']", "div[role='textbox']"],
  github: ["textarea[name='comment[body]']", "textarea", "[contenteditable='true']"],
  cursor: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  generic: ["textarea", "[contenteditable='true']", "div[role='textbox']"]
};

function findPrompt(platform: Platform): HTMLElement | null {
  const selectors = [...(promptSelectors[platform] ?? []), ...promptSelectors.generic];
  const seen = new Set<HTMLElement>();
  const candidates: HTMLElement[] = [];

  for (const selector of selectors) {
    for (const node of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
      if (seen.has(node)) continue;
      seen.add(node);
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      const visible = style.visibility !== "hidden" && style.display !== "none" && rect.width > 120 && rect.height > 18;
      const editable = node instanceof HTMLTextAreaElement || node instanceof HTMLInputElement || node.isContentEditable || node.getAttribute("role") === "textbox";
      if (visible && editable) candidates.push(node);
    }
  }

  return candidates.sort((a, b) => {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return br.bottom - ar.bottom || br.width * br.height - ar.width * ar.height;
  })[0] ?? null;
}

async function pingCtx(): Promise<boolean> {
  try {
    await requestCtxApi("/health");
    return true;
  } catch {
    return false;
  }
}

async function getCtxAppUrl(): Promise<string> {
  const response = await chrome.runtime.sendMessage({ type: "ctx:get-app-url" });
  if (!response?.ok) throw new Error(response?.error ?? "Could not read CTX URL.");
  return response.data;
}

async function requestCtxApi(path: string, options: { method?: string; body?: unknown } = {}) {
  const response = await chrome.runtime.sendMessage({
    type: "ctx:api-request",
    path,
    method: options.method,
    body: options.body
  });
  if (!response?.ok) throw new Error(response?.error ?? "CTX API request failed.");
  return response.data;
}

async function fetchCapsules(): Promise<Capsule[]> {
  return requestCtxApi("/capsules");
}

async function captureText(input: { title: string; text: string; url?: string; platform?: string }) {
  return requestCtxApi("/extension/capture", { method: "POST", body: input });
}

async function fetchInjectionPrompt(id: string, platform?: string): Promise<string> {
  const payload = await requestCtxApi(`/capsules/${encodeURIComponent(id)}/inject`, { method: "POST", body: { platform } });
  return payload.text;
}

async function captureCurrentContext() {
  const selection = window.getSelection()?.toString().trim();
  const text = selection || collectConversationText();
  if (!text.trim()) return { ok: false, error: "No visible context was found on this page." };
  const capsule = await captureText({
    title: document.title || "Captured AI context",
    text,
    url: location.href,
    platform: detectPlatform()
  });
  return { ok: true, capsule };
}

async function captureSelection() {
  const selection = window.getSelection()?.toString().trim();
  if (!selection) return { ok: false, error: "Select text on the page before capturing." };
  const capsule = await captureText({
    title: document.title || "Captured selection",
    text: selection,
    url: location.href,
    platform: detectPlatform()
  });
  return { ok: true, capsule };
}

async function capturePage() {
  const text = collectConversationText();
  const capsule = await captureText({
    title: document.title || "Captured page",
    text,
    url: location.href,
    platform: detectPlatform()
  });
  return { ok: true, capsule };
}

function collectConversationText() {
  const selectors = ["[data-message-author-role]", "[data-testid*='conversation']", "[data-testid*='message']", "article", ".markdown", "main"];
  const chunks: string[] = [];
  for (const selector of selectors) {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 16) continue;
      const text = node.innerText?.trim();
      if (text && text.length > 20 && !chunks.includes(text)) chunks.push(text);
    }
    if (chunks.join("\n\n").length > 2500) break;
  }
  const fallback = document.body?.innerText?.trim() ?? "";
  return (chunks.length ? chunks.join("\n\n") : fallback).slice(0, 30000);
}

async function openCapsulePicker(target: HTMLElement | null) {
  closeCapsulePicker();
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  host.style.right = "20px";
  host.style.bottom = "94px";
  document.documentElement.append(host);
  picker = host;

  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      :host { all: initial; color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      .panel { width: min(380px, calc(100vw - 32px)); max-height: min(560px, calc(100vh - 120px)); overflow: hidden; border: 1px solid #283044; border-radius: 14px; background: #111827; color: #e5e7eb; box-shadow: 0 24px 90px rgba(0,0,0,.52); }
      header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; border-bottom: 1px solid #283044; }
      h2 { margin: 0; font-size: 15px; font-weight: 800; }
      p { margin: 0; }
      button { font: inherit; border: 1px solid #283044; border-radius: 10px; background: #0b1020; color: #e5e7eb; cursor: pointer; }
      button:hover { border-color: rgba(139,245,207,.55); }
      button:focus-visible { outline: 2px solid #8bf5cf; outline-offset: 2px; }
      .actions { display: flex; align-items: center; gap: 8px; }
      .refresh { height: 32px; padding: 0 10px; color: #8bf5cf; font-size: 12px; font-weight: 800; }
      .close { width: 32px; height: 32px; }
      input { box-sizing: border-box; width: calc(100% - 32px); margin: 14px 16px; border: 1px solid #283044; border-radius: 12px; background: #050816; color: #fff; padding: 11px 12px; font: inherit; }
      .modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0 16px 12px; }
      .mode { height: 32px; font-size: 12px; font-weight: 800; color: #9ca3af; }
      .mode.active { border-color: rgba(139,245,207,.75); background: rgba(139,245,207,.12); color: #8bf5cf; }
      .list { max-height: 340px; overflow: auto; padding: 0 16px 16px; }
      .item { width: 100%; display: block; margin-top: 10px; padding: 12px; text-align: left; }
      .title { display: block; font-weight: 800; color: #fff; }
      .summary { display: block; margin-top: 5px; color: #9ca3af; font-size: 12px; line-height: 1.45; }
      .meta { display: block; margin-top: 8px; color: #8bf5cf; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
      .status { padding: 0 16px 16px; color: #9ca3af; font-size: 13px; line-height: 1.5; }
    </style>
    <section class="panel" role="dialog" aria-label="CTX capsules">
      <header>
        <div>
          <h2>Drop Capsule</h2>
          <p class="summary">Click a capsule to insert it into the chat.</p>
        </div>
        <div class="actions">
          <button class="refresh" aria-label="Refresh capsules">Refresh</button>
          <button class="close" aria-label="Close">x</button>
        </div>
      </header>
      <input type="search" aria-label="Search capsules" placeholder="Search capsules..." />
      <div class="modes" role="group" aria-label="Drop mode">
        <button class="mode active" data-mode="smart">Smart</button>
        <button class="mode" data-mode="brief">Brief</button>
        <button class="mode" data-mode="full">Full</button>
      </div>
      <div class="list"><p class="status">Loading capsules...</p></div>
    </section>
  `;

  root.querySelector(".close")?.addEventListener("click", closeCapsulePicker);
  root.querySelector(".refresh")?.addEventListener("click", () => void loadCapsules());
  const input = root.querySelector("input") as HTMLInputElement;
  const list = root.querySelector(".list") as HTMLDivElement;
  let capsules: Capsule[] = [];
  let mode: DropMode = "smart";

  await loadCapsules();
  input.addEventListener("input", () => renderFiltered());
  root.querySelectorAll<HTMLButtonElement>(".mode").forEach((button) => {
    button.addEventListener("click", () => {
      mode = (button.dataset.mode as DropMode) || "smart";
      root.querySelectorAll(".mode").forEach((modeButton) => modeButton.classList.toggle("active", modeButton === button));
      renderFiltered();
    });
  });

  async function loadCapsules() {
    renderStatus("Loading capsules...");
    try {
      capsules = await fetchCapsules();
      renderFiltered();
    } catch (error) {
      renderStatus(error instanceof Error ? error.message : "Could not load capsules. Keep CTX running on localhost:3000.");
    }
  }

  function renderFiltered() {
    const q = input.value.toLowerCase().trim();
    render(rankCapsules(capsules, q).map(({ capsule }) => capsule));
  }

  function renderStatus(message: string) {
    const status = document.createElement("p");
    status.className = "status";
    status.textContent = message;
    list.replaceChildren(status);
  }

  function render(capsulesToRender: Capsule[]) {
    list.innerHTML = "";
    if (!capsulesToRender.length) {
      renderStatus(input.value.trim() ? "No matching capsules." : "No capsules yet. Use Generate first.");
      return;
    }
    for (const capsule of capsulesToRender) {
      const button = document.createElement("button");
      button.className = "item";
      button.innerHTML = `<span class="title"></span><span class="summary"></span><span class="meta"></span>`;
      button.querySelector(".title")!.textContent = capsule.title;
      button.querySelector(".summary")!.textContent = capsule.summary || "Ready to drop into the prompt.";
      button.querySelector(".meta")!.textContent = capsuleMeta(capsule);
      button.addEventListener("click", () => void dropCapsule(capsule, target, button, mode));
      list.append(button);
    }
  }
}

function closeCapsulePicker() {
  picker?.remove();
  picker = null;
}

async function dropCapsule(capsule: Capsule, target: HTMLElement | null, button: HTMLButtonElement, mode: DropMode) {
  button.disabled = true;
  button.querySelector(".meta")!.textContent = "Preparing...";
  try {
    const prompt = await buildPromptForMode(capsule, mode);
    const inserted = target ? insertTextIntoPrompt(target, prompt) : false;
    if (!inserted) {
      await navigator.clipboard.writeText(prompt || formatCapsuleForPrompt(capsule));
      button.querySelector(".meta")!.textContent = "Copied";
      window.setTimeout(closeCapsulePicker, 650);
      return;
    }
    button.querySelector(".meta")!.textContent = "Dropped";
    window.setTimeout(closeCapsulePicker, 450);
  } catch (error) {
    button.disabled = false;
    button.querySelector(".meta")!.textContent = error instanceof Error ? error.message : "Drop failed";
  }
}

function insertTextIntoPrompt(target: HTMLElement, text: string) {
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    target.value = `${target.value.slice(0, start)}${text}${target.value.slice(end)}`;
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.focus();
    return true;
  }

  if (target.isContentEditable) {
    target.focus();
    document.execCommand("insertText", false, text);
    target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
    return true;
  }

  return false;
}

function searchable(capsule: Capsule) {
  return [
    capsule.title,
    capsule.summary,
    capsule.rawText,
    capsule.markdown,
    capsule.platform,
    Array.isArray(capsule.tags) ? capsule.tags.join(" ") : capsule.tags,
    capsule.project?.name
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function rankCapsules(capsules: Capsule[], query: string) {
  const sorted = [...capsules].sort((a, b) => newestTimestamp(b) - newestTimestamp(a));
  if (!query) return sorted.map((capsule) => ({ capsule, score: newestTimestamp(capsule) }));

  return sorted
    .map((capsule) => ({ capsule, score: scoreCapsule(capsule, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
}

function scoreCapsule(capsule: Capsule, query: string) {
  const haystack = searchable(capsule);
  const terms = expandTerms(query);
  let score = haystack.includes(query) ? 50 : 0;
  for (const term of terms) {
    if (haystack.includes(term)) score += term.length > 4 ? 12 : 8;
  }
  if (capsule.lastInjectedAt) score += 6;
  return score;
}

function expandTerms(query: string) {
  const aliases: Record<string, string[]> = {
    pr: ["pull", "review", "github"],
    bug: ["error", "failed", "fix", "debug"],
    drop: ["inject", "insert", "reuse"],
    ai: ["chatgpt", "claude", "gemini", "cursor"],
    project: ["workspace", "repo", "repository"]
  };
  const terms = query.match(/[a-z0-9]+/g) ?? [];
  return [...new Set(terms.flatMap((term) => [term, ...(aliases[term] ?? [])]))];
}

function newestTimestamp(capsule: Capsule) {
  const value = capsule.lastInjectedAt || capsule.updatedAt;
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

async function buildPromptForMode(capsule: Capsule, mode: DropMode) {
  if (mode === "brief") return formatBriefCapsuleForPrompt(capsule);
  if (mode === "full") return formatCapsuleForPrompt(capsule);

  try {
    return await fetchInjectionPrompt(capsule.id, detectPlatform());
  } catch {
    return formatCapsuleForPrompt(capsule);
  }
}

function formatBriefCapsuleForPrompt(capsule: Capsule) {
  return [
    "CTX memory:",
    `Title: ${capsule.title}`,
    capsule.project?.name ? `Project: ${capsule.project.name}` : "",
    capsule.summary ? `Summary: ${capsule.summary}` : "",
    capsule.markdown ? `Notes: ${capsule.markdown.slice(0, 1200)}` : "",
    "Use this memory to continue the work. Ask only if required details are missing."
  ]
    .filter(Boolean)
    .join("\n");
}

function formatCapsuleForPrompt(capsule: { title: string; summary?: string; rawText?: string; markdown?: string }) {
  return [
    "You are being given a CTX context capsule.",
    "",
    "Use this as background context. Do not simply repeat it. Continue the work based on this memory.",
    "",
    `# Capsule: ${capsule.title}`,
    capsule.summary ? `\n## Summary\n${capsule.summary}` : "",
    capsule.markdown ? `\n## Notes\n${capsule.markdown}` : "",
    capsule.rawText ? `\n## Raw Context\n${capsule.rawText}` : ""
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function capsuleMeta(capsule: Capsule) {
  const parts = [
    capsule.project?.name,
    capsule.platform || "ctx",
    capsule.tokenEstimate ? `${capsule.tokenEstimate} tokens` : "",
    capsule.lastInjectedAt ? "used before" : ""
  ].filter(Boolean);
  return parts.join(" / ");
}

async function refreshStatus(status: HTMLElement) {
  status.textContent = (await pingCtx()) ? "Connected to CTX" : "CTX app is not running";
}

function showToast(toast: HTMLElement, text: string) {
  toast.textContent = text;
  toast.dataset.show = "true";
  window.setTimeout(() => {
    toast.dataset.show = "false";
  }, 2200);
}
})();
