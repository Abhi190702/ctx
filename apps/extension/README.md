# CTX Browser Extension

The CTX extension injects a small CTX button near supported AI prompt boxes. Click the button, search capsules from the local CTX API, and insert a formatted memory capsule into the current prompt.

## Development

```bash
pnpm --filter @ctx/extension dev
```

Then load `apps/extension/dist` as an unpacked extension in Chromium.

## Supported Hosts

- ChatGPT
- Claude
- Gemini
- Perplexity
- GitHub

Selectors are intentionally conservative. If CTX cannot find a prompt box, it exits silently and avoids modifying the host page.
