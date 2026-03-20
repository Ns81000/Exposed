function riskColor(risk) {
  if (risk === 'high') return '#DC2626';
  if (risk === 'medium') return '#D97706';
  if (risk === 'low') return '#2563EB';
  return '#52525B';
}

export function exportSiteReport(site, visits, events) {
  const rows = events
    .map(
      (event) => `<tr>
        <td>${event.company}</td>
        <td>${event.category}</td>
        <td><span style="color:${riskColor(event.risk)}">${event.risk.toUpperCase()}</span></td>
        <td>${event.trackerDomain}</td>
        <td>${new Date(event.timestamp).toLocaleTimeString()}</td>
      </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Exposed Report ${site.domain}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; background: #09090B; color: #FAFAFA; font-family: Inter, system-ui, sans-serif; }
    h1 { margin: 0 0 8px; font-size: 24px; font-weight: 400; }
    p, td, th { font-size: 13px; font-weight: 400; color: #A1A1AA; }
    .meta { margin-bottom: 20px; color: #52525B; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #242424; background: #111111; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #242424; }
    .summary { margin: 0 0 20px; display: flex; gap: 24px; }
    .summary-item { border: 1px solid #242424; background: #111111; padding: 12px 16px; }
    .summary-item strong { color: #FAFAFA; font-size: 24px; font-weight: 400; }
  </style>
</head>
<body>
  <h1>Exposed Site Report</h1>
  <p class="meta">${site.domain} | ${new Date().toLocaleString()}</p>
  <div class="summary">
    <div class="summary-item"><strong>${events.length}</strong><br />Trackers</div>
    <div class="summary-item"><strong>${visits.length}</strong><br />Visits</div>
  </div>
  <table>
    <thead>
      <tr><th>Company</th><th>Category</th><th>Risk</th><th>Domain</th><th>Time</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
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
  const rows = (archive.data?.trackerEvents || [])
    .map(
      (event) => `<tr>
        <td>${event.siteDomain}</td>
        <td>${event.company}</td>
        <td>${event.category}</td>
        <td><span style="color:${riskColor(event.risk)}">${event.risk.toUpperCase()}</span></td>
        <td>${event.trackerDomain}</td>
      </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Exposed Archive ${archive.date}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; background: #09090B; color: #FAFAFA; font-family: Inter, system-ui, sans-serif; }
    h1 { margin: 0 0 8px; font-size: 24px; font-weight: 400; }
    p, td, th { font-size: 13px; font-weight: 400; color: #A1A1AA; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #242424; background: #111111; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #242424; }
  </style>
</head>
<body>
  <h1>Exposed Daily Archive</h1>
  <p>${archive.date} | Total trackers: ${archive.data?.summary?.totalTrackers || 0}</p>
  <table>
    <thead>
      <tr><th>Site</th><th>Company</th><th>Category</th><th>Risk</th><th>Domain</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
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
