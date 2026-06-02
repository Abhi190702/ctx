(() => {
type Platform =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "perplexity"
  | "github"
  | "cursor"
  | "copilot"
  | "deepseek"
  | "grok"
  | "poe"
  | "mistral"
  | "meta"
  | "qwen"
  | "lovable"
  | "replit"
  | "emergent"
  | "v0"
  | "bolt"
  | "notebooklm"
  | "generic";

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

const launcherSize = 28;
const launcherGap = 8;
let buttonHost: HTMLElement | null = null;
let picker: HTMLElement | null = null;
let menuOpen = false;
const ctxWindow = window as Window & { __CTX_CONTENT_READY__?: boolean; __CTX_CONTENT_LISTENER_READY__?: boolean };

const promptSelectors: Record<Platform, string[]> = {
  chatgpt: [
    "#prompt-textarea",
    "[data-testid='composer-slate-editor']",
    "[contenteditable='true'][id='prompt-textarea']",
    "div.ProseMirror[contenteditable='true']",
    "div[role='textbox'][contenteditable='true']",
    "textarea"
  ],
  claude: [
    "[data-testid*='chat-input']",
    "[aria-label*='prompt' i]",
    "[aria-label*='message' i]",
    "div[contenteditable='true']",
    "div[role='textbox']",
    "textarea"
  ],
  gemini: [
    "rich-textarea div[contenteditable='true']",
    "rich-textarea",
    ".ql-editor",
    "[aria-label*='prompt' i]",
    "[aria-label*='message' i]",
    "div[role='textbox']",
    "textarea",
    "[contenteditable='true']"
  ],
  perplexity: ["textarea", "div[contenteditable='true']", "div[role='textbox']"],
  github: ["textarea[name='comment[body]']", "textarea", "[contenteditable='true']"],
  cursor: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  copilot: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  deepseek: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  grok: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  poe: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  mistral: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  meta: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  qwen: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  lovable: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  replit: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  emergent: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  v0: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  bolt: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  notebooklm: ["textarea", "[contenteditable='true']", "div[role='textbox']"],
  generic: ["textarea", "[contenteditable='true']", "div[role='textbox']"]
};

registerMessageListener();

if (ctxWindow.__CTX_CONTENT_READY__) {
  safeMountCtxButton();
  return;
}

ctxWindow.__CTX_CONTENT_READY__ = true;

const observer = new MutationObserver(() => safeMountCtxButton());
observer.observe(document.documentElement, { childList: true, subtree: true });
safeMountCtxButton();

function registerMessageListener() {
  if (ctxWindow.__CTX_CONTENT_LISTENER_READY__) return;
  ctxWindow.__CTX_CONTENT_LISTENER_READY__ = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "ctx:ping-content") {
      safeMountCtxButton();
      sendResponse({ ok: true });
      return false;
    }
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
}

function safeMountCtxButton() {
  try {
    mountCtxButton();
  } catch (error) {
    console.warn("CTX could not mount the launcher.", error);
  }
}

function detectPlatform(host = location.hostname): Platform {
  const normalized = host.toLowerCase();
  if (normalized.includes("chatgpt.com") || normalized.includes("chat.openai.com")) return "chatgpt";
  if (normalized.includes("claude.ai")) return "claude";
  if (normalized.includes("gemini.google.com")) return "gemini";
  if (normalized.includes("notebooklm.google.com")) return "notebooklm";
  if (normalized.includes("perplexity.ai")) return "perplexity";
  if (normalized.includes("github.com")) return "github";
  if (normalized.includes("cursor.com")) return "cursor";
  if (normalized.includes("copilot.microsoft.com")) return "copilot";
  if (normalized.includes("chat.deepseek.com")) return "deepseek";
  if (normalized.includes("grok.com")) return "grok";
  if (normalized.includes("poe.com")) return "poe";
  if (normalized.includes("chat.mistral.ai")) return "mistral";
  if (normalized.includes("www.meta.ai")) return "meta";
  if (normalized.includes("chat.qwen.ai")) return "qwen";
  if (normalized.includes("lovable.dev")) return "lovable";
  if (normalized.includes("replit.com")) return "replit";
  if (normalized.includes("app.emergent.sh")) return "emergent";
  if (normalized.includes("v0.dev")) return "v0";
  if (normalized.includes("bolt.new")) return "bolt";
  return "generic";
}

function mountCtxButton() {
  if (buttonHost?.isConnected) {
    placeButton(buttonHost);
    return;
  }

  const existingHost = document.querySelector<HTMLElement>("[data-ctx-extension='launcher']");
  if (existingHost?.isConnected) {
    buttonHost = existingHost;
    placeButton(existingHost);
    return;
  }

  const host = document.createElement("div");
  host.dataset.ctxExtension = "launcher";
  host.style.position = "fixed";
  host.style.left = `${window.innerWidth - launcherSize - 20}px`;
  host.style.top = `${window.innerHeight - launcherSize - 84}px`;
  host.style.width = `${launcherSize}px`;
  host.style.height = `${launcherSize}px`;
  host.style.zIndex = "2147483647";
  document.documentElement.append(host);
  buttonHost = host;
  placeButton(host);
  window.addEventListener("resize", () => placeButton(host), { passive: true });
  window.addEventListener("scroll", () => placeButton(host), { passive: true });

  const root = host.attachShadow({ mode: "open" });
  const markUrl = chrome.runtime.getURL("assets/ctx-mark.png");
  root.innerHTML = `
    <style>
      :host { all: initial; color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      .wrap { position: relative; display: flex; align-items: flex-end; gap: 10px; }
      .launcher {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        overflow: hidden;
        border: 1px solid rgba(139,245,207,.55);
        border-radius: 999px;
        background: radial-gradient(circle at 35% 22%, rgba(139,245,207,.20), rgba(5,8,18,.96) 58%);
        cursor: pointer;
        box-shadow: 0 5px 16px rgba(0,0,0,.28), 0 0 0 2px rgba(139,245,207,.06);
        transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease, filter 150ms ease;
      }
      .launcher:hover {
        border-color: rgba(139,245,207,.80);
        filter: brightness(1.05);
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(0,0,0,.34), 0 0 0 3px rgba(139,245,207,.09);
      }
      .launcher:focus-visible, .menu button:focus-visible { outline: 2px solid #5eead4; outline-offset: 2px; }
      .launcher img {
        width: 19px;
        height: 19px;
        display: block;
        object-fit: contain;
      }
      .fallback-label {
        display: none;
        color: #8bf5cf;
        font: 900 11px/1 ui-sans-serif, system-ui, sans-serif;
      }
      .launcher.fallback img { display: none; }
      .launcher.fallback .fallback-label { display: block; }
      .menu {
        position: absolute;
        right: 0;
        bottom: 36px;
        width: 216px;
        display: none;
        overflow: hidden;
        border: 1px solid #283044;
        border-radius: 14px;
        background: rgba(17,24,39,.96);
        box-shadow: 0 18px 62px rgba(0,0,0,.48);
        backdrop-filter: blur(14px);
      }
      .menu[data-open="true"] { display: block; }
      :host([data-platform="claude"]) .menu {
        bottom: auto;
        top: 36px;
      }
      :host([data-platform="claude"]) .toast {
        bottom: auto;
        top: 36px;
      }
      .menu button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 9px;
        border: 0;
        background: transparent;
        color: #e5e7eb;
        padding: 11px 13px;
        text-align: left;
        font: 740 13px/1.25 ui-sans-serif, system-ui, sans-serif;
        cursor: pointer;
      }
      .menu button:hover { background: rgba(255,255,255,.06); }
      .icon {
        width: 21px;
        height: 21px;
        display: grid;
        flex: 0 0 auto;
        place-items: center;
        border-radius: 8px;
        background: rgba(139,245,207,.10);
        color: #8bf5cf;
      }
      .icon svg {
        width: 14px;
        height: 14px;
        stroke: currentColor;
        stroke-width: 2.4;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .status {
        margin: 0;
        padding: 9px 13px 11px;
        border-top: 1px solid #283044;
        color: #9ca3af;
        font: 650 11px/1.4 ui-sans-serif, system-ui, sans-serif;
      }
      .toast {
        position: absolute;
        right: 0;
        bottom: 36px;
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
        <button type="button" class="generate"><span class="icon">${plusIcon()}</span><span>Generate Capsule</span></button>
        <button type="button" class="drop"><span class="icon">${dropIcon()}</span><span>Drop Capsule</span></button>
        <button type="button" class="open"><span class="icon">${openIcon()}</span><span>Open CTX</span></button>
        <p class="status">Local CTX memory</p>
      </section>
      <button type="button" class="launcher" title="CTX memory" aria-label="CTX memory">
        <img src="${markUrl}" alt="" />
        <span class="fallback-label">CTX</span>
      </button>
      <div class="toast" role="status" aria-live="polite"></div>
    </div>
  `;

  const launcher = root.querySelector(".launcher") as HTMLButtonElement;
  const menu = root.querySelector(".menu") as HTMLElement;
  const toast = root.querySelector(".toast") as HTMLElement;
  const status = root.querySelector(".status") as HTMLElement;
  const logo = root.querySelector(".launcher img") as HTMLImageElement;

  logo.addEventListener("error", () => launcher.classList.add("fallback"));
  logo.addEventListener("load", () => launcher.classList.remove("fallback"));

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
  const platform = detectPlatform();
  const prompt = findPrompt(platform);
  const composer = findComposer(platform, prompt);
  const anchor = composer ? findActionAnchor(composer, platform) : null;
  const position = anchor ?? fallbackPosition();
  host.dataset.platform = platform;

  host.style.left = `${Math.round(position.left)}px`;
  host.style.top = `${Math.round(position.top)}px`;
  host.style.right = "auto";
  host.style.bottom = "auto";
  host.style.width = `${launcherSize}px`;
  host.style.height = `${launcherSize}px`;
}

function plusIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
}

function dropIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v12M7 12l5 5 5-5M6 20h12"/></svg>';
}

function openIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h8v8M16 8 7 17"/></svg>';
}

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

function findComposer(platform: Platform, prompt: HTMLElement | null): DOMRect | null {
  if (prompt) {
    const promptRect = prompt.getBoundingClientRect();
    let node: HTMLElement | null = prompt;
    for (let depth = 0; node && depth < 10; depth++) {
      const rect = node.getBoundingClientRect();
      if (isComposerRect(rect, promptRect)) return rect;
      node = node.parentElement;
    }
  }

  return findComposerBySelector(platform);
}

function findComposerBySelector(platform: Platform): DOMRect | null {
  const selectors: Record<Platform, string[]> = {
    chatgpt: [
      "form[data-type='unified-composer']",
      "[data-testid='composer']",
      "[data-testid='composer-footer-actions']",
      "form"
    ],
    claude: ["[data-testid*='composer']", "[data-testid*='chat-input']", "fieldset", "form"],
    gemini: [
      "rich-textarea",
      "[data-test-id*='input']",
      "[data-testid*='input']",
      "form"
    ],
    perplexity: ["form", "[data-testid*='input']"],
    github: ["form", "textarea"],
    cursor: ["form", "textarea"],
    copilot: ["form", "textarea", "[contenteditable='true']"],
    deepseek: ["form", "textarea", "[contenteditable='true']"],
    grok: ["form", "textarea", "[contenteditable='true']"],
    poe: ["form", "textarea", "[contenteditable='true']"],
    mistral: ["form", "textarea", "[contenteditable='true']"],
    meta: ["form", "textarea", "[contenteditable='true']"],
    qwen: ["form", "textarea", "[contenteditable='true']"],
    lovable: ["form", "textarea", "[contenteditable='true']"],
    replit: ["form", "textarea", "[contenteditable='true']"],
    emergent: ["form", "textarea", "[contenteditable='true']"],
    v0: ["form", "textarea", "[contenteditable='true']"],
    bolt: ["form", "textarea", "[contenteditable='true']"],
    notebooklm: ["form", "textarea", "[contenteditable='true']"],
    generic: ["form", "textarea", "[contenteditable='true']"]
  };

  const candidates: DOMRect[] = [];
  for (const selector of [...(selectors[platform] ?? []), ...selectors.generic]) {
    for (const element of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
      const rect = element.getBoundingClientRect();
      if (isVisibleRect(rect) && rect.width > 220 && rect.height >= 40 && rect.height <= 240) candidates.push(rect);
    }
  }

  return candidates.sort((a, b) => {
    const bottomScore = b.bottom - a.bottom;
    if (Math.abs(bottomScore) > 20) return bottomScore;
    return b.width * b.height - a.width * a.height;
  })[0] ?? null;
}

