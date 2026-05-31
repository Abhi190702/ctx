import { capturePage, captureSelection } from "../services/capture";
import { mountCtxButton } from "./inject-button";

mountCtxButton();

const observer = new MutationObserver(() => mountCtxButton());
observer.observe(document.documentElement, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ctx:capture-selection") {
    captureSelection().then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === "ctx:capture-page") {
    capturePage().then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  return false;
});
