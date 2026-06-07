(function() {
  const log = (api) => {
    const err = new Error();
    const stack = err.stack ? err.stack.split('\n').slice(2).join('\n') : '';
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

  try {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (['keydown', 'keypress', 'input', 'change'].includes(type)) {
        if (this instanceof HTMLInputElement || this instanceof HTMLTextAreaElement || this === window || this === document) {
          log('InputCapture.' + type);
        }
      }
      return originalAddEventListener.apply(this, arguments);
    };
  } catch (e) {}
})();
