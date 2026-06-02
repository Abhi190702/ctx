# Browser Extension

The CTX extension is a Manifest V3 foundation for capture and injection.

## Capabilities

- Popup with capture selection, capture page, open dashboard, and search actions.
- Local API URL setting.
- Content script that injects a small `CTX` button near prompt boxes.
- Floating capsule picker with search.
- Prompt insertion for textareas, inputs, and contenteditable elements.

## Supported Hosts

- ChatGPT
- Claude
- Gemini
- Perplexity
- GitHub

The extension uses conservative selector arrays and safe fallbacks. If no prompt is found, it exits silently and does not break the host page.

## Development

```bash
pnpm extension:dev
```

Load `apps/extension/dist` as an unpacked extension.

After rebuilding the extension, Chrome does not automatically inject the new content script into tabs that are already open. Go to `chrome://extensions`, click the reload button on CTX, then refresh ChatGPT/Claude/Gemini/Perplexity/GitHub.

If the popup opens but no CTX button appears on an AI page:

1. Confirm the web app is running at `http://localhost:3000`.
2. Confirm the popup API URL is `http://localhost:3000/api`.
3. Reload CTX from `chrome://extensions`.
4. Refresh the AI page once.
5. Open the CTX popup and click `Show CTX Button`.
6. Open the page console and look for content script errors if the button still does not appear.

The `Errors` button on `chrome://extensions` can show old errors from a previous build. After reloading CTX, open `Errors`, clear the old entries, then test again.

## Release Packaging

Build the full project and stage release artifacts:

```bash
pnpm release
```

The release folder includes:

- `extension-unpacked` for Chrome Developer Mode loading.
- `CHECKSUMS.txt` for file integrity verification.
- `INSTALL.md` with web app, extension, MCP, and Docker instructions.

Chrome Web Store signing still requires publisher credentials and store submission outside this repo.
