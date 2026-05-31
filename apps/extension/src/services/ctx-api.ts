import type { Capsule } from "../types";
import { getSettings } from "./storage";

export async function pingCtx(): Promise<boolean> {
  const { apiUrl } = await getSettings();
  try {
    const response = await fetch(`${apiUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function getCtxAppUrl(): Promise<string> {
  const { apiUrl } = await getSettings();
  return apiUrl;
}

export async function fetchCapsules(): Promise<Capsule[]> {
  const { apiUrl } = await getSettings();
  const response = await fetch(`${apiUrl}/capsules`);
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Could not load CTX capsules.");
  return payload.data;
}

export async function captureText(input: { title: string; text: string; url?: string; platform?: string }) {
  const { apiUrl } = await getSettings();
  const response = await fetch(`${apiUrl}/extension/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Capture failed.");
  return payload.data;
}

export async function fetchInjectionPrompt(id: string, platform?: string): Promise<string> {
  const { apiUrl } = await getSettings();
  const response = await fetch(`${apiUrl}/capsules/${encodeURIComponent(id)}/inject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform })
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Could not prepare capsule.");
  return payload.data.text;
}
