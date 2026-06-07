let trackers = {};
let companies = {};
const MAX_BUFFER = 500;
const tabMeta = new Map();
const cnameCache = new Map();

async function checkCNAMETrackers(hostname) {
  if (cnameCache.has(hostname)) {
    return cnameCache.get(hostname);
  }

  if (hostname.includes('cloudflare-dns.com') || hostname.includes('dns.google')) {
    return null;
  }

  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=CNAME`;
    const res = await fetch(url, { headers: { 'accept': 'application/dns-json' } });
    const json = await res.json();
    
    if (json.Answer) {
      const cnameRecord = json.Answer.find(a => a.type === 5);
      if (cnameRecord && cnameRecord.data) {
        const cnameHost = cnameRecord.data.replace(/\.$/, '');
        const root = getRootDomain(cnameHost);
        
        if (trackers[root]) {
          const company = companies[root] || {
            company: root,
            category: 'Cloaked Tracker',
            risk: 'high',
            description: `CNAME Cloaked tracker resolving to ${cnameHost}`
          };

          const match = {
            trackerDomain: root,
            company: `${company.company} (Cloaked)`,
            category: company.category,
            risk: company.risk,
            description: company.description || 'CNAME cloaked tracker.',
            learnMore: company.learnMore || ''
          };
          
          cnameCache.set(hostname, match);
          return match;
        }
      }
    }
  } catch (e) {
    console.error('DoH resolve error for', hostname, e);
  }

  cnameCache.set(hostname, null);
  return null;
}

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
  chrome.tabs.query({ url: ['http://localhost:5173/*', 'https://exposed-dashboard.vercel.app/*'] }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { type: 'TRACKER_EVENT', payload: event }, () => {
        void chrome.runtime.lastError;
      });
    });
  });
}

function pushFingerprintEvent(event) {
  chrome.tabs.query({ url: ['http://localhost:5173/*', 'https://exposed-dashboard.vercel.app/*'] }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { type: 'FINGERPRINT_EVENT', payload: event }, () => {
        void chrome.runtime.lastError;
      });
    });
  });
}

async function updateBlockingRules() {
  if (!chrome.declarativeNetRequest) return;
  const { blockingEnabled = false } = await chrome.storage.local.get('blockingEnabled');
  
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(r => r.id);
  
  if (!blockingEnabled) {
    if (existingRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds
      });
    }
    return;
  }

  await loadLists();
  
  const rules = Object.keys(trackers).map((domain, index) => {
    return {
      id: index + 1,
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: `||${domain}`,
        resourceTypes: [
          'main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 
          'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 
          'media', 'websocket', 'other'
        ]
      }
    };
  });

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: rules
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({ connected: true, sessionTTL: 7, liveBuffer: [], blockingEnabled: false });
  await loadLists();
  await updateBlockingRules().catch(console.error);
});

// Sync rules on startup/worker wakeup
loadLists().then(updateBlockingRules).catch(console.error);

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'local' && changes.blockingEnabled) {
    await updateBlockingRules().catch(console.error);
  }
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

  if (message?.type === 'FINGERPRINT_ALERT' && typeof sender?.tab?.id === 'number') {
    const tabId = sender.tab.id;
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) return;
      const tabUrl = safeParseUrl(tab.url);
      if (!tabUrl) return;

      const siteDomain = getRootDomain(tabUrl.hostname);
      
      const event = {
        visitId: createVisitId(siteDomain),
        siteDomain,
        timestamp: new Date().toISOString(),
        api: message.payload?.api,
        stack: message.payload?.stack
      };

      pushFingerprintEvent(event);
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

function extractPayload(details) {
  const method = details.method || 'GET';
  let payload = null;

  const parsedReqUrl = safeParseUrl(details.url);
  if (parsedReqUrl && parsedReqUrl.search) {
    const params = {};
    for (const [key, val] of parsedReqUrl.searchParams.entries()) {
      params[key] = val;
    }
    payload = JSON.stringify(params);
  }

  if (details.requestBody) {
    if (details.requestBody.formData) {
      payload = JSON.stringify(details.requestBody.formData);
    } else if (details.requestBody.raw && details.requestBody.raw.length > 0) {
      try {
        const decoder = new TextDecoder('utf-8');
        const rawParts = details.requestBody.raw.map(part => {
          if (part.bytes) {
            return decoder.decode(new Uint8Array(part.bytes));
          }
          return '';
        });
        payload = rawParts.join('');
      } catch {
        payload = '[Raw Data Binary]';
      }
    }
  }
  return payload;
}

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    if (details.tabId < 0) return;

    await loadLists();

    let match = matchTracker(details.url);
    if (!match) {
      const parsed = safeParseUrl(details.url);
      if (parsed) {
        match = await checkCNAMETrackers(parsed.hostname);
      }
    }
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

    const payload = extractPayload(details);

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
      requestUrl: details.url,
      method: details.method || 'GET',
      payload,
      blocked: false
    };

    await pushToLiveBuffer(event);
    pushRuntimeEvent(event);
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
);

chrome.webRequest.onErrorOccurred.addListener(
  async (details) => {
    if (details.tabId < 0) return;

    await loadLists();

    let match = matchTracker(details.url);
    if (!match) {
      const parsed = safeParseUrl(details.url);
      if (parsed) {
        match = await checkCNAMETrackers(parsed.hostname);
      }
    }
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

    const payload = extractPayload(details);

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
      requestUrl: details.url,
      method: details.method || 'GET',
      payload,
      blocked: true,
      size: 0
    };

    await pushToLiveBuffer(event);
    pushRuntimeEvent(event);
  },
  { urls: ['<all_urls>'] }
);

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (details.tabId < 0) return;

    await loadLists();

    let match = matchTracker(details.url);
    if (!match) {
      const parsed = safeParseUrl(details.url);
      if (parsed) {
        match = await checkCNAMETrackers(parsed.hostname);
      }
    }
    if (!match) return;

    const contentLengthHeader = details.responseHeaders?.find(
      (h) => h.name.toLowerCase() === 'content-length'
    );
    const size = contentLengthHeader ? parseInt(contentLengthHeader.value, 10) : 0;

    chrome.tabs.query({ url: ['http://localhost:5173/*', 'https://exposed-dashboard.vercel.app/*'] }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { 
          type: 'TRACKER_SIZE_UPDATE', 
          payload: { 
            requestUrl: details.url,
            size 
          } 
        }, () => {
          void chrome.runtime.lastError;
        });
      });
    });
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);
