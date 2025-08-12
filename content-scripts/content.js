// Content script for chrome-focus-guard
(function initFocusGuardContent() {
  if (window.__FOCUS_GUARD_CONTENT__) return;
  window.__FOCUS_GUARD_CONTENT__ = true;
  console.log('[FocusGuard] content script loaded');

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'FOCUS_GUARD_PING') {
      sendResponse({ ok: true, source: 'content-script' });
    }
  });
})();