function isComposerRect(rect: DOMRect, promptRect: DOMRect) {
  return (
    isVisibleRect(rect) &&
    rect.width >= Math.max(220, promptRect.width + 80) &&
    rect.height >= 44 &&
    rect.height <= 240 &&
    rect.bottom >= promptRect.bottom - 16 &&
    rect.top <= promptRect.top + 24
  );
}

function isVisibleRect(rect: DOMRect) {
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
}

function findActionAnchor(composer: DOMRect, platform: Platform) {
  const controls = findComposerControls(composer);
  const actionControls = findBottomActionControls(controls, composer, platform);
  const anchorControls = actionControls.length ? actionControls : controls;
  const left = findNativeActionSlot(anchorControls, composer, platform);
  const centerY = anchorControls.length ? medianControlCenterY(anchorControls) : composer.bottom - Math.min(30, composer.height / 2);
  const top = clamp(centerY - launcherSize / 2, composer.top + 6, composer.bottom - launcherSize - 6);
  return { left, top };
}

function findComposerControls(composer: DOMRect) {
  const controls = Array.from(document.querySelectorAll<HTMLElement>("button,[role='button'],select"))
    .map((element) => ({
      element,
      rect: element.getBoundingClientRect(),
      label: controlLabel(element)
    }))
    .filter(({ rect }) => {
      const centerX = horizontalCenter(rect);
      const centerY = verticalCenter(rect);
      return (
        isVisibleRect(rect) &&
        rect.width >= 18 &&
        rect.height >= 18 &&
        rect.width <= 180 &&
        rect.height <= 72 &&
        centerX >= composer.left &&
        centerX <= composer.right &&
        centerY >= composer.top &&
        centerY <= composer.bottom
      );
    })
    .sort((a, b) => a.rect.left - b.rect.left);

  return controls;
}

