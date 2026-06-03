# CTX Browser Extension

The CTX extension injects a small CTX button near supported AI prompt boxes. Click the button, search capsules from the local CTX API, and insert a formatted memory capsule into the current prompt.

## Usage Meter

The extension also renders a compact session and weekly usage bar inside supported prompt boxes. When the provider page exposes quota text such as `Session (5h): 77%`, `Weekly: 3%`, `Reset in`, or `Messages left`, CTX mirrors that visible quota signal. When the page does not expose private quota counters, CTX falls back to an append-only local ledger and estimates quota movement from the prompt size, active model, platform profile, and live response text that appears after the current chat baseline.

The visible meter is intentionally percentage-first, not USD-first. CTX still keeps an internal model pricing registry for OpenAI, Google Gemini, and Anthropic models so future API integrations can calculate exact costs from response metadata such as OpenAI `usage`, Gemini `usageMetadata`, or Anthropic `usage`.

## Development

```bash
pnpm --filter @ctx/extension dev
```

Then load `apps/extension/dist` as an unpacked extension in Chromium.

## Supported Hosts

- ChatGPT
- Claude
- Gemini
- NotebookLM
- Perplexity
- DeepSeek
- Grok
- Poe
- Mistral Le Chat
- Microsoft Copilot
- Meta AI
- Qwen Chat
- Lovable
- Replit
- Emergent
- v0
- Bolt
- Cursor
- GitHub

Selectors are intentionally conservative. If CTX cannot find a prompt box, it exits silently and avoids modifying the host page.
