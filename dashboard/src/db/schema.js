import Dexie from 'dexie';

export const db = new Dexie('ExposedDB');

db.version(1).stores({
  sites: '++id, &domain, firstSeen, lastSeen, totalTrackers',
  visits: '++id, visitId, siteDomain, timestamp, pageTitle, pageUrl, trackerCount',
  trackerEvents: '++id, [visitId+requestUrl], visitId, siteDomain, timestamp, trackerDomain, company, category, risk',
  archives: '++id, &date, createdAt'
});

export async function upsertSite(domain, timestamp) {
  const existing = await db.sites.where('domain').equals(domain).first();
  if (existing) {
    await db.sites.update(existing.id, {
      lastSeen: timestamp,
      totalTrackers: existing.totalTrackers + 1
    });
    return;
  }

  await db.sites.add({
    domain,
    firstSeen: timestamp,
    lastSeen: timestamp,
    totalTrackers: 1
  });
}

export async function upsertVisit(event) {
  const existing = await db.visits.where('visitId').equals(event.visitId).first();
  if (existing) {
    await db.visits.update(existing.id, {
      trackerCount: existing.trackerCount + 1,
      timestamp: event.timestamp,
      pageTitle: event.pageTitle,
      pageUrl: event.pageUrl
    });
    return existing.id;
  }

  return db.visits.add({
    visitId: event.visitId,
    siteDomain: event.siteDomain,
    timestamp: event.timestamp,
    pageTitle: event.pageTitle,
    pageUrl: event.pageUrl,
    trackerCount: 1
  });
}

export async function recordTrackerEvent(event) {
  const visitRowId = await upsertVisit(event);
  await upsertSite(event.siteDomain, event.timestamp);
  await db.trackerEvents.add({
    visitId: event.visitId,
    visitRowId,
    siteDomain: event.siteDomain,
    timestamp: event.timestamp,
    trackerDomain: event.trackerDomain,
    company: event.company,
    category: event.category,
    risk: event.risk,
    description: event.description,
    learnMore: event.learnMore,
    requestUrl: event.requestUrl
  });
}

export async function clearAllTrackingData() {
  await db.transaction('rw', db.sites, db.visits, db.trackerEvents, db.archives, async () => {
    await db.trackerEvents.clear();
    await db.visits.clear();
    await db.sites.clear();
    await db.archives.clear();
  });
}