type ControlCandidate = ReturnType<typeof findComposerControls>[number];

function findBottomActionControls(controls: ControlCandidate[], composer: DOMRect, platform: Platform) {
  const threshold = composer.left + composer.width * rightControlThreshold(platform);
  const actionControls = controls.filter((control) => {
    const centerX = horizontalCenter(control.rect);
    return centerX >= threshold || isVoiceControl(control) || isModelControl(control);
  });
  if (!actionControls.length) return [];

  const rowFloor = composer.top + composer.height * bottomRowThreshold(platform);
  const maxCenterY = Math.max(...actionControls.map((control) => verticalCenter(control.rect)));
  const tolerance = bottomRowTolerance(platform);
  return actionControls
    .filter((control) => {
      const centerY = verticalCenter(control.rect);
      return centerY >= rowFloor && centerY >= maxCenterY - tolerance;
    })
    .sort((a, b) => a.rect.left - b.rect.left);
}

function findNativeActionSlot(controls: ControlCandidate[], composer: DOMRect, platform: Platform) {
  const bounds = {
    left: composer.left + composerPadding(platform),
    right: composer.right - composerPadding(platform)
  };
  if (!controls.length) return clamp(composer.right - fallbackInsetForPlatform(platform), bounds.left, bounds.right - launcherSize);

  const sorted = controls
    .filter((control) => {
      const centerX = horizontalCenter(control.rect);
      return centerX >= composer.left && centerX <= composer.right;
    })
    .sort((a, b) => a.rect.left - b.rect.left);
  if (!sorted.length) return clamp(composer.right - fallbackInsetForPlatform(platform), bounds.left, bounds.right - launcherSize);

  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const control = sorted[index];
    const next = sorted[index + 1];
    const rightLimit = next ? next.rect.left - launcherGap : bounds.right;
    const left = control.rect.right + launcherGap;
    if (left + launcherSize <= rightLimit) return clamp(left, bounds.left, bounds.right - launcherSize);
  }

  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const control = sorted[index];
    const previous = sorted[index - 1];
    const leftLimit = previous ? previous.rect.right + launcherGap : bounds.left;
    const left = control.rect.left - launcherGap - launcherSize;
    if (left >= leftLimit) return clamp(left, bounds.left, bounds.right - launcherSize);
  }

  const voiceControl = findFirstVoiceControl(sorted);
  const fallbackLeft = (voiceControl?.rect.left ?? sorted[sorted.length - 1].rect.left) - launcherGap - launcherSize;
  return clamp(fallbackLeft, bounds.left, bounds.right - launcherSize);
}

