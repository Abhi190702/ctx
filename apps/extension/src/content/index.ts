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

type InsertPosition = "before" | "after";

type PlatformToolbarConfig = {
  toolbarSelectors: string[];
  refSelectors: string[];
  insertPosition: InsertPosition;
};

type TokenUsageTotals = {
  daily: number;
  weekly: number;
};

type TokenUsageStore = {
  dailyKey: string;
  weeklyKey: string;
  platforms: Record<string, TokenUsageTotals>;
};

const CTX_BUTTON_ID = "ctx-patchpilot-btn";
const CTX_SHELL_ID = "ctx-patchpilot-shell";
const CTX_WELCOME_ID = "ctx-patchpilot-welcome";
const CTX_USAGE_METER_ID = "ctx-token-usage-meter";
const LEGACY_LAUNCHER_SELECTOR = "[data-ctx-extension='launcher']:not(#ctx-patchpilot-shell)";
const TOKEN_USAGE_STORAGE_KEY = "ctxTokenUsage";
const defaultLauncherSize = 26;
const defaultDailyTokenLimit = 50000;
const defaultWeeklyTokenLimit = 300000;
const defaultWelcomeMessages = [
  "Your AI needs context",
  "Drop memory before you prompt",
  "Bring yesterday into this chat",
  "Capture now, reuse later",
  "Let CTX carry the context",
  "Use a capsule, skip the recap",
  "Keep the work moving"
];
let injectionObserver: MutationObserver | null = null;
let fallbackTimer: number | null = null;
let retryTimer: number | null = null;
let quickRetryTimer: number | null = null;
let retryAttempts = 0;
let quickRetryAttempts = 0;
let mountAttemptFrame = 0;
let lastUrl = location.href;
let picker: HTMLElement | null = null;
let welcomeAnchor: HTMLElement | null = null;
let welcomeHost: HTMLElement | null = null;
let welcomeTimer: number | null = null;
let usageMeterAnchor: HTMLElement | null = null;
let usageMeterHost: HTMLElement | null = null;
let usageRefreshTimer: number | null = null;
let usageUpdateFrame = 0;
let usageRefreshTicks = 0;
let lastTokenRecordSignature = "";
let lastTokenRecordAt = 0;
const usageTrackedElements = new WeakSet<HTMLElement>();
let menuOpen = false;
const ctxWindow = window as Window & {
  __CTX_CONTENT_READY__?: boolean;
  __CTX_CONTENT_LISTENER_READY__?: boolean;
  __CTX_NAVIGATION_WATCHER_READY__?: boolean;
};

const genericToolbarConfig: PlatformToolbarConfig = {
  toolbarSelectors: [
    "form div:has(button)",
    "form div:has([role='button'])",
    "[role='textbox'] ~ div",
    "textarea ~ div",
    "div:has(> button[aria-label*='send' i])",
    "div:has(> button[aria-label*='voice' i])",
    "div:has(> button[aria-label*='mic' i])"
  ],
  refSelectors: [
    "button[aria-label*='microphone' i]",
    "button[aria-label*='mic' i]",
    "button[aria-label*='voice' i]",
    "button[aria-label*='audio' i]",
    "button[aria-label*='send' i]",
    "button[type='submit']",
    "[role='button'][aria-label*='send' i]",
    "[role='button'][aria-label*='voice' i]"
  ],
  insertPosition: "before"
};

const PLATFORM_CONFIG: Record<string, PlatformToolbarConfig> = {
  "chat.openai.com": {
    toolbarSelectors: [
      "form[data-type='unified-composer'] [data-testid='composer-footer-actions']",
      "form[data-type='unified-composer'] div:has(> button[data-testid='composer-speech-button'])",
      "form[data-type='unified-composer'] div:has(> button[aria-label*='dictate' i])",
      "form[data-type='unified-composer'] div:has(> button[data-testid='send-button'])",
      "[data-testid='composer'] div:has(> button[aria-label*='voice' i])",
      "[data-testid='composer'] div:has(> button[data-testid='send-button'])"
    ],
    refSelectors: [
      "button[aria-label*='dictate' i]",
      "button[aria-label*='microphone' i]",
      "button[aria-label*='mic' i]",
      "button[aria-label*='voice' i]",
      "button[data-testid='composer-speech-button']",
      "button[data-testid='send-button']",
      "button[aria-label*='send' i]"
    ],
    insertPosition: "before"
  },
  "chatgpt.com": {
    toolbarSelectors: [
      "form[data-type='unified-composer'] [data-testid='composer-footer-actions']",
      "form[data-type='unified-composer'] div:has(> button[data-testid='composer-speech-button'])",
      "form[data-type='unified-composer'] div:has(> button[aria-label*='dictate' i])",
      "form[data-type='unified-composer'] div:has(> button[data-testid='send-button'])",
      "[data-testid='composer'] div:has(> button[aria-label*='voice' i])",
      "[data-testid='composer'] div:has(> button[data-testid='send-button'])"
    ],
    refSelectors: [
      "button[aria-label*='dictate' i]",
      "button[aria-label*='microphone' i]",
      "button[aria-label*='mic' i]",
      "button[aria-label*='voice' i]",
      "button[data-testid='composer-speech-button']",
      "button[data-testid='send-button']",
      "button[aria-label*='send' i]"
    ],
    insertPosition: "before"
  },
  "gemini.google.com": {
    toolbarSelectors: [
      ".input-area-container .trailing-actions",
      ".input-area-container div:has(> voice-input-toggle)",
      ".input-area-container div:has(> button[aria-label*='microphone' i])",
      ".input-area-container div:has(> button[aria-label*='voice' i])",
      "div:has(> button[aria-label*='Ask Gemini' i])",
      "div:has(> voice-input-toggle)"
    ],
    refSelectors: [
      "button[aria-label*='microphone' i]",
      "button[aria-label*='mic' i]",
      "button[aria-label*='voice' i]",
      "voice-input-toggle",
      "button[aria-label*='send' i]",
      "button[aria-label*='submit' i]"
    ],
    insertPosition: "before"
  },
  "claude.ai": {
    toolbarSelectors: [
      "[data-testid*='composer'] div:has(> button[aria-label*='mic' i])",
      "[data-testid*='composer'] div:has(> button[aria-label*='voice' i])",
      "[data-testid*='chat-input'] div:has(> button[aria-label*='mic' i])",
      "fieldset div:has(> button[aria-label*='mic' i])",
      "fieldset div:has(> button[aria-label*='voice' i])",
      "form div:has(> button[aria-label*='mic' i])"
    ],
    refSelectors: [
      "button[aria-label*='microphone' i]",
      "button[aria-label*='mic' i]",
      "button[aria-label*='voice' i]",
      "button[aria-label*='audio' i]",
      "button[aria-label*='send' i]",
      "button[type='submit']"
    ],
    insertPosition: "before"
  },
  "replit.com": {
    toolbarSelectors: [
      "[data-cy*='ai'] div:has(> button)",
      "[data-testid*='ai'] div:has(> button)",
      "form div:has(> button[aria-label*='send' i])",
      "form div:has(> button[aria-label*='voice' i])"
    ],
    refSelectors: genericToolbarConfig.refSelectors,
    insertPosition: "before"
  },
  "perplexity.ai": genericToolbarConfig,
  "www.perplexity.ai": genericToolbarConfig,
  "notebooklm.google.com": genericToolbarConfig,
  "chat.deepseek.com": genericToolbarConfig,
  "grok.com": genericToolbarConfig,
  "poe.com": genericToolbarConfig,
  "chat.mistral.ai": genericToolbarConfig,
  "copilot.microsoft.com": genericToolbarConfig,
  "www.meta.ai": genericToolbarConfig,
  "chat.qwen.ai": genericToolbarConfig,
  "qwen.ai": genericToolbarConfig,
  "www.qwen.ai": genericToolbarConfig,
  "lovable.dev": genericToolbarConfig,
  "app.emergent.sh": genericToolbarConfig,
  "v0.dev": genericToolbarConfig,
  "bolt.new": genericToolbarConfig,
  "cursor.com": genericToolbarConfig,
  "github.com": {
    toolbarSelectors: ["form div:has(> button[type='submit'])", "form div:has(> button)", "form"],
    refSelectors: ["button[type='submit']", "button[aria-label*='comment' i]", "button"],
    insertPosition: "before"
  }
};

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

