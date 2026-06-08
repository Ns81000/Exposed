function isContextActive() {
  try {
    return typeof chrome !== 'undefined' && 
           chrome.runtime && 
           chrome.runtime.id && 
           chrome.storage && 
           chrome.storage.local;
  } catch (e) {
    return false;
  }
}

window.addEventListener('EXPOSED_FINGERPRINT_ALERT', (event) => {
  if (!isContextActive()) return;
  chrome.runtime.sendMessage({
    type: 'FINGERPRINT_ALERT',
    payload: event.detail
  }, () => {
    void chrome.runtime.lastError;
  });
});

function sendPageMetadata() {
  if (!isContextActive()) return;
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
  if (!isContextActive()) return;

  if (event.data.type === 'REQUEST_SYNC') {
    chrome.storage.local.get(['liveBuffer', 'connected', 'lastSeen', 'sessionTTL', 'resetAt', 'blockingEnabled'], (data) => {
      if (!isContextActive()) return;
      window.postMessage({
        source: 'EXPOSED_EXTENSION',
        type: 'SYNC_RESPONSE',
        payload: data
      }, '*');
    });
  }

  if (event.data.type === 'BLOCKING_TOGGLE') {
    chrome.storage.local.set({ blockingEnabled: Boolean(event.data.payload?.blockingEnabled) });
  }

  if (event.data.type === 'CLEAR_ALL_DATA') {
    chrome.runtime.sendMessage({ type: 'CLEAR_ALL_DATA' }, (response) => {
      if (!isContextActive()) return;
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

if (isContextActive()) {
  chrome.runtime.onMessage.addListener((message) => {
    if (!isContextActive()) return;
    window.postMessage({ source: 'EXPOSED_EXTENSION', ...message }, '*');
  });
}

document.addEventListener('DOMContentLoaded', sendPageMetadata, { once: true });

