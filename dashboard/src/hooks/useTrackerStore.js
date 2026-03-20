import { create } from 'zustand';
import { db, recordTrackerEvent } from '../db/schema';

export const useTrackerStore = create((set, get) => ({
  connected: false,
  sessionTTL: 7,
  resetAt: localStorage.getItem('exposed_reset_at') || null,
  selectedDomain: null,
  sites: [],
  visits: [],
  trackerEvents: [],
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
  setSelectedDomain: (selectedDomain) => set({ selectedDomain }),
  setSelectedTracker: (selectedTracker) => set({ selectedTracker }),

  hydrate: async () => {
    const [sites, visits, trackerEvents, archives] = await Promise.all([
      db.sites.orderBy('lastSeen').reverse().toArray(),
      db.visits.orderBy('timestamp').reverse().toArray(),
      db.trackerEvents.orderBy('timestamp').reverse().toArray(),
      db.archives.orderBy('date').reverse().toArray()
    ]);

    const previousSelectedDomain = get().selectedDomain;
    const selectedDomain = sites.some((site) => site.domain === previousSelectedDomain)
      ? previousSelectedDomain
      : (sites[0]?.domain || null);
    set({ sites, visits, trackerEvents, archives, selectedDomain });
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
      }
    }

    await get().hydrate();
  }
}));
