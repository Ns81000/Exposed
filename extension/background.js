let trackers = {};
let companies = {};
const MAX_BUFFER = 500;
const tabMeta = new Map();

async function loadLists() {
  if (Object.keys(trackers).length && Object.keys(companies).length) return;

  const [trackerResponse, companyResponse] = await Promise.all([
    fetch(chrome.runtime.getURL('data/trackers.json')),
    fetch(chrome.runtime.getURL('data/companies.json'))
  ]);

  trackers = await trackerResponse.json();
  companies = await companyResponse.json();
}

function getRootDomain(hostname) {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

function createVisitId(siteDomain) {
  const minute = Math.floor(Date.now() / 60000);
  return `v_${siteDomain}_${minute}`;
}

function safeParseUrl(rawUrl) {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

function matchTracker(url) {
  const parsed = safeParseUrl(url);
  if (!parsed) return null;

  const root = getRootDomain(parsed.hostname);
  if (!trackers[root]) return null;

  const company = companies[root] || {
    company: root,
    category: 'Unknown',
    risk: 'medium',
    description: 'Unknown tracker'
  };

  return {
    trackerDomain: root,
    company: company.company,
    category: company.category,
    risk: company.risk,
    description: company.description || 'No description available.',
    learnMore: company.learnMore || ''
  };
}

async function pushToLiveBuffer(event) {
  const { liveBuffer = [] } = await chrome.storage.local.get('liveBuffer');
  const updated = [event, ...liveBuffer].slice(0, MAX_BUFFER);
  await chrome.storage.local.set({
    liveBuffer: updated,
    connected: true,
    lastSeen: event.timestamp
  });
}

function pushRuntimeEvent(event) {
  chrome.tabs.query({ url: 'http://localhost:5173/*' }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { type: 'TRACKER_EVENT', payload: event }, () => {
        void chrome.runtime.lastError;
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({ connected: true, sessionTTL: 7, liveBuffer: [] });
  await loadLists();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'PAGE_METADATA' && typeof sender?.tab?.id === 'number') {
    tabMeta.set(sender.tab.id, {
      pageUrl: message.payload?.pageUrl,
      pageTitle: message.payload?.pageTitle,
      timestamp: message.payload?.timestamp || new Date().toISOString()
    });
    return;
  }

  if (message?.type === 'CLEAR_ALL_DATA') {
    const resetAt = new Date().toISOString();
    chrome.storage.local
      .set({
        liveBuffer: [],
        lastSeen: null,
        resetAt
      })
      .then(() => {
        tabMeta.clear();
        sendResponse({ ok: true, resetAt });
      })
      .catch(() => {
        sendResponse({ ok: false });
      });

    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabMeta.delete(tabId);
});

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    if (details.tabId < 0) return;

    await loadLists();

    const match = matchTracker(details.url);
    if (!match) return;

    let tab;
    try {
      tab = await chrome.tabs.get(details.tabId);
    } catch {
      return;
    }

    const tabUrl = safeParseUrl(tab.url);
    if (!tabUrl) return;

    const siteDomain = getRootDomain(tabUrl.hostname);
    const metadata = tabMeta.get(details.tabId);

    const event = {
      visitId: createVisitId(siteDomain),
      siteDomain,
      pageTitle: metadata?.pageTitle || tab.title || siteDomain,
      pageUrl: metadata?.pageUrl || tab.url,
      timestamp: new Date().toISOString(),
      trackerDomain: match.trackerDomain,
      company: match.company,
      category: match.category,
      risk: match.risk,
      description: match.description,
      learnMore: match.learnMore,
      requestUrl: details.url
    };

    await pushToLiveBuffer(event);
    pushRuntimeEvent(event);
  },
  { urls: ['<all_urls>'] }
);
