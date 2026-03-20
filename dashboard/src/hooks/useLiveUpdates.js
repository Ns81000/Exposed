import { useEffect } from 'react';
import { useTrackerStore } from './useTrackerStore';

function readExtensionSync() {
  window.postMessage({ source: 'EXPOSED_DASHBOARD', type: 'REQUEST_SYNC' }, '*');
}

export function useLiveUpdates() {
  const ingestEvents = useTrackerStore((state) => state.ingestEvents);
  const setConnected = useTrackerStore((state) => state.setConnected);
  const setSessionTTL = useTrackerStore((state) => state.setSessionTTL);
  const setResetAt = useTrackerStore((state) => state.setResetAt);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== window) return;
      const data = event.data || {};
      if (data.source !== 'EXPOSED_EXTENSION') return;

      if (data.type === 'TRACKER_EVENT') {
        ingestEvents(data.payload);
      }

      if (data.type === 'SYNC_RESPONSE') {
        setConnected(Boolean(data.payload?.connected));
        setSessionTTL(data.payload?.sessionTTL || 7);
        setResetAt(data.payload?.resetAt || null);
        if (Array.isArray(data.payload?.liveBuffer) && data.payload.liveBuffer.length > 0) {
          ingestEvents(data.payload.liveBuffer);
        }
      }

      if (data.type === 'CLEAR_ALL_DONE') {
        setResetAt(data.payload?.resetAt || new Date().toISOString());
      }
    };

    const onStorageChanged = (changes) => {
      if (changes.liveBuffer?.newValue) {
        ingestEvents(changes.liveBuffer.newValue.slice(0, 5));
      }
      if (changes.connected) {
        setConnected(Boolean(changes.connected.newValue));
      }
      if (changes.sessionTTL) {
        setSessionTTL(changes.sessionTTL.newValue || 7);
      }
      if (changes.resetAt) {
        setResetAt(changes.resetAt.newValue || null);
      }
    };

    window.addEventListener('message', onMessage);

    if (window.chrome?.storage?.onChanged) {
      window.chrome.storage.onChanged.addListener(onStorageChanged);
    }

    readExtensionSync();

    return () => {
      window.removeEventListener('message', onMessage);
      if (window.chrome?.storage?.onChanged) {
        window.chrome.storage.onChanged.removeListener(onStorageChanged);
      }
    };
  }, [ingestEvents, setConnected, setSessionTTL, setResetAt]);
}
