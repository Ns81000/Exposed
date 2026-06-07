import Dexie from 'dexie';

export const db = new Dexie('ExposedDB');

db.version(1).stores({
  sites: '++id, &domain, firstSeen, lastSeen, totalTrackers',
  visits: '++id, visitId, siteDomain, timestamp, pageTitle, pageUrl, trackerCount',
  trackerEvents: '++id, [visitId+requestUrl], visitId, siteDomain, timestamp, trackerDomain, company, category, risk',
  archives: '++id, &date, createdAt'
});

db.version(2).stores({
  sites: '++id, &domain, firstSeen, lastSeen, totalTrackers',
  visits: '++id, visitId, siteDomain, timestamp, pageTitle, pageUrl, trackerCount, fingerprintCount',
  trackerEvents: '++id, [visitId+requestUrl], visitId, siteDomain, timestamp, trackerDomain, company, category, risk, payload, method, blocked',
  fingerprintEvents: '++id, visitId, siteDomain, timestamp, api, stack',
  archives: '++id, &date, createdAt'
}).upgrade(tx => {
  return tx.visits.toCollection().modify(visit => {
    if (visit.fingerprintCount === undefined) {
      visit.fingerprintCount = 0;
    }
  });
});

db.version(3).stores({
  sites: '++id, &domain, firstSeen, lastSeen, totalTrackers',
  visits: '++id, visitId, siteDomain, timestamp, pageTitle, pageUrl, trackerCount, fingerprintCount',
  trackerEvents: '++id, [visitId+requestUrl], visitId, siteDomain, timestamp, trackerDomain, company, category, risk, payload, method, blocked, size',
  fingerprintEvents: '++id, visitId, siteDomain, timestamp, api, stack',
  archives: '++id, &date, createdAt'
}).upgrade(tx => {
  return tx.trackerEvents.toCollection().modify(event => {
    if (event.size === undefined) {
      event.size = 0;
    }
  });
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
    trackerCount: 1,
    fingerprintCount: 0
  });
}

export async function incrementVisitFingerprint(visitId, siteDomain, timestamp) {
  const existing = await db.visits.where('visitId').equals(visitId).first();
  if (existing) {
    const nextCount = (existing.fingerprintCount || 0) + 1;
    await db.visits.update(existing.id, {
      fingerprintCount: nextCount,
      timestamp
    });
    return existing.id;
  }

  return db.visits.add({
    visitId,
    siteDomain,
    timestamp,
    pageTitle: siteDomain,
    pageUrl: `https://${siteDomain}`,
    trackerCount: 0,
    fingerprintCount: 1
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
    requestUrl: event.requestUrl,
    payload: event.payload || null,
    method: event.method || 'GET',
    blocked: Boolean(event.blocked),
    size: event.size || 0
  });
}

export async function recordFingerprintEvent(event) {
  const visitRowId = await incrementVisitFingerprint(event.visitId, event.siteDomain, event.timestamp);
  await upsertSite(event.siteDomain, event.timestamp);
  await db.fingerprintEvents.add({
    visitId: event.visitId,
    visitRowId,
    siteDomain: event.siteDomain,
    timestamp: event.timestamp,
    api: event.api,
    stack: event.stack
  });
}

export async function clearAllTrackingData() {
  await db.transaction('rw', db.sites, db.visits, db.trackerEvents, db.fingerprintEvents, db.archives, async () => {
    await db.trackerEvents.clear();
    await db.visits.clear();
    await db.sites.clear();
    await db.archives.clear();
    await db.fingerprintEvents.clear();
  });
}

