chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ apiUrl: "http://localhost:3000/api" });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ctx:open-dashboard") {
    chrome.tabs.create({ url: "http://localhost:3000" });
    sendResponse({ ok: true });
  }
});
