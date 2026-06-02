chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ apiUrl: "http://localhost:3000/api" });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ctx:open-dashboard") {
    chrome.tabs.create({ url: "http://localhost:3000" });
    sendResponse({ ok: true });
    return false;
  }

  if (message?.type === "ctx:get-app-url") {
    getApiUrl()
      .then((apiUrl) => sendResponse({ ok: true, data: apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "") }))
      .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : "Could not read CTX settings." }));
    return true;
  }

  if (message?.type === "ctx:api-request") {
    requestCtxApi(message)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : "CTX API request failed." }));
    return true;
  }

  return false;
});

async function getApiUrl() {
  const stored = await chrome.storage.local.get({ apiUrl: "http://localhost:3000/api" });
  return String(stored.apiUrl || "http://localhost:3000/api").replace(/\/$/, "");
}

async function requestCtxApi(message: { path?: string; method?: string; body?: unknown }) {
  const apiUrl = await getApiUrl();
  const path = String(message.path || "/health");
  const url = `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    method: message.method || "GET",
    headers: message.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: message.body === undefined ? undefined : JSON.stringify(message.body)
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(payload?.error ?? `CTX API request failed with status ${response.status}.`);
  }
  return payload?.data ?? payload;
}