function findFirstVoiceControl(controls: ControlCandidate[]) {
  return controls.find((control) => isVoiceControl(control)) ?? controls.at(-1) ?? null;
}

function isVoiceControl(control: ControlCandidate) {
  const label = control.label;
  if (/\b(mic|microphone|voice|audio|dictate|speak|send|submit|arrow)\b/.test(label)) return true;
  const circular = Math.abs(control.rect.width - control.rect.height) <= 14;
  return circular && control.rect.width <= 58;
}

function isModelControl(control: ControlCandidate) {
  return /\b(pro|flash|sonnet|opus|haiku|gpt|model|low|medium|high|thinking|reasoning|auto)\b/.test(control.label);
}

function controlLabel(element: HTMLElement) {
  return [
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.getAttribute("data-testid"),
    element.textContent
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function bottomRowThreshold(platform: Platform) {
  if (platform === "chatgpt") return 0.46;
  if (platform === "claude") return 0.58;
  if (platform === "gemini") return 0.62;
  return 0.52;
}

function rightControlThreshold(platform: Platform) {
  if (platform === "gemini") return 0.46;
  if (platform === "claude") return 0.56;
  return 0.52;
}

function bottomRowTolerance(platform: Platform) {
  if (platform === "claude") return 28;
  if (platform === "gemini") return 26;
  return 24;
}

function composerPadding(platform: Platform) {
  if (platform === "chatgpt") return 10;
  if (platform === "gemini") return 12;
  if (platform === "claude") return 14;
  return 10;
}

function fallbackInsetForPlatform(platform: Platform) {
  if (platform === "chatgpt") return 142;
  if (platform === "gemini") return 142;
  if (platform === "claude") return 150;
  return 118;
}

function fallbackPosition() {
  return {
    left: Math.max(16, window.innerWidth - launcherSize - 22),
    top: Math.max(16, window.innerHeight - launcherSize - 92)
  };
}

function horizontalCenter(rect: DOMRect) {
  return rect.left + rect.width / 2;
}

function verticalCenter(rect: DOMRect) {
  return rect.top + rect.height / 2;
}

function medianControlCenterY(controls: ControlCandidate[]) {
  const centers = controls.map((control) => verticalCenter(control.rect)).sort((a, b) => a - b);
  return centers[Math.floor(centers.length / 2)] ?? 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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
