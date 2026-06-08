import { riskAccent } from './riskColor';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function exportSiteReport(site, visits, events, fingerprints = []) {
  const totalTrackers = events.length;
  const blockedTrackers = events.filter((e) => e.blocked).length;
  const blockedPct = totalTrackers > 0 ? Math.round((blockedTrackers / totalTrackers) * 100) : 0;
  
  let score = 100;
  let bytesExfiltrated = 0;
  let bytesSaved = 0;

  events.forEach((e) => {
    const size = e.size || 0;
    if (e.blocked) {
      if (e.risk === 'high') score -= 3;
      else if (e.risk === 'medium') score -= 1;
      bytesSaved += 12 * 1024; // Estimate 12KB saved per blocked request
    } else {
      if (e.risk === 'high') score -= 15;
      else if (e.risk === 'medium') score -= 5;
      else score -= 2;
      bytesExfiltrated += size > 0 ? size : (8 * 1024); // Estimate 8KB baseline if size is 0
    }
  });

  if (fingerprints.length > 0) {
    score -= 25;
  }

  score = Math.max(0, Math.min(100, score));

  let grade = 'A';
  let gradeColor = '#10b981'; // Green
  if (score < 55) {
    grade = 'F';
    gradeColor = '#ef4444'; // Red
  } else if (score < 70) {
    grade = 'D';
    gradeColor = '#f97316'; // Orange
  } else if (score < 80) {
    grade = 'C';
    gradeColor = '#f59e0b'; // Amber
  } else if (score < 90) {
    grade = 'B';
    gradeColor = '#3b82f6'; // Blue
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const exfiltratedStr = formatBytes(bytesExfiltrated);
  const savedStr = formatBytes(bytesSaved);

  const trackerRows = events.map((event, index) => {
    const isBlocked = !!event.blocked;
    const sizeStr = isBlocked ? '0 B (Blocked)' : (event.size ? formatBytes(event.size) : 'Pending');
    const riskColor = riskAccent(event.risk);
    const statusText = isBlocked ? 'Blocked' : 'Allowed';
    const statusClass = isBlocked ? 'badge-blocked' : 'badge-allowed';
    
    let paramsHtml = '';
    if (event.payload) {
      try {
        const payloadObj = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
        const entries = Object.entries(payloadObj);
        if (entries.length > 0) {
          paramsHtml = `<div class="params-grid">` + 
            entries.map(([k, v]) => `
              <div class="param-item">
                <span class="param-key">${escapeHtml(k)}</span>
                <span class="param-value">${escapeHtml(typeof v === 'object' ? JSON.stringify(v) : v)}</span>
              </div>
            `).join('') + `</div>`;
        } else {
          paramsHtml = `<span class="text-muted">Empty payload parameters</span>`;
        }
      } catch (err) {
        paramsHtml = `<span class="text-muted">Plaintext payload: ${escapeHtml(event.payload)}</span>`;
      }
    } else {
      paramsHtml = `<span class="text-muted">No exfiltrated parameters detected</span>`;
    }

    return `
      <tr class="tracker-row" onclick="toggleDetails('tracker-det-${index}')" data-company="${escapeHtml(event.company).toLowerCase()}" data-domain="${escapeHtml(event.trackerDomain).toLowerCase()}" data-risk="${escapeHtml(event.risk)}" data-status="${statusText.toLowerCase()}">
        <td>
          <div class="company-name font-medium">${escapeHtml(event.company)}</div>
        </td>
        <td>${escapeHtml(event.category)}</td>
        <td><span class="risk-badge" style="background: ${riskColor}15; color: ${riskColor}; border: 1px solid ${riskColor}30">${escapeHtml(event.risk?.toUpperCase())}</span></td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td class="tabular-nums">${sizeStr}</td>
        <td class="font-mono text-xs">${escapeHtml(event.trackerDomain)}</td>
        <td class="tabular-nums text-muted">${escapeHtml(new Date(event.timestamp).toLocaleTimeString())}</td>
      </tr>
      <tr id="tracker-det-${index}" class="details-row" style="display: none;">
        <td colspan="7">
          <div class="details-content">
            <div class="details-meta">
              <div><strong>Method:</strong> <span class="font-mono">${escapeHtml(event.method || 'GET')}</span></div>
              <div><strong>Block Shield:</strong> <span class="font-mono">${isBlocked ? 'Blocked' : 'Allowed / Allowed'}</span></div>
              <div><strong>Request URL:</strong> <span class="font-mono break-all text-xs" style="color: var(--color-accent)">${escapeHtml(event.requestUrl || event.trackerDomain)}</span></div>
            </div>
            <div style="margin-top: 12px;">
              <strong>Exfiltrated Telemetry Parameters:</strong>
              <div style="margin-top: 6px;">${paramsHtml}</div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const fingerprintRows = fingerprints.length > 0 
    ? fingerprints.map((fp, index) => {
        const stackLines = fp.stack
          ? fp.stack
              .split('\n')
              .map((line) => `<div class="stack-line">${escapeHtml(line)}</div>`)
              .join('')
          : '<div class="stack-line text-muted">No stack trace available</div>';

        return `
          <tr class="tracker-row" onclick="toggleDetails('fp-det-${index}')">
            <td class="font-mono text-red-accent font-medium">${escapeHtml(fp.api)}</td>
            <td><span class="badge-heuristic">Heuristic Alert</span></td>
            <td class="font-mono text-xs">${escapeHtml(fp.trackerDomain || 'Injected Context')}</td>
            <td class="tabular-nums text-muted">${escapeHtml(new Date(fp.timestamp).toLocaleTimeString())}</td>
          </tr>
          <tr id="fp-det-${index}" class="details-row" style="display: none;">
            <td colspan="4">
              <div class="details-content">
                <div style="margin-bottom: 8px;"><strong>API Vector:</strong> <span class="font-mono text-red-accent">${escapeHtml(fp.api)}</span></div>
                <strong>Execution Call Stack:</strong>
                <div class="stack-trace-container">${stackLines}</div>
              </div>
            </td>
          </tr>
        `;
      }).join('')
    : `<tr><td colspan="4" class="empty-state">No browser fingerprinting attempts detected.</td></tr>`;

  const visitRows = visits.length > 0
    ? visits.map((v) => `
        <tr>
          <td class="font-mono text-xs">${escapeHtml(v.visitId)}</td>
          <td class="tabular-nums">${escapeHtml(new Date(v.timestamp).toLocaleString())}</td>
          <td class="tabular-nums font-medium">${escapeHtml(v.trackerCount || 0)} Trackers</td>
          <td class="tabular-nums font-medium">${escapeHtml(v.fingerprintCount || 0)} Alerts</td>
        </tr>
      `).join('')
    : `<tr><td colspan="4" class="empty-state">No visits recorded.</td></tr>`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Exposed Report - ${escapeHtml(site.domain)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-bg: #07080a;
      --color-surface: #0e0f12;
      --color-border: rgba(255, 255, 255, 0.05);
      --color-text: #f4f3ee;
      --color-muted: #9a9893;
      --color-accent: #ff6a00;
      --color-danger: #ff3344;
      --color-success: #28cd41;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px 32px;
      background-color: var(--color-bg);
      color: var(--color-text);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      line-height: 1.5;
    }

    h1, h2, h3, .brand-logo {
      font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
      font-weight: 500;
      margin: 0;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 24px;
      margin-bottom: 28px;
    }

    .brand-logo {
      font-size: 26px;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.02em;
    }
    .brand-logo span {
      color: var(--color-accent);
    }

    .meta-info { text-align: right; }
    .meta-site { font-size: 20px; color: var(--color-text); font-weight: 500; margin-bottom: 4px; }
    .meta-time { font-size: 12px; color: var(--color-muted); }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 110px;
    }

    .stat-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-muted);
      margin-bottom: 6px;
      font-weight: 600;
    }

    .stat-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-value { font-size: 28px; font-weight: 600; color: var(--color-text); }
    .stat-subtext { font-size: 10px; color: var(--color-muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.05em; }

    .grade-badge-large {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
    }

    .tab-buttons {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 20px;
    }

    .tab-btn {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--color-muted);
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .tab-btn:hover { color: var(--color-text); }
    .tab-btn.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }

    .tab-content { display: none; }
    .tab-content.active { display: block; }

    .controls-row { display: flex; gap: 12px; margin-bottom: 16px; }
    .search-input {
      flex: 1;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
    }
    .search-input:focus { border-color: var(--color-accent); }

    .filter-select {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      cursor: pointer;
      font-family: inherit;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background: #141416;
      color: var(--color-text);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid var(--color-border);
    }

    td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid var(--color-border); }

    .tracker-row { cursor: pointer; transition: background-color 0.1s; }
    .tracker-row:hover { background-color: #202023; }

    .status-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-blocked { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.2); }
    .badge-allowed { background: rgba(16, 185, 129, 0.1); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.2); }
    .badge-heuristic { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.2); font-size: 9px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 600; }

    .risk-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }

    .details-row { background-color: #111113; }
    .details-content { padding: 20px; border-top: 1px dashed var(--color-border); border-bottom: 1px dashed var(--color-border); }
    .details-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border); }

    .params-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      background: #09090b;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 12px;
      margin-top: 8px;
      max-height: 240px;
      overflow-y: auto;
    }

    .param-item { display: flex; font-size: 12px; border-bottom: 1px solid #141416; padding-bottom: 6px; }
    .param-item:last-child { border-bottom: none; padding-bottom: 0; }
    .param-key { font-family: monospace; color: var(--color-danger); width: 180px; flex-shrink: 0; word-break: break-all; }
    .param-value { font-family: monospace; color: var(--color-muted); word-break: break-all; }

    .stack-trace-container {
      background: #09090b;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 12px;
      margin-top: 8px;
      font-family: monospace;
      font-size: 11px;
      color: var(--color-muted);
      max-height: 200px;
      overflow-y: auto;
    }
    .stack-line { margin-bottom: 4px; white-space: pre-wrap; word-break: break-all; }

    .text-red-accent { color: var(--color-danger); }
    .font-mono { font-family: monospace; }
    .font-medium { font-weight: 500; }
    .text-xs { font-size: 12px; }
    .text-muted { color: var(--color-muted); }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    .break-all { word-break: break-all; }
    .empty-state { text-align: center; padding: 40px; color: var(--color-muted); font-size: 14px; }
  </style>
</head>
<body>
  <div class="header-container">
    <div>
      <div class="brand-logo">expos<span>.</span>ed</div>
      <div style="font-size: 12px; color: var(--color-muted); margin-top: 2px;">Local-First Privacy Intelligence Platform</div>
    </div>
    <div class="meta-info">
      <div class="meta-site">${escapeHtml(site.domain)}</div>
      <div class="meta-time">Exported ${escapeHtml(new Date().toLocaleString())}</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div>
        <div class="stat-title">Privacy Grade</div>
        <div class="stat-main">
          <div class="stat-value" style="color: ${gradeColor}">Safety ${score}/100</div>
          <span class="grade-badge-large" style="background: ${gradeColor}20; color: ${gradeColor}; border: 1px solid ${gradeColor}40">${grade}</span>
        </div>
      </div>
      <div class="stat-subtext">Calculated Privacy Rating</div>
    </div>

    <div class="stat-card">
      <div>
        <div class="stat-title">Trackers Captured</div>
        <div class="stat-value tabular-nums">${totalTrackers}</div>
      </div>
      <div class="stat-subtext">${totalTrackers - blockedTrackers} Allowed · ${exfiltratedStr} load</div>
    </div>

    <div class="stat-card">
      <div>
        <div class="stat-title">Shield Protection</div>
        <div class="stat-value tabular-nums">${blockedPct}%</div>
      </div>
      <div class="stat-subtext">${blockedTrackers} Blocked · ${savedStr} saved</div>
    </div>

    <div class="stat-card">
      <div>
        <div class="stat-title">Fingerprints</div>
        <div class="stat-value tabular-nums">${fingerprints.length}</div>
      </div>
      <div class="stat-subtext">${fingerprints.length > 0 ? 'Profiling Detected' : 'No profiling detected'}</div>
    </div>
  </div>

  <div class="tabs-container">
    <div class="tab-buttons">
      <button class="tab-btn active" onclick="showTab(event, 'tracker-tab')">Tracker Network (${totalTrackers})</button>
      <button class="tab-btn" onclick="showTab(event, 'fingerprint-tab')">Fingerprint Alerts (${fingerprints.length})</button>
      <button class="tab-btn" onclick="showTab(event, 'visit-tab')">Visit History (${visits.length})</button>
    </div>

    <!-- Tracker network tab -->
    <div id="tracker-tab" class="tab-content active">
      <div class="controls-row">
        <input type="text" id="search-box" class="search-input" placeholder="Search trackers by company or domain name..." oninput="applyFilters()" />
        
        <select id="filter-risk" class="filter-select" onchange="applyFilters()">
          <option value="all">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>

        <select id="filter-status" class="filter-select" onchange="applyFilters()">
          <option value="all">All Shield Statuses</option>
          <option value="blocked">Blocked</option>
          <option value="allowed">Allowed</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Category</th>
            <th>Risk</th>
            <th>Shield Status</th>
            <th>Payload Size</th>
            <th>Domain</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody id="trackers-tbody">
          ${trackerRows}
          <tr id="tracker-empty-row" style="display: none;">
            <td colspan="7" class="empty-state">No trackers match the search or filter criteria.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Fingerprint Alerts tab -->
    <div id="fingerprint-tab" class="tab-content">
      <table>
        <thead>
          <tr>
            <th>API / Vector</th>
            <th>Severity</th>
            <th>Trigger Context</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${fingerprintRows}
        </tbody>
      </table>
    </div>

    <!-- Visit history tab -->
    <div id="visit-tab" class="tab-content">
      <table>
        <thead>
          <tr>
            <th>Visit Session ID</th>
            <th>Timestamp</th>
            <th>Trackers Found</th>
            <th>Heuristics Triggered</th>
          </tr>
        </thead>
        <tbody>
          ${visitRows}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    function showTab(event, tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      
      document.getElementById(tabId).classList.add('active');
      event.currentTarget.classList.add('active');
    }

    function toggleDetails(id) {
      const el = document.getElementById(id);
      if (el.style.display === 'none') {
        el.style.display = 'table-row';
      } else {
        el.style.display = 'none';
      }
    }

    function applyFilters() {
      const searchVal = document.getElementById('search-box').value.toLowerCase();
      const riskVal = document.getElementById('filter-risk').value;
      const statusVal = document.getElementById('filter-status').value;
      
      const tbody = document.getElementById('trackers-tbody');
      const rows = tbody.querySelectorAll('.tracker-row');
      let visibleCount = 0;
      
      rows.forEach(row => {
        const company = row.getAttribute('data-company');
        const domain = row.getAttribute('data-domain');
        const risk = row.getAttribute('data-risk');
        const status = row.getAttribute('data-status');
        const detailId = row.nextElementSibling.id;
        
        const matchesSearch = company.includes(searchVal) || domain.includes(searchVal);
        const matchesRisk = riskVal === 'all' || risk === riskVal;
        const matchesStatus = statusVal === 'all' || status === statusVal;
        
        if (matchesSearch && matchesRisk && matchesStatus) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
          document.getElementById(detailId).style.display = 'none';
        }
      });

      const emptyRow = document.getElementById('tracker-empty-row');
      if (visibleCount === 0) {
        emptyRow.style.display = '';
      } else {
        emptyRow.style.display = 'none';
      }
    }
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `exposed-site-report-${site.domain}-${Date.now()}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportArchiveReport(archive) {
  const trackerEvents = archive.data?.trackerEvents || [];
  const totalSites = new Set(trackerEvents.map((e) => e.siteDomain)).size;
  const totalEvents = trackerEvents.length;
  const totalBlocked = trackerEvents.filter((e) => e.blocked).length;
  const blockedPct = totalEvents > 0 ? Math.round((totalBlocked / totalEvents) * 100) : 0;
  
  let totalBytes = 0;
  trackerEvents.forEach((e) => {
    if (!e.blocked) {
      totalBytes += e.size || (8 * 1024);
    }
  });

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const archiveRows = trackerEvents.map((event) => {
    const isBlocked = !!event.blocked;
    const sizeStr = isBlocked ? '0 B' : (event.size ? formatBytes(event.size) : '8.0 KB (Est)');
    const riskColor = riskAccent(event.risk);
    const statusText = isBlocked ? 'Blocked' : 'Allowed';
    const statusClass = isBlocked ? 'badge-blocked' : 'badge-allowed';

    return `
      <tr class="archive-row" data-site="${escapeHtml(event.siteDomain).toLowerCase()}" data-company="${escapeHtml(event.company).toLowerCase()}">
        <td class="font-medium">${escapeHtml(event.siteDomain)}</td>
        <td>${escapeHtml(event.company)}</td>
        <td>${escapeHtml(event.category)}</td>
        <td><span class="risk-badge" style="background: ${riskColor}15; color: ${riskColor}; border: 1px solid ${riskColor}30">${escapeHtml(event.risk?.toUpperCase())}</span></td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td class="tabular-nums">${sizeStr}</td>
        <td class="font-mono text-xs text-muted break-all">${escapeHtml(event.trackerDomain)}</td>
      </tr>
    `;
  }).join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Exposed Archive - ${escapeHtml(archive.date)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-bg: #07080a;
      --color-surface: #0e0f12;
      --color-border: rgba(255, 255, 255, 0.05);
      --color-text: #f4f3ee;
      --color-muted: #9a9893;
      --color-accent: #ff6a00;
      --color-danger: #ff3344;
      --color-success: #28cd41;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px 32px;
      background-color: var(--color-bg);
      color: var(--color-text);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      line-height: 1.5;
    }

    h1, h2, h3, .brand-logo {
      font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
      font-weight: 500;
      margin: 0;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 24px;
      margin-bottom: 28px;
    }

    .brand-logo {
      font-size: 26px;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.02em;
    }
    .brand-logo span {
      color: var(--color-accent);
    }

    .meta-info { text-align: right; }
    .meta-site { font-size: 20px; color: var(--color-text); font-weight: 500; margin-bottom: 4px; }
    .meta-time { font-size: 12px; color: var(--color-muted); }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 100px;
    }

    .stat-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-muted);
      margin-bottom: 6px;
      font-weight: 600;
    }

    .stat-value { font-size: 28px; font-weight: 600; color: var(--color-text); }
    .stat-subtext { font-size: 10px; color: var(--color-muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.05em; }

    .controls-row { display: flex; gap: 12px; margin-bottom: 16px; }
    .search-input {
      flex: 1;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
    }
    .search-input:focus { border-color: var(--color-accent); }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background: #141416;
      color: var(--color-text);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid var(--color-border);
    }

    td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid var(--color-border); }

    .status-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-blocked { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.2); }
    .badge-allowed { background: rgba(16, 185, 129, 0.1); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.2); }
    .risk-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }

    .font-mono { font-family: monospace; }
    .font-medium { font-weight: 500; }
    .text-xs { font-size: 12px; }
    .text-muted { color: var(--color-muted); }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    .break-all { word-break: break-all; }
    .empty-state { text-align: center; padding: 40px; color: var(--color-muted); font-size: 14px; }
  </style>
