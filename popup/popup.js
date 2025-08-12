document.getElementById('ping').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'ping...';
  try {
    const response = await chrome.runtime.sendMessage({ type: 'FOCUS_GUARD_PING' });
    statusEl.textContent = `ok from ${response?.source || 'unknown'}`;
  } catch (err) {
    statusEl.textContent = 'error';
    // eslint-disable-next-line no-console
    console.error(err);
  }
});

