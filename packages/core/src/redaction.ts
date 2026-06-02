const secretPatterns: Array<[RegExp, string]> = [
  [/sk-[A-Za-z0-9_-]{20,}/g, "[REDACTED_OPENAI_KEY]"],
  [/sk-ant-[A-Za-z0-9_-]{20,}/g, "[REDACTED_ANTHROPIC_KEY]"],
  [/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[REDACTED_GITHUB_TOKEN]"],
  [/github_pat_[A-Za-z0-9_]{20,}/g, "[REDACTED_GITHUB_TOKEN]"],
  [/npm_[A-Za-z0-9]{20,}/g, "[REDACTED_NPM_TOKEN]"],
  [/xox[baprs]-[A-Za-z0-9-]{20,}/g, "[REDACTED_SLACK_TOKEN]"],
  [/\b(api[_-]?key|token|secret)\s*[:=]\s*['"]?[A-Za-z0-9_.-]{16,}['"]?/gi, "$1=[REDACTED]"],
  [/\b(password|passwd|pwd)\s*[:=]\s*['"]?[^'"\s]{6,}['"]?/gi, "$1=[REDACTED]"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]"]
];

const credentialAssignmentPattern =
  /\b([A-Z0-9_]*(?:API|ACCESS|AUTH|CLIENT|PRIVATE|SECRET|SESSION|TOKEN|WEBHOOK)[A-Z0-9_-]*)\s*[:=]\s*['"]?([A-Za-z0-9+/_.=-]{24,})['"]?/gi;

export function redactSecrets(text: string | null | undefined): string {
  if (!text) return "";
  const providerRedacted = secretPatterns.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text);
  return providerRedacted.replace(credentialAssignmentPattern, (match, name: string, value: string) => {
    if (shannonEntropy(value) < 3.5) return match;
    return `${name}=[REDACTED_HIGH_ENTROPY_SECRET]`;
  });
}

function shannonEntropy(value: string) {
  const counts = new Map<string, number>();
  for (const char of value) counts.set(char, (counts.get(char) ?? 0) + 1);
  return [...counts.values()].reduce((entropy, count) => {
    const probability = count / value.length;
    return entropy - probability * Math.log2(probability);
  }, 0);
}
