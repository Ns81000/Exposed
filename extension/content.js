function injectSensor() {
  const code = `
    (function() {
      const log = (api) => {
        const err = new Error();
        const stack = err.stack ? err.stack.split('\\n').slice(2).join('\\n') : '';
        window.dispatchEvent(new CustomEvent('EXPOSED_FINGERPRINT_ALERT', {
          detail: { api, stack }
        }));
      };

      try {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function() {
          log('Canvas.toDataURL');
          return originalToDataURL.apply(this, arguments);
        };
      } catch (e) {}

      try {
        const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
        CanvasRenderingContext2D.prototype.getImageData = function() {
          log('CanvasRenderingContext2D.getImageData');
          return originalGetImageData.apply(this, arguments);
        };
      } catch (e) {}

      try {
        if (window.WebGLRenderingContext) {
          const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
          WebGLRenderingContext.prototype.getParameter = function() {
            log('WebGLRenderingContext.getParameter');
            return originalGetParameter.apply(this, arguments);
          };
        }
      } catch (e) {}

      try {
        const originalCreateOffer = RTCPeerConnection.prototype.createOffer;
        RTCPeerConnection.prototype.createOffer = function() {
          log('RTCPeerConnection.createOffer');
          return originalCreateOffer.apply(this, arguments);
        };
      } catch (e) {}

      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const originalCreateOscillator = AudioCtx.prototype.createOscillator;
          AudioCtx.prototype.createOscillator = function() {
            log('AudioContext.createOscillator');
            return originalCreateOscillator.apply(this, arguments);
          };
        }
      } catch (e) {}
    })();
  `;

  const script = document.createElement('script');
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

injectSensor();

window.addEventListener('EXPOSED_FINGERPRINT_ALERT', (event) => {
  chrome.runtime.sendMessage({
    type: 'FINGERPRINT_ALERT',
    payload: event.detail
  }, () => {
    void chrome.runtime.lastError;
  });
});

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
    chrome.storage.local.get(['liveBuffer', 'connected', 'lastSeen', 'sessionTTL', 'resetAt', 'blockingEnabled'], (data) => {
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

