import type { Capsule } from "../types";
import { fetchCapsules, fetchInjectionPrompt } from "./ctx-api";
import { formatCapsuleForPrompt, insertTextIntoPrompt } from "./injector";
import { detectPlatform } from "./platform-detector";

let picker: HTMLElement | null = null;
type DropMode = "smart" | "brief" | "full";

export async function openCapsulePicker(target: HTMLElement | null) {
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
      .panel { width: min(380px, calc(100vw - 32px)); max-height: min(560px, calc(100vh - 120px)); overflow: hidden; border: 1px solid #283044; border-radius: 16px; background: #111827; color: #e5e7eb; box-shadow: 0 24px 90px rgba(0,0,0,.52); }
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

  function render(capsules: Capsule[]) {
    list.innerHTML = "";
    if (!capsules.length) {
      renderStatus(input.value.trim() ? "No matching capsules." : "No capsules yet. Use Generate first.");
      return;
    }
    for (const capsule of capsules) {
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

export function closeCapsulePicker() {
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

function capsuleMeta(capsule: Capsule) {
  const parts = [
    capsule.project?.name,
    capsule.platform || "ctx",
    capsule.tokenEstimate ? `${capsule.tokenEstimate} tokens` : "",
    capsule.lastInjectedAt ? "used before" : ""
  ].filter(Boolean);
  return parts.join(" / ");
}
