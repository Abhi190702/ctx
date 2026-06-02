import type { ExtensionSettings } from "../types";

const defaultWelcomeMessages = [
  "Your AI needs context",
  "Drop memory before you prompt",
  "Bring yesterday into this chat",
  "Capture now, reuse later",
  "Let CTX carry the context",
  "Use a capsule, skip the recap",
  "Keep the work moving"
].join("\n");

const defaults: ExtensionSettings = {
  apiUrl: "http://localhost:3000/api",
  welcomeMessage: defaultWelcomeMessages
};

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.local.get(defaults);
  return { ...defaults, ...stored };
}

export async function saveSettings(settings: Partial<ExtensionSettings>) {
  await chrome.storage.local.set(settings);
}
