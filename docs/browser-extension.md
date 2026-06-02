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
