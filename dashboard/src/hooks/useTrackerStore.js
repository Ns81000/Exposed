import { create } from 'zustand';
import { db, recordTrackerEvent, recordFingerprintEvent } from '../db/schema';

export const useTrackerStore = create((set, get) => ({
  connected: false,
  sessionTTL: 7,
  resetAt: localStorage.getItem('exposed_reset_at') || null,
  blockingEnabled: localStorage.getItem('exposed_blocking_enabled') === 'true',
  selectedDomain: null,
  sites: [],
  visits: [],
  trackerEvents: [],
  fingerprintEvents: [],
  archives: [],
  selectedTracker: null,

  setConnected: (connected) => set({ connected }),
  setSessionTTL: (sessionTTL) => set({ sessionTTL }),
  setResetAt: (resetAt) => {
    if (resetAt) {
      localStorage.setItem('exposed_reset_at', resetAt);
    } else {
      localStorage.removeItem('exposed_reset_at');
    }
    set({ resetAt });
  },
  setBlockingEnabled: async (blockingEnabled) => {
    set({ blockingEnabled });
    localStorage.setItem('exposed_blocking_enabled', blockingEnabled ? 'true' : 'false');
    if (window.chrome?.storage?.local) {
      await window.chrome.storage.local.set({ blockingEnabled });
    }
    // Forward the status to the extension background script via window message if running in webpage
    window.postMessage({ source: 'EXPOSED_DASHBOARD', type: 'BLOCKING_TOGGLE', payload: { blockingEnabled } }, '*');
  },
  setSelectedDomain: (selectedDomain) => set({ selectedDomain }),
  setSelectedTracker: (selectedTracker) => set({ selectedTracker }),

  hydrate: async () => {
    const [sites, visits, trackerEvents, archives, fingerprintEvents] = await Promise.all([
      db.sites.orderBy('lastSeen').reverse().toArray(),
      db.visits.orderBy('timestamp').reverse().toArray(),
      db.trackerEvents.orderBy('timestamp').reverse().toArray(),
      db.archives.orderBy('date').reverse().toArray(),
      db.fingerprintEvents ? db.fingerprintEvents.orderBy('timestamp').reverse().toArray() : []
    ]);

    const previousSelectedDomain = get().selectedDomain;
    const selectedDomain = sites.some((site) => site.domain === previousSelectedDomain)
      ? previousSelectedDomain
      : (sites[0]?.domain || null);
    set({ sites, visits, trackerEvents, archives, fingerprintEvents, selectedDomain });
  },

  ingestEvents: async (events) => {
    const eventList = Array.isArray(events) ? events : [events];
    const resetAt = get().resetAt;
    const resetMs = resetAt ? new Date(resetAt).valueOf() : 0;

    for (const event of eventList) {
      if (!event || !event.timestamp || !event.siteDomain || !event.visitId) continue;
      if (resetMs && new Date(event.timestamp).valueOf() <= resetMs) continue;

      const existing = await db.trackerEvents
        .where('[visitId+requestUrl]')
        .equals([event.visitId, event.requestUrl])
        .first()
        .catch(() => null);

      if (!existing) {
        await recordTrackerEvent(event);
      } else if (existing.blocked !== event.blocked) {
        // Update blocked status if it has changed
        await db.trackerEvents.update(existing.id, { blocked: Boolean(event.blocked) });
      }
    }

    await get().hydrate();
  },

  ingestFingerprintEvents: async (events) => {
    const eventList = Array.isArray(events) ? events : [events];
    const resetAt = get().resetAt;
    const resetMs = resetAt ? new Date(resetAt).valueOf() : 0;

    for (const event of eventList) {
      if (!event || !event.timestamp || !event.siteDomain || !event.visitId) continue;
      if (resetMs && new Date(event.timestamp).valueOf() <= resetMs) continue;

      // Prevent identical API calls inside the same visit from spamming the DB within 1 second
      const existing = await db.fingerprintEvents
        .where('visitId')
        .equals(event.visitId)
        .filter(e => e.api === event.api && Math.abs(new Date(e.timestamp).valueOf() - new Date(event.timestamp).valueOf()) < 1000)
        .first()
        .catch(() => null);

      if (!existing) {
        await recordFingerprintEvent(event);
      }
    }

    await get().hydrate();
  }
}));