installNavigationWatcher();
startInjectionWatcher();
safeMountCtxButton();

function registerMessageListener() {
  if (ctxWindow.__CTX_CONTENT_LISTENER_READY__) return;
  ctxWindow.__CTX_CONTENT_LISTENER_READY__ = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "ctx:ping-content") {
      const injected = safeMountCtxButton();
      if (!injected) startInjectionWatcher();
      sendResponse({ ok: true, injected });
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
    return mountCtxButton();
  } catch (error) {
    console.warn("CTX could not mount the launcher.", error);
    return false;
  }
}

function installNavigationWatcher() {
  if (ctxWindow.__CTX_NAVIGATION_WATCHER_READY__) return;
  ctxWindow.__CTX_NAVIGATION_WATCHER_READY__ = true;

  window.addEventListener("popstate", scheduleNavigationReset, { passive: true });
  window.addEventListener("hashchange", scheduleNavigationReset, { passive: true });
  window.addEventListener("resize", repositionWelcomeMessage, { passive: true });
  window.addEventListener("scroll", repositionWelcomeMessage, { passive: true, capture: true });
  window.addEventListener("resize", repositionUsageMeter, { passive: true });
  window.addEventListener("scroll", repositionUsageMeter, { passive: true, capture: true });

  const originalPushState = history.pushState.bind(history);
  history.pushState = ((...args: Parameters<History["pushState"]>) => {
    const result = originalPushState(...args);
    scheduleNavigationReset();
    return result;
  }) as History["pushState"];

  const originalReplaceState = history.replaceState.bind(history);
  history.replaceState = ((...args: Parameters<History["replaceState"]>) => {
    const result = originalReplaceState(...args);
    scheduleNavigationReset();
    return result;
  }) as History["replaceState"];
}

function scheduleNavigationReset() {
  window.setTimeout(() => {
    if (lastUrl === location.href) return;
    lastUrl = location.href;
    resetInjectionState();
  }, 80);
}

function resetInjectionState() {
  stopInjectionWatcher();
  hideWelcomeMessage();
  stopUsageMeter();
  document.getElementById(CTX_BUTTON_ID)?.closest(`#${CTX_SHELL_ID}`)?.remove();
  menuOpen = false;
  startInjectionWatcher();
  safeMountCtxButton();
}

function startInjectionWatcher() {
  if (document.getElementById(CTX_BUTTON_ID)) {
    stopInjectionWatcher();
    return;
  }

  if (!document.body) {
    window.setTimeout(startInjectionWatcher, 100);
    return;
  }

  injectionObserver?.disconnect();
  injectionObserver = new MutationObserver(() => {
    scheduleMountAttempt();
  });
  injectionObserver.observe(document.body, { childList: true, subtree: true });
  scheduleMountAttempt();
  startQuickRetryLoop();

  if (fallbackTimer) window.clearTimeout(fallbackTimer);
  fallbackTimer = window.setTimeout(() => {
    fallbackTimer = null;
    if (!document.getElementById(CTX_BUTTON_ID)) startRetryLoop();
  }, 3500);
}

function scheduleMountAttempt() {
  if (mountAttemptFrame) return;
  mountAttemptFrame = window.requestAnimationFrame(() => {
    mountAttemptFrame = 0;
    if (safeMountCtxButton()) stopInjectionWatcher();
  });
}

function startQuickRetryLoop() {
  if (quickRetryTimer) return;
  quickRetryAttempts = 0;
  quickRetryTimer = window.setInterval(() => {
    quickRetryAttempts += 1;
    if (safeMountCtxButton() || quickRetryAttempts >= 24) {
      if (quickRetryTimer) {
        window.clearInterval(quickRetryTimer);
        quickRetryTimer = null;
      }
    }
  }, 140);
}

function startRetryLoop() {
  if (retryTimer) return;
  retryAttempts = 0;
  retryTimer = window.setInterval(() => {
    retryAttempts += 1;
    if (safeMountCtxButton() || retryAttempts >= 30) stopInjectionWatcher();
  }, 500);
}