</head>
<body>
  <div class="header-container">
    <div>
      <div class="brand-logo">expos<span>.</span>ed</div>
      <div style="font-size: 12px; color: var(--color-muted); margin-top: 2px;">Local-First Privacy Intelligence Platform</div>
    </div>
    <div class="meta-info">
      <div class="meta-site">Daily Archive Report</div>
      <div class="meta-time">Date: ${escapeHtml(archive.date)}</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div>
        <div class="stat-title">Sites Investigated</div>
        <div class="stat-value tabular-nums">${totalSites}</div>
      </div>
      <div class="stat-subtext">Unique domains tracked</div>
    </div>

    <div class="stat-card">
      <div>
        <div class="stat-title">Total Trackers</div>
        <div class="stat-value tabular-nums">${totalEvents}</div>
      </div>
      <div class="stat-subtext">${totalBlocked} Blocked · ${totalEvents - totalBlocked} Allowed</div>
    </div>

    <div class="stat-card">
      <div>
        <div class="stat-title">Block Protection</div>
        <div class="stat-value tabular-nums">${blockedPct}%</div>
      </div>
      <div class="stat-subtext">Average blocking coverage</div>
    </div>

    <div class="stat-card">
      <div>
        <div class="stat-title">Total Payload Size</div>
        <div class="stat-value tabular-nums">${formatBytes(totalBytes)}</div>
      </div>
      <div class="stat-subtext">Exfiltrated data overhead</div>
    </div>
  </div>

  <div class="controls-row">
    <input type="text" id="archive-search" class="search-input" placeholder="Search archive by site domain or tracker company name..." oninput="applyArchiveFilter()" />
  </div>

  <table>
    <thead>
      <tr>
        <th>Site Domain</th>
        <th>Company</th>
        <th>Category</th>
        <th>Risk</th>
        <th>Shield Status</th>
        <th>Payload Size</th>
        <th>Tracker Domain</th>
      </tr>
    </thead>
    <tbody id="archive-tbody">
      ${archiveRows}
      <tr id="archive-empty-row" style="display: none;">
        <td colspan="7" class="empty-state">No archived events match the search query.</td>
      </tr>
    </tbody>
  </table>

  <script>
    function applyArchiveFilter() {
      const searchVal = document.getElementById('archive-search').value.toLowerCase();
      const tbody = document.getElementById('archive-tbody');
      const rows = tbody.querySelectorAll('.archive-row');
      let visibleCount = 0;
      
      rows.forEach(row => {
        const site = row.getAttribute('data-site');
        const company = row.getAttribute('data-company');
        
        if (site.includes(searchVal) || company.includes(searchVal)) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });
      
      const emptyRow = document.getElementById('archive-empty-row');
      if (visibleCount === 0) {
        emptyRow.style.display = '';
      } else {
        emptyRow.style.display = 'none';
      }
    }
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `exposed-archive-${archive.date}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}
