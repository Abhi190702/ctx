import type { ExtensionSettings } from "../types";

const defaults: ExtensionSettings = {
  apiUrl: "http://localhost:3000/api"
};

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.local.get(defaults);
  return { ...defaults, ...stored };
}

export async function saveSettings(settings: Partial<ExtensionSettings>) {
  await chrome.storage.local.set(settings);
}