function stopInjectionWatcher() {
  injectionObserver?.disconnect();
  injectionObserver = null;
  if (mountAttemptFrame) {
    window.cancelAnimationFrame(mountAttemptFrame);
    mountAttemptFrame = 0;
  }
  if (fallbackTimer) {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
  if (quickRetryTimer) {
    window.clearInterval(quickRetryTimer);
    quickRetryTimer = null;
  }
  if (retryTimer) {
    window.clearInterval(retryTimer);
    retryTimer = null;
  }
  retryAttempts = 0;
  quickRetryAttempts = 0;
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
  if (normalized.includes("qwen.ai")) return "qwen";
  if (normalized.includes("lovable.dev")) return "lovable";
  if (normalized.includes("replit.com")) return "replit";
  if (normalized.includes("app.emergent.sh")) return "emergent";
  if (normalized.includes("v0.dev")) return "v0";
  if (normalized.includes("bolt.new")) return "bolt";
  return "generic";
}

function mountCtxButton() {
  cleanupLegacyLaunchers();

  const slot = findToolbarSlot();
  const existingButton = document.getElementById(CTX_BUTTON_ID) as HTMLButtonElement | null;
  const existingShell = existingButton?.closest<HTMLElement>(`#${CTX_SHELL_ID}`) ?? null;

  if (existingButton?.isConnected && existingShell?.isConnected) {
    if (slot) {
      insertLauncherShell(existingShell, slot);
      syncLauncherMetrics(existingShell, existingButton, slot.refElement);
      startUsageMeter(slot);
    }
    stopInjectionWatcher();
    return true;
  }

  if (!slot) return false;

  const shell = createLauncherShell(slot.refElement);
  insertLauncherShell(shell, slot);
  startUsageMeter(slot);
  stopInjectionWatcher();
  return true;
}

function createLauncherShell(refElement: HTMLElement) {
  const shell = document.createElement("span");
  shell.id = CTX_SHELL_ID;
  shell.dataset.ctxExtension = "launcher";
  const markUrl = chrome.runtime.getURL("assets/ctx-mark.png");
  shell.innerHTML = `
    <style>
      #${CTX_SHELL_ID} {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 auto !important;
        flex-shrink: 0 !important;
        position: relative !important;
        width: auto !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        vertical-align: middle !important;
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }
      #${CTX_SHELL_ID}[data-platform="deepseek"] {
        margin: 0 7px !important;
      }
      #${CTX_BUTTON_ID} {
        all: unset;
        position: static !important;
        width: var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) !important;
        height: var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) !important;
        min-width: var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) !important;
        min-height: var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) !important;
        max-width: var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) !important;
        max-height: var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 auto !important;
        flex-shrink: 0 !important;
        margin: 0 2px !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        vertical-align: middle !important;
        overflow: hidden;
        border: 1px solid rgba(139,245,207,.58);
        border-radius: var(--ctx-toolbar-button-radius, 999px);
        background: radial-gradient(circle at 35% 22%, rgba(139,245,207,.20), rgba(5,8,18,.96) 58%);
        color: #8bf5cf;
        cursor: pointer;
        box-shadow: 0 5px 16px rgba(0,0,0,.28), 0 0 0 2px rgba(139,245,207,.06);
        transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease, filter 150ms ease;
      }
      #${CTX_BUTTON_ID}:hover {
        border-color: rgba(139,245,207,.84);
        filter: brightness(1.05);
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(0,0,0,.34), 0 0 0 3px rgba(139,245,207,.09);
      }
      #${CTX_BUTTON_ID}:focus-visible, #${CTX_SHELL_ID} .menu button:focus-visible {
        outline: 2px solid #5eead4;
        outline-offset: 2px;
      }
      #${CTX_BUTTON_ID} img {
        width: calc(var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) * .68);
        height: calc(var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) * .68);
        display: block;
        object-fit: contain;
      }
      #${CTX_BUTTON_ID} .fallback-label {
        display: none;
        color: #8bf5cf;
        font: 900 10px/1 ui-sans-serif, system-ui, sans-serif;
      }
      #${CTX_BUTTON_ID}.fallback img { display: none; }
      #${CTX_BUTTON_ID}.fallback .fallback-label { display: block; }
      #${CTX_SHELL_ID} .menu {
        position: absolute;
        right: 0;
        bottom: calc(var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) + 8px);
        width: 216px;
        display: none;
        overflow: hidden;
        border: 1px solid #283044;
        border-radius: 14px;
        background: rgba(17,24,39,.96);
        box-shadow: 0 18px 62px rgba(0,0,0,.48);
        backdrop-filter: blur(14px);
        z-index: 2147483647;
      }
      #${CTX_SHELL_ID} .menu[data-open="true"] { display: block; }
      #${CTX_SHELL_ID}[data-platform="claude"] .menu {
        bottom: auto;
        top: calc(var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) + 8px);
      }
      #${CTX_SHELL_ID}[data-platform="claude"] .toast {
        bottom: auto;
        top: calc(var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) + 8px);
      }
      #${CTX_SHELL_ID} .menu button {
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
      #${CTX_SHELL_ID} .menu button:hover { background: rgba(255,255,255,.06); }
      #${CTX_SHELL_ID} .icon {
        width: 21px;
        height: 21px;
        display: grid;
        flex: 0 0 auto;
        place-items: center;
        border-radius: 8px;
        background: rgba(139,245,207,.10);
        color: #8bf5cf;
      }
      #${CTX_SHELL_ID} .icon svg {
        width: 14px;
        height: 14px;
        stroke: currentColor;
        stroke-width: 2.4;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      #${CTX_SHELL_ID} .status {
        margin: 0;
        padding: 9px 13px 11px;
        border-top: 1px solid #283044;
        color: #9ca3af;
        font: 650 11px/1.4 ui-sans-serif, system-ui, sans-serif;
      }
      #${CTX_SHELL_ID} .toast {
        position: absolute;
        right: 0;
        bottom: calc(var(--ctx-toolbar-button-size, ${defaultLauncherSize}px) + 8px);
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
        z-index: 2147483647;
      }
      #${CTX_SHELL_ID} .toast[data-show="true"] { display: block; }
    </style>
    <button type="button" id="${CTX_BUTTON_ID}" title="CTX memory" aria-label="CTX memory">
      <img src="${markUrl}" alt="" />
      <span class="fallback-label">CTX</span>
    </button>
    <section class="menu" aria-label="CTX actions">
      <button type="button" class="generate"><span class="icon">${plusIcon()}</span><span>Generate Capsule</span></button>
      <button type="button" class="drop"><span class="icon">${dropIcon()}</span><span>Drop Capsule</span></button>
      <button type="button" class="open"><span class="icon">${openIcon()}</span><span>Open CTX</span></button>
      <p class="status">Local CTX memory</p>
    </section>
    <div class="toast" role="status" aria-live="polite"></div>
  `;

  const launcher = shell.querySelector(`#${CTX_BUTTON_ID}`) as HTMLButtonElement;
  const menu = shell.querySelector(".menu") as HTMLElement;
  const toast = shell.querySelector(".toast") as HTMLElement;
  const status = shell.querySelector(".status") as HTMLElement;
  const logo = shell.querySelector(`#${CTX_BUTTON_ID} img`) as HTMLImageElement;

  syncLauncherMetrics(shell, launcher, refElement);
  void showWelcomeMessage(launcher, 5200);

  logo.addEventListener("error", () => launcher.classList.add("fallback"));
  logo.addEventListener("load", () => launcher.classList.remove("fallback"));
  launcher.addEventListener("mouseenter", () => void showWelcomeMessage(launcher, 2400));

  launcher.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    hideWelcomeMessage();
    menuOpen = !menuOpen;
    menu.dataset.open = String(menuOpen);
    if (menuOpen) void refreshStatus(status);
  });

  shell.querySelector(".generate")?.addEventListener("click", async () => {
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

  shell.querySelector(".drop")?.addEventListener("click", async () => {
    menuOpen = false;
    menu.dataset.open = "false";
    if (!(await pingCtx())) {
      showToast(toast, "Start CTX on localhost:3000 first.");
      return;
    }
    await openCapsulePicker(findPrompt(detectPlatform()));
  });

  shell.querySelector(".open")?.addEventListener("click", async () => {
    menuOpen = false;
    menu.dataset.open = "false";
    window.open(await getCtxAppUrl(), "_blank", "noopener,noreferrer");
  });

  return shell;
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

type ToolbarSlot = {
  toolbar: HTMLElement;
  refElement: HTMLElement;
  insertPosition: InsertPosition;
};

function findToolbarSlot(): ToolbarSlot | null {
  const platform = detectPlatform();
  const config = getToolbarConfig();

  if (platform === "copilot") {
    return findSlotFromComposerControls(platform) ?? findSlotFromReferences(config) ?? findSlotFromToolbars(config);
  }

  return (
    findSlotFromReferences(config) ??
    findSlotFromToolbars(config) ??
    findSlotFromComposerControls(platform) ??
    findSlotFromReferences(genericToolbarConfig) ??
    findSlotFromToolbars(genericToolbarConfig)
  );
}

function getToolbarConfig(host = location.hostname) {
  const normalized = host.toLowerCase();
  const exact = PLATFORM_CONFIG[normalized];
  if (exact) return exact;

  const suffixMatch = Object.entries(PLATFORM_CONFIG).find(([hostname]) => normalized.endsWith(`.${hostname}`));
  return suffixMatch?.[1] ?? genericToolbarConfig;
}

function findSlotFromToolbars(config: PlatformToolbarConfig): ToolbarSlot | null {
  for (const toolbarSelector of config.toolbarSelectors) {
    for (const toolbar of queryVisibleElements(toolbarSelector)) {
      if (isInsideCtxLauncher(toolbar)) continue;
      const refElement = findReferenceElement(toolbar, config.refSelectors) ?? findReferenceElement(toolbar, genericToolbarConfig.refSelectors);
      if (!refElement) continue;
      return normalizeToolbarSlot(toolbar, refElement, config.insertPosition);
    }
  }
  return null;
}

function findSlotFromReferences(config: PlatformToolbarConfig): ToolbarSlot | null {
  for (const refSelector of config.refSelectors) {
    for (const refElement of queryVisibleElements(refSelector)) {
      if (isInsideCtxLauncher(refElement)) continue;
      const toolbar = findToolbarForReference(refElement, config);
      if (!toolbar) continue;
      return normalizeToolbarSlot(toolbar, refElement, config.insertPosition);
    }
  }
  return null;
}

function findReferenceElement(toolbar: HTMLElement, refSelectors: string[]) {
  for (const refSelector of refSelectors) {
    if (matchesSelector(toolbar, refSelector) && isVisibleElement(toolbar)) return toolbar;
    const refElement = queryVisibleElements(refSelector, toolbar).find((element) => !isInsideCtxLauncher(element));
    if (refElement) return refElement;
  }
  return null;
}

function findToolbarForReference(refElement: HTMLElement, config: PlatformToolbarConfig) {
  let node: HTMLElement | null = refElement.parentElement;
  for (let depth = 0; node && depth < 8; depth += 1) {
    if (isInsideCtxLauncher(node)) return null;
    if (config.toolbarSelectors.some((selector) => matchesSelector(node!, selector)) && isUsableToolbar(node)) return node;
    if (isUsableToolbar(node)) return node;
    node = node.parentElement;
  }
  return refElement.parentElement;
}

function findSlotFromComposerControls(platform: Platform): ToolbarSlot | null {
  const prompt = findPrompt(platform);
  if (!prompt) return null;

  const composer = findComposerElement(prompt);
  if (!composer) return null;

  const promptRect = prompt.getBoundingClientRect();
  const composerRect = composer.getBoundingClientRect();
  const controls = queryVisibleElements("button,[role='button'],select,voice-input-toggle", composer)
    .filter((control) => !isInsideCtxLauncher(control) && !isEditableControl(control))
    .filter((control) => {
      const rect = control.getBoundingClientRect();
      return (
        rect.width >= 18 &&
        rect.height >= 18 &&
        rect.width <= 180 &&
        rect.height <= 80 &&
        rect.bottom >= promptRect.top &&
        rect.top <= composerRect.bottom &&
        rect.left >= composerRect.left - 4 &&
        rect.right <= composerRect.right + 4
      );
    });

  const refElement = chooseComposerReference(controls, composerRect);
  if (!refElement) return null;

  if (platform === "copilot") {
    return { toolbar: refElement.parentElement ?? composer, refElement, insertPosition: "before" };
  }

  return normalizeToolbarSlot(refElement.parentElement ?? composer, refElement, "before");
}

function findComposerElement(prompt: HTMLElement) {
  const promptRect = prompt.getBoundingClientRect();
  let node: HTMLElement | null = prompt;

  for (let depth = 0; node && depth < 10; depth += 1) {
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    const hasControls = Boolean(node.querySelector("button,[role='button'],select,voice-input-toggle"));
    const looksLikeComposer =
      isVisibleRect(rect) &&
      hasControls &&
      rect.width >= Math.max(240, promptRect.width) &&
      rect.height >= Math.max(44, promptRect.height) &&
      rect.height <= 260 &&
      rect.bottom >= promptRect.bottom - 4 &&
      style.display !== "contents";

    if (looksLikeComposer) return node;
    node = node.parentElement;
  }

  return prompt.parentElement;
}

function chooseComposerReference(controls: HTMLElement[], composerRect: DOMRect) {
  if (!controls.length) return null;

  const maxBottom = Math.max(...controls.map((control) => control.getBoundingClientRect().bottom));
  const bottomRow = controls.filter((control) => control.getBoundingClientRect().bottom >= maxBottom - 32);
  const rightSide = bottomRow.filter((control) => {
    const rect = control.getBoundingClientRect();
    return rect.left >= composerRect.left + composerRect.width * 0.48;
  });
  const candidates = rightSide.length ? rightSide : bottomRow;

  return candidates.sort((a, b) => {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    const aLabel = controlText(a);
    const bLabel = controlText(b);
    return controlPriority(bLabel) - controlPriority(aLabel) || br.left - ar.left;
  })[0] ?? null;
}

function controlText(element: HTMLElement) {
  return [
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.getAttribute("data-testid"),
    element.textContent
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function controlPriority(label: string) {
  if (/\b(microphone|mic|dictate|voice|audio)\b/.test(label)) return 6;
  if (/\b(send|submit|arrow)\b/.test(label)) return 5;
  if (/\b(upload|attach|file|paperclip|plus)\b/.test(label)) return 3;
  return 1;
}

function isEditableControl(element: HTMLElement) {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element.isContentEditable || element.getAttribute("role") === "textbox";
}

function normalizeToolbarSlot(toolbar: HTMLElement, refElement: HTMLElement, insertPosition: InsertPosition): ToolbarSlot {
  let target = refElement;
  let parent = target.parentElement;

  for (let depth = 0; parent && depth < 7; depth += 1) {
    if (isInsideCtxLauncher(parent)) break;
    if (isHorizontalToolbarParent(parent, target)) {
      return { toolbar: parent, refElement: target, insertPosition };
    }
    target = parent;
    parent = target.parentElement;
  }

  return { toolbar, refElement, insertPosition };
}

function isHorizontalToolbarParent(parent: HTMLElement, target: HTMLElement) {
  const parentRect = parent.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (!isVisibleRect(parentRect) || !isVisibleRect(targetRect) || parentRect.height > 104 || parentRect.width < targetRect.width + 18) return false;

  const style = window.getComputedStyle(parent);
  const children = Array.from(parent.children).filter((child): child is HTMLElement => {
    return child instanceof HTMLElement && !isInsideCtxLauncher(child) && isVisibleElement(child);
  });
  const rowChildren = children.filter((child) => {
    const rect = child.getBoundingClientRect();
    return Math.abs(verticalCenter(rect) - verticalCenter(targetRect)) <= Math.max(14, Math.min(parentRect.height / 2, 28));
  });
  const horizontalSpread = rowChildren.reduce((spread, child) => {
    const rect = child.getBoundingClientRect();
    return {
      left: Math.min(spread.left, rect.left),
      right: Math.max(spread.right, rect.right)
    };
  }, { left: Number.POSITIVE_INFINITY, right: Number.NEGATIVE_INFINITY });
  const hasNearbySibling = rowChildren.length >= 2 && horizontalSpread.right - horizontalSpread.left > targetRect.width + 16;
  const isFlexRow = (style.display.includes("flex") || style.display.includes("grid")) && style.flexDirection !== "column";

  return hasNearbySibling || (isFlexRow && children.length >= 2);
}

function isUsableToolbar(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  if (!isVisibleRect(rect) || rect.width < 32 || rect.height < 18 || rect.height > 120) return false;
  const children = Array.from(element.children).filter((child): child is HTMLElement => child instanceof HTMLElement && isVisibleElement(child));
  const controls = children.filter((child) => matchesSelector(child, "button,[role='button'],select,voice-input-toggle"));
  return controls.length >= 1 || children.length >= 2;
}

function insertLauncherShell(shell: HTMLElement, slot: ToolbarSlot) {
  const parent = slot.refElement.parentNode;
  if (!parent) return;
  const beforeNode = slot.insertPosition === "before" ? slot.refElement : slot.refElement.nextSibling;
  parent.insertBefore(shell, beforeNode);
  shell.dataset.platform = detectPlatform();
  shell.dataset.toolbarHost = location.hostname.toLowerCase();
  if (slot.toolbar instanceof HTMLElement) slot.toolbar.dataset.ctxToolbar = "true";
}

function syncLauncherMetrics(shell: HTMLElement, button: HTMLButtonElement, refElement: HTMLElement) {
  const refStyle = window.getComputedStyle(refElement);
  const refRect = refElement.getBoundingClientRect();
  const rawSize = parseFloat(refStyle.height) || refRect.height || defaultLauncherSize;
  const size = Math.round(clampNumber(rawSize, 24, 32));
  shell.style.setProperty("--ctx-toolbar-button-size", `${size}px`);
  shell.style.setProperty("--ctx-toolbar-button-radius", refStyle.borderRadius && refStyle.borderRadius !== "0px" ? refStyle.borderRadius : "999px");
  button.style.height = `${size}px`;
}

function cleanupLegacyLaunchers() {
  document.querySelectorAll<HTMLElement>(LEGACY_LAUNCHER_SELECTOR).forEach((element) => element.remove());
  document.querySelectorAll<HTMLElement>(`#${CTX_WELCOME_ID}`).forEach((element, index) => {
    if (index === 0) {
      welcomeHost = element;
      return;
    }
    element.remove();
  });
  document.querySelectorAll<HTMLElement>(`#${CTX_USAGE_METER_ID}`).forEach((element, index) => {
    if (index === 0) {
      usageMeterHost = element;
      return;
    }
    element.remove();
  });
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(`#${CTX_BUTTON_ID}`));
  buttons.slice(1).forEach((button) => button.closest(`#${CTX_SHELL_ID}`)?.remove() ?? button.remove());
}

async function showWelcomeMessage(anchor: HTMLElement, visibleMs = 3200) {
  const host = ensureWelcomeHost();
  const text = host.querySelector<HTMLElement>(".ctx-welcome-text");
  if (!text) return;

  const message = pickWelcomeMessage(await readWelcomeMessages());
  if (!message) return;
  if (!anchor.isConnected) return;

  welcomeAnchor = anchor;
  text.textContent = message;
  positionWelcomeHost(host, anchor);
  host.dataset.show = "true";

  window.requestAnimationFrame(() => positionWelcomeHost(host, anchor));
  if (welcomeTimer) window.clearTimeout(welcomeTimer);
  welcomeTimer = window.setTimeout(() => {
    welcomeTimer = null;
    hideWelcomeMessage();
  }, visibleMs);
}

function hideWelcomeMessage() {
  if (welcomeTimer) {
    window.clearTimeout(welcomeTimer);
    welcomeTimer = null;
  }
  if (welcomeHost) welcomeHost.dataset.show = "false";
  welcomeAnchor = null;
}

function ensureWelcomeHost() {
  const existing = document.getElementById(CTX_WELCOME_ID);
  if (existing) {
    welcomeHost = existing;
    return existing;
  }

  const host = document.createElement("div");
  host.id = CTX_WELCOME_ID;
  host.setAttribute("aria-hidden", "true");
  host.dataset.show = "false";
  host.innerHTML = `
    <style>
      #${CTX_WELCOME_ID} {
        position: fixed !important;
        left: 0;
        top: 0;
        z-index: 2147483647 !important;
        max-width: min(280px, calc(100vw - 20px));
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
        pointer-events: none !important;
        box-sizing: border-box !important;
        opacity: 0;
        transform: translateY(4px) scale(.98);
        transition: opacity 180ms ease, transform 180ms ease;
        color-scheme: dark;
        contain: layout style paint;
      }
      #${CTX_WELCOME_ID}[data-show="true"] {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      #${CTX_WELCOME_ID} .ctx-welcome-pill {
        max-width: 100%;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
        white-space: nowrap;
        border: 1px solid rgba(139,92,246,.82);
        border-radius: 999px;
        background: rgba(17,24,39,.98);
        color: #e5e7eb;
        padding: 7px 11px;
        font: 800 12px/1.15 Inter, ui-sans-serif, system-ui, sans-serif;
        letter-spacing: 0;
        box-shadow: 0 14px 44px rgba(0,0,0,.42), inset 0 0 0 1px rgba(255,255,255,.05);
        backdrop-filter: blur(14px);
      }
      #${CTX_WELCOME_ID} .ctx-welcome-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${CTX_WELCOME_ID} .ctx-welcome-dots {
        color: #a78bfa;
        font-weight: 900;
        letter-spacing: 2px;
      }
    </style>
    <span class="ctx-welcome-pill">
      <span class="ctx-welcome-text"></span>
      <span class="ctx-welcome-dots">...</span>
    </span>
  `;
  document.documentElement.append(host);
  welcomeHost = host;
  return host;
}

function positionWelcomeHost(host: HTMLElement, anchor: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  const width = hostRect.width || 190;
  const height = hostRect.height || 30;
  const viewportPadding = 8;
  const gap = 10;
  let left = anchorRect.right - width;
  let top = anchorRect.top - height - gap;

  if (top < viewportPadding) top = anchorRect.bottom + gap;
  left = clampNumber(left, viewportPadding, Math.max(viewportPadding, window.innerWidth - width - viewportPadding));
  top = clampNumber(top, viewportPadding, Math.max(viewportPadding, window.innerHeight - height - viewportPadding));

  host.style.left = `${Math.round(left)}px`;
  host.style.top = `${Math.round(top)}px`;
}

function repositionWelcomeMessage() {
  if (welcomeHost?.dataset.show !== "true" || !welcomeAnchor?.isConnected) return;
  window.requestAnimationFrame(() => {
    if (welcomeHost?.dataset.show === "true" && welcomeAnchor?.isConnected) {
      positionWelcomeHost(welcomeHost, welcomeAnchor);
    }
  });
}

async function readWelcomeMessages() {
  try {
    const settings = await chrome.storage.local.get({ welcomeMessage: defaultWelcomeMessages.join("\n") });
    return parseWelcomeMessages(settings.welcomeMessage);
  } catch {
    return defaultWelcomeMessages;
  }
}

function parseWelcomeMessages(value: unknown) {
  const messages = String(value || "")
    .split(/\r?\n|[|;]/)
    .map((message) => message.trim())
    .filter(Boolean)
    .map((message) => message.slice(0, 54))
    .slice(0, 7);

  if (messages.length >= 2) return messages;
  return defaultWelcomeMessages;
}

function pickWelcomeMessage(messages: string[]) {
  if (!messages.length) return "";
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0];
}

function startUsageMeter(slot: ToolbarSlot) {
  const anchor = findUsageAnchor(slot);
  if (!anchor) return;

  usageMeterAnchor = anchor;
  usageRefreshTicks = 0;
  ensureUsageMeterHost();
  attachUsageTracking(anchor);
  scheduleUsageMeterUpdate();
  startUsageRefreshLoop();
}

function stopUsageMeter() {
  if (usageUpdateFrame) {
    window.cancelAnimationFrame(usageUpdateFrame);
    usageUpdateFrame = 0;
  }
  if (usageRefreshTimer) {
    window.clearInterval(usageRefreshTimer);
    usageRefreshTimer = null;
  }
  usageRefreshTicks = 0;
  usageMeterAnchor = null;
  usageMeterHost?.remove();
  usageMeterHost = null;
}

function findUsageAnchor(slot: ToolbarSlot) {
  const prompt = findPrompt(detectPlatform());
  const composer = prompt ? findComposerElement(prompt) : null;
  if (composer && isVisibleElement(composer)) return composer;
  if (slot.toolbar && isVisibleElement(slot.toolbar)) return slot.toolbar;
  return slot.refElement.parentElement ?? slot.refElement;
}

function ensureUsageMeterHost() {
  const existing = document.getElementById(CTX_USAGE_METER_ID);
  if (existing) {
    usageMeterHost = existing;
    return existing;
  }

  const host = document.createElement("div");
  host.id = CTX_USAGE_METER_ID;
  host.setAttribute("aria-hidden", "true");
  host.innerHTML = `
    <style>
      #${CTX_USAGE_METER_ID} {
        position: fixed !important;
        left: 0;
        top: 0;
        z-index: 2147483646 !important;
        width: min(760px, calc(100vw - 24px));
        pointer-events: none !important;
        box-sizing: border-box !important;
        color-scheme: dark;
        contain: layout style paint;
        opacity: .96;
      }
      #${CTX_USAGE_METER_ID} .meter {
        display: grid;
        grid-template-columns: minmax(86px, .7fr) minmax(118px, 1fr) minmax(118px, 1fr);
        align-items: center;
        gap: 8px;
        width: 100%;
        min-height: 26px;
        padding: 5px 8px;
        border: 1px solid rgba(139,245,207,.20);
        border-radius: 999px;
        background: rgba(5,8,18,.78);
        box-shadow: 0 10px 34px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.035);
        backdrop-filter: blur(14px);
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }
      #${CTX_USAGE_METER_ID} .platform {
        min-width: 0;
        overflow: hidden;
        color: #d1fae5;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .02em;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #${CTX_USAGE_METER_ID} .quota {
        min-width: 0;
        display: grid;
        grid-template-columns: auto minmax(34px, 1fr) auto;
        align-items: center;
        gap: 5px;
      }
      #${CTX_USAGE_METER_ID} .label,
      #${CTX_USAGE_METER_ID} .value {
        color: #a7f3d0;
        font-size: 9px;
        font-weight: 850;
        line-height: 1;
        white-space: nowrap;
      }
      #${CTX_USAGE_METER_ID} .value {
        color: #cbd5e1;
        text-align: right;
      }
      #${CTX_USAGE_METER_ID} .track {
        height: 5px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(148,163,184,.20);
      }
      #${CTX_USAGE_METER_ID} .fill {
        width: 0%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #5eead4, #8bf5cf);
        transition: width 180ms ease, background 180ms ease;
      }
      #${CTX_USAGE_METER_ID}[data-level="watch"] .fill {
        background: linear-gradient(90deg, #facc15, #fb923c);
      }
      #${CTX_USAGE_METER_ID}[data-level="danger"] .fill {
        background: linear-gradient(90deg, #fb7185, #f97316);
      }
      @media (max-width: 560px) {
        #${CTX_USAGE_METER_ID} .meter {
          grid-template-columns: 1fr 1fr;
          border-radius: 14px;
        }
        #${CTX_USAGE_METER_ID} .platform {
          grid-column: 1 / -1;
        }
      }
    </style>
    <section class="meter">
      <span class="platform">CTX Tokens</span>
      <span class="quota daily">
        <span class="label">Today</span>
        <span class="track"><span class="fill"></span></span>
        <span class="value">0 / 50k</span>
      </span>
      <span class="quota weekly">
        <span class="label">Week</span>
        <span class="track"><span class="fill"></span></span>
        <span class="value">0 / 300k</span>
      </span>
    </section>
  `;
  document.documentElement.append(host);
  usageMeterHost = host;
  return host;
}

function startUsageRefreshLoop() {
  if (usageRefreshTimer) return;
  usageRefreshTimer = window.setInterval(() => {
    usageRefreshTicks += 1;
    if (!usageMeterAnchor?.isConnected || usageRefreshTicks % 5 === 0) {
      const slot = findToolbarSlot();
      if (slot) usageMeterAnchor = findUsageAnchor(slot);
    }
    attachUsageTracking(usageMeterAnchor);
    scheduleUsageMeterUpdate();
  }, 800);
}

function scheduleUsageMeterUpdate() {
  if (usageUpdateFrame) return;
  usageUpdateFrame = window.requestAnimationFrame(() => {
    usageUpdateFrame = 0;
    void updateUsageMeter();
  });
}

async function updateUsageMeter() {
  if (!usageMeterAnchor?.isConnected) return;
  const host = ensureUsageMeterHost();
  positionUsageMeterHost(host, usageMeterAnchor);

  const platform = detectPlatform();
  const settings = await readTokenMeterSettings();
  const store = await readTokenUsageStore();
  const totals = store.platforms[platform] ?? { daily: 0, weekly: 0 };
  const currentPromptTokens = estimateTokens(readPromptText(findPrompt(platform)));
  const dailyPercent = percentUsed(totals.daily + currentPromptTokens, settings.tokenDailyLimit);
  const weeklyPercent = percentUsed(totals.weekly + currentPromptTokens, settings.tokenWeeklyLimit);
  const level = Math.max(dailyPercent, weeklyPercent) >= 92 ? "danger" : Math.max(dailyPercent, weeklyPercent) >= 76 ? "watch" : "ok";

  host.dataset.level = level;
  const platformText = host.querySelector<HTMLElement>(".platform");
  const dailyFill = host.querySelector<HTMLElement>(".daily .fill");
  const weeklyFill = host.querySelector<HTMLElement>(".weekly .fill");
  const dailyValue = host.querySelector<HTMLElement>(".daily .value");
  const weeklyValue = host.querySelector<HTMLElement>(".weekly .value");

  if (platformText) platformText.textContent = `${platformLabel(platform)} · now ${formatTokenCount(currentPromptTokens)}`;
  if (dailyFill) dailyFill.style.width = `${Math.round(dailyPercent)}%`;
  if (weeklyFill) weeklyFill.style.width = `${Math.round(weeklyPercent)}%`;
  if (dailyValue) dailyValue.textContent = `${formatTokenCount(totals.daily)} / ${formatTokenCount(settings.tokenDailyLimit)}`;
  if (weeklyValue) weeklyValue.textContent = `${formatTokenCount(totals.weekly)} / ${formatTokenCount(settings.tokenWeeklyLimit)}`;
}

function positionUsageMeterHost(host: HTMLElement, anchor: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  const width = Math.round(clampNumber(anchorRect.width - 12, 280, 860));
  const height = hostRect.height || 28;
  const viewportPadding = 6;
  let left = anchorRect.left + (anchorRect.width - width) / 2;
  let top = anchorRect.bottom + 6;

  if (top + height > window.innerHeight - viewportPadding) top = anchorRect.top - height - 6;
  left = clampNumber(left, viewportPadding, Math.max(viewportPadding, window.innerWidth - width - viewportPadding));
  top = clampNumber(top, viewportPadding, Math.max(viewportPadding, window.innerHeight - height - viewportPadding));

  host.style.width = `${width}px`;
  host.style.left = `${Math.round(left)}px`;
  host.style.top = `${Math.round(top)}px`;
}

function repositionUsageMeter() {
  if (!usageMeterHost || !usageMeterAnchor?.isConnected) return;
  window.requestAnimationFrame(() => {
    if (usageMeterHost && usageMeterAnchor?.isConnected) positionUsageMeterHost(usageMeterHost, usageMeterAnchor);
  });
}

function attachUsageTracking(anchor: HTMLElement | null) {
  const platform = detectPlatform();
  const prompt = findPrompt(platform);
  if (prompt && !usageTrackedElements.has(prompt)) {
    usageTrackedElements.add(prompt);
    prompt.addEventListener("input", scheduleUsageMeterUpdate, { passive: true });
    prompt.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
        void recordPromptUsage();
      }
    }, true);
  }

  const composer = anchor ?? (prompt ? findComposerElement(prompt) : null);
  if (!composer) return;
  const controls = queryVisibleElements("button,[role='button']", composer);
  for (const control of controls) {
    if (usageTrackedElements.has(control) || isInsideCtxLauncher(control)) continue;
    usageTrackedElements.add(control);
    control.addEventListener("pointerdown", () => {
      if (isLikelySendControl(control, composer)) void recordPromptUsage();
    }, true);
    control.addEventListener("click", () => {
      if (isLikelySendControl(control, composer)) void recordPromptUsage();
    }, true);
  }

  const form = composer.closest("form");
  if (form && !usageTrackedElements.has(form)) {
    usageTrackedElements.add(form);
    form.addEventListener("submit", () => void recordPromptUsage(), true);
  }
}

