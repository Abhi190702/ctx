import { captureCurrentContext } from "../services/capture";
import { openCapsulePicker } from "../services/capsule-picker";
import { getCtxAppUrl, pingCtx } from "../services/ctx-api";
import { detectPlatform } from "../services/platform-detector";
import { findPrompt } from "./platform-selectors";

let buttonHost: HTMLElement | null = null;
let menuOpen = false;

export function mountCtxButton() {
  if (buttonHost?.isConnected) return;

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.right = "20px";
  host.style.bottom = "22px";
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
        width: 46px;
        height: 46px;
        border: 1px solid rgba(139,245,207,.45);
        border-radius: 999px;
        background: linear-gradient(135deg, #8bf5cf, #7c5cff);
        color: #071016;
        font: 900 13px ui-sans-serif, system-ui, sans-serif;
        cursor: pointer;
        box-shadow: 0 12px 40px rgba(0,0,0,.45);
      }
      .launcher:hover { filter: brightness(1.06); }
      .launcher:focus-visible, .menu button:focus-visible { outline: 2px solid #8bf5cf; outline-offset: 2px; }
      .menu {
        position: absolute;
        right: 58px;
        bottom: 0;
        width: 238px;
        display: none;
        overflow: hidden;
        border: 1px solid #283044;
        border-radius: 16px;
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
        padding: 15px 16px;
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
        bottom: 56px;
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
        <button type="button" class="generate"><span class="icon">+</span><span>Generate</span></button>
        <button type="button" class="drop"><span class="icon">></span><span>Drop</span></button>
        <button type="button" class="open"><span class="icon">o</span><span>Open CTX</span></button>
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
    openCapsulePicker(findPrompt(detectPlatform()));
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
    host.style.bottom = "22px";
    return;
  }
  host.style.right = `${Math.max(16, window.innerWidth - rect.right + 8)}px`;
  host.style.bottom = `${Math.max(16, window.innerHeight - rect.bottom + 6)}px`;
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
