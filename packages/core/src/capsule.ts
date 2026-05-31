export function normalizeTags(tags: string[] | string | null | undefined): string[] {
  if (!tags) return [];
  const items = Array.isArray(tags) ? tags : tags.split(/[,#\n]/);

  return Array.from(
    new Set(
      items
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .map((tag) => tag.replace(/\s+/g, "-")),
    ),
  );
}

export function linesToArray(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  return value
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

export function arrayToLines(value: string[] | string | null | undefined): string {
  return linesToArray(value).join("\n");
}

export function estimateTokens(text: string | null | undefined): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.33));
}

export function safeJsonParseArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return linesToArray(value);
  }
}

export function serializeList(value: string[] | string | null | undefined): string {
  return JSON.stringify(linesToArray(value));
}