function isLikelySendControl(control: HTMLElement, composer: HTMLElement) {
  const label = controlText(control);
  if (/\b(microphone|mic|dictate|voice|audio|attach|upload|file|paperclip|plus|search|deepthink|think|smart|pro)\b/.test(label)) return false;
  if (/\b(send|submit|arrow|up)\b/.test(label)) return true;
  if (matchesSelector(control, "button[type='submit']")) return true;

  const controlRect = control.getBoundingClientRect();
  const composerRect = composer.getBoundingClientRect();
  return controlRect.width <= 54 && controlRect.height <= 54 && controlRect.right >= composerRect.right - 76;
}

async function recordPromptUsage() {
  const platform = detectPlatform();
  const prompt = findPrompt(platform);
  const text = readPromptText(prompt);
  const tokens = estimateTokens(text);
  if (tokens <= 0) return;

  const signature = `${platform}:${hashText(text)}:${tokens}`;
  const now = Date.now();
  if (signature === lastTokenRecordSignature && now - lastTokenRecordAt < 8000) return;
  lastTokenRecordSignature = signature;
  lastTokenRecordAt = now;

  await addTokenUsage(platform, tokens);
}

async function addTokenUsage(platform: Platform, tokens: number) {
  const store = await readTokenUsageStore();
  const current = store.platforms[platform] ?? { daily: 0, weekly: 0 };
  store.platforms[platform] = {
    daily: current.daily + tokens,
    weekly: current.weekly + tokens
  };
  await chrome.storage.local.set({ [TOKEN_USAGE_STORAGE_KEY]: store });
  scheduleUsageMeterUpdate();
}

