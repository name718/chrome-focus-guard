// Service worker for chrome-focus-guard (Manifest V3)

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[FocusGuard] Extension installed/updated', details);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'FOCUS_GUARD_PING') {
    sendResponse({ ok: true, source: 'service-worker' });
  }
  // Keep the message channel open if we will respond async
  return false;
});

// Example: context menu placeholder (disabled by default)
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.contextMenus.create({ id: 'fg_toggle', title: 'Toggle Focus Mode', contexts: ['action'] });
// });

