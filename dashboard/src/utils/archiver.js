import { db } from '../db/schema';

function toDayString(date) {
  return date.toISOString().split('T')[0];
}

function mostFrequent(values) {
  const freq = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const winner = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  return winner ? winner[0] : 'N/A';
}

async function refreshSitesTable() {
  const [visits, events] = await Promise.all([db.visits.toArray(), db.trackerEvents.toArray()]);

  const eventCountByDomain = events.reduce((acc, event) => {
    acc[event.siteDomain] = (acc[event.siteDomain] || 0) + 1;
    return acc;
  }, {});

  const siteMap = visits.reduce((acc, visit) => {
    const current = acc[visit.siteDomain] || {
      domain: visit.siteDomain,
      firstSeen: visit.timestamp,
      lastSeen: visit.timestamp,
      totalTrackers: 0
    };

    if (visit.timestamp < current.firstSeen) current.firstSeen = visit.timestamp;
    if (visit.timestamp > current.lastSeen) current.lastSeen = visit.timestamp;
    acc[visit.siteDomain] = current;
    return acc;
  }, {});

  Object.values(siteMap).forEach((site) => {
    site.totalTrackers = eventCountByDomain[site.domain] || 0;
  });

  await db.sites.clear();
  const rebuilt = Object.values(siteMap);
  if (rebuilt.length) {
    await db.sites.bulkAdd(rebuilt);
  }
}

export async function runDailyArchive() {
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterday = toDayString(yesterdayDate);

  const alreadyArchived = await db.archives.where('date').equals(yesterday).count();
  if (alreadyArchived > 0) return;

  const start = `${yesterday}T00:00:00.000Z`;
  const end = `${yesterday}T23:59:59.999Z`;

  const visits = await db.visits.where('timestamp').between(start, end, true, true).toArray();
  if (!visits.length) return;

  const events = await db.trackerEvents.where('timestamp').between(start, end, true, true).toArray();

  const summary = {
    totalSites: new Set(visits.map((visit) => visit.siteDomain)).size,
    totalTrackers: events.length,
    topCompany: mostFrequent(events.map((event) => event.company)),
    riskBreakdown: {
      high: events.filter((event) => event.risk === 'high').length,
      medium: events.filter((event) => event.risk === 'medium').length,
      low: events.filter((event) => event.risk === 'low').length
    }
  };

  await db.transaction('rw', db.archives, db.trackerEvents, db.visits, async () => {
    await db.archives.add({
      date: yesterday,
      createdAt: new Date().toISOString(),
      data: {
        visits,
        trackerEvents: events,
        summary
      }
    });

    await db.trackerEvents.where('timestamp').between(start, end, true, true).delete();
    await db.visits.where('timestamp').between(start, end, true, true).delete();
  });

  await refreshSitesTable();
}

export async function cleanExpiredSessions(ttlDays) {
  if (!ttlDays || ttlDays <= 0) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ttlDays);
  const threshold = cutoff.toISOString();

  await db.transaction('rw', db.trackerEvents, db.visits, async () => {
    await db.trackerEvents.where('timestamp').below(threshold).delete();
    await db.visits.where('timestamp').below(threshold).delete();
  });

  await refreshSitesTable();
}