async function readTokenUsageStore(): Promise<TokenUsageStore> {
  const defaults = createTokenUsageStore();
  const stored = await chrome.storage.local.get({ [TOKEN_USAGE_STORAGE_KEY]: defaults });
  const value = stored[TOKEN_USAGE_STORAGE_KEY] as Partial<TokenUsageStore> | undefined;
  const dailyKey = currentDailyKey();
  const weeklyKey = currentWeeklyKey();
  return {
    dailyKey,
    weeklyKey,
    platforms: resetExpiredUsage(value, dailyKey, weeklyKey)
  };
}

function createTokenUsageStore(): TokenUsageStore {
  return {
    dailyKey: currentDailyKey(),
    weeklyKey: currentWeeklyKey(),
    platforms: {}
  };
}

function resetExpiredUsage(value: Partial<TokenUsageStore> | undefined, dailyKey: string, weeklyKey: string) {
  const platforms = value?.platforms ?? {};
  const next: Record<string, TokenUsageTotals> = {};
  for (const [platform, totals] of Object.entries(platforms)) {
    next[platform] = {
      daily: value?.dailyKey === dailyKey ? Math.max(0, Number(totals?.daily) || 0) : 0,
      weekly: value?.weeklyKey === weeklyKey ? Math.max(0, Number(totals?.weekly) || 0) : 0
    };
  }
  return next;
}

