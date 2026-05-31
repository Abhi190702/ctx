const secretPatterns: Array<[RegExp, string]> = [
  [/sk-[A-Za-z0-9_-]{20,}/g, "[REDACTED_OPENAI_KEY]"],
  [/sk-ant-[A-Za-z0-9_-]{20,}/g, "[REDACTED_ANTHROPIC_KEY]"],
  [/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[REDACTED_GITHUB_TOKEN]"],
  [/\b(api[_-]?key|token|secret)\s*[:=]\s*['"]?[A-Za-z0-9_.-]{16,}['"]?/gi, "$1=[REDACTED]"],
  [/\b(password|passwd|pwd)\s*[:=]\s*['"]?[^'"\s]{6,}['"]?/gi, "$1=[REDACTED]"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]"]
];

export function redactSecrets(text: string | null | undefined): string {
  if (!text) return "";
  // TODO: Add entropy scoring and provider-specific validators before broadening these patterns.
  return secretPatterns.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text);
}
