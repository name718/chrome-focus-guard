// Content script for chrome-focus-guard
(function initFocusGuardContent() {
  if (window.__FOCUS_GUARD_CONTENT__) return;
  window.__FOCUS_GUARD_CONTENT__ = true;
  console.log('[FocusGuard] content script loaded');

  // 只处理基础的ping消息，具体功能由专门的content scripts处理
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'FOCUS_GUARD_PING') {
      sendResponse({ ok: true, source: 'content-script' });
      return true; // 保持消息通道开放
    }
  });
})();

