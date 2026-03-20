function sendPageMetadata() {
  const payload = {
    type: 'PAGE_METADATA',
    payload: {
      pageUrl: location.href,
      pageTitle: document.title || location.hostname,
      timestamp: new Date().toISOString()
    }
  };

  chrome.runtime.sendMessage(payload, () => {
    void chrome.runtime.lastError;
  });
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.source !== 'EXPOSED_DASHBOARD') return;

  if (event.data.type === 'REQUEST_SYNC') {
    chrome.storage.local.get(['liveBuffer', 'connected', 'lastSeen', 'sessionTTL', 'resetAt'], (data) => {
      window.postMessage({
        source: 'EXPOSED_EXTENSION',
        type: 'SYNC_RESPONSE',
        payload: data
      }, '*');
    });
  }

  if (event.data.type === 'CLEAR_ALL_DATA') {
    chrome.runtime.sendMessage({ type: 'CLEAR_ALL_DATA' }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        window.postMessage({ source: 'EXPOSED_EXTENSION', type: 'CLEAR_ALL_ERROR' }, '*');
        return;
      }

      window.postMessage({
        source: 'EXPOSED_EXTENSION',
        type: 'CLEAR_ALL_DONE',
        payload: {
          resetAt: response.resetAt || new Date().toISOString()
        }
      }, '*');
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  window.postMessage({ source: 'EXPOSED_EXTENSION', ...message }, '*');
});

document.addEventListener('DOMContentLoaded', sendPageMetadata, { once: true });
