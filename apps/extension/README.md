# CTX Browser Extension

The CTX extension injects a small CTX button near supported AI prompt boxes. Click the button, search capsules from the local CTX API, and insert a formatted memory capsule into the current prompt.

## Usage Meter

The extension also renders a stable daily and weekly usage bar near supported prompt boxes. The bar normalizes usage to estimated USD cost instead of comparing raw tokens across models. It uses a built-in pricing registry for OpenAI, Google Gemini, and Anthropic models, then stores each sent prompt as an append-only local usage entry.

Browser chat pages do not expose the provider's private server-side quota counters to extensions, so in-page web chat usage is marked as an estimate. API integrations can be made exact when responses include usage metadata such as OpenAI `usage`, Gemini `usageMetadata`, or Anthropic `usage`.

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