async function readTokenMeterSettings() {
  const settings = await chrome.storage.local.get({
    tokenDailyLimit: defaultDailyTokenLimit,
    tokenWeeklyLimit: defaultWeeklyTokenLimit
  });
  return {
    tokenDailyLimit: Math.max(1000, Number(settings.tokenDailyLimit) || defaultDailyTokenLimit),
    tokenWeeklyLimit: Math.max(1000, Number(settings.tokenWeeklyLimit) || defaultWeeklyTokenLimit)
  };
}

function readPromptText(prompt: HTMLElement | null) {
  if (!prompt) return "";
  let text = "";
  if (prompt instanceof HTMLTextAreaElement || prompt instanceof HTMLInputElement) {
    text = prompt.value;
  } else if (prompt.isContentEditable || prompt.getAttribute("role") === "textbox") {
    text = prompt.innerText || prompt.textContent || "";
  } else {
    const editable = prompt.querySelector<HTMLElement>("textarea,input,[contenteditable='true'],[role='textbox']");
    text = readPromptText(editable);
  }
  return normalizePromptText(text);
}

function normalizePromptText(text: string) {
  const normalized = text.replace(/\u200b/g, "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (/^(ask anything|ask gemini|how can i help you today\??|message .+|write a message\.*|describe your idea.*)$/i.test(normalized)) return "";
  return normalized;
}

function estimateTokens(text: string) {
  const normalized = normalizePromptText(text);
  if (!normalized) return 0;
  const wordCount = normalized.match(/[A-Za-z0-9_]+|[^\sA-Za-z0-9_]/g)?.length ?? 0;
  return Math.max(1, Math.ceil(Math.max(normalized.length / 4, wordCount * 1.25)));
}

function percentUsed(used: number, limit: number) {
  return clampNumber(limit > 0 ? (used / limit) * 100 : 0, 0, 100);
}

function formatTokenCount(value: number) {
  if (value >= 1000000) return `${trimNumber(value / 1000000)}m`;
  if (value >= 1000) return `${trimNumber(value / 1000)}k`;
  return String(Math.max(0, Math.round(value)));
}

function trimNumber(value: number) {
  return value >= 10 ? String(Math.round(value)) : value.toFixed(1).replace(/\.0$/, "");
}

function platformLabel(platform: Platform) {
  const labels: Record<Platform, string> = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    gemini: "Gemini",
    perplexity: "Perplexity",
    github: "GitHub",
    cursor: "Cursor",
    copilot: "Copilot",
    deepseek: "DeepSeek",
    grok: "Grok",
    poe: "Poe",
    mistral: "Mistral",
    meta: "Meta",
    qwen: "Qwen",
    lovable: "Lovable",
    replit: "Replit",
    emergent: "Emergent",
    v0: "v0",
    bolt: "Bolt",
    notebooklm: "NotebookLM",
    generic: "AI"
  };
  return labels[platform];
}

function currentDailyKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentWeeklyKey(date = new Date()) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() + 4 - day);
  const yearStart = new Date(copy.getFullYear(), 0, 1);
  const week = Math.ceil(((copy.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${copy.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function hashText(text: string) {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function queryVisibleElements(selector: string, root: Document | HTMLElement = document) {
  try {
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(isVisibleElement);
  } catch {
    return [];
  }
}

function matchesSelector(element: HTMLElement, selector: string) {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}

function isInsideCtxLauncher(element: HTMLElement) {
  return Boolean(element.closest(`#${CTX_SHELL_ID}`) || element.id === CTX_BUTTON_ID);
}

function isVisibleElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return style.visibility !== "hidden" && style.display !== "none" && isVisibleRect(rect);
}

function isVisibleRect(rect: DOMRect) {
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
}

function verticalCenter(rect: DOMRect) {
  return rect.top + rect.height / 2;
}

function clampNumber(value: number, min: number, max: number) {
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
    scheduleUsageMeterUpdate();
    return true;
  }

  if (target.isContentEditable) {
    target.focus();
    document.execCommand("insertText", false, text);
    target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
    scheduleUsageMeterUpdate();
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
