import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Shield, Eye, Database, AlertTriangle, ArrowLeftRight, Activity, Cpu } from 'lucide-react';
import { riskAccent } from '../utils/riskColor';

// ── Helper: Parse exfiltrated parameters to classify threat vectors ──────
function parseThreatVectors(events) {
  const stats = { pii: 0, fingerprint: 0, behavior: 0, marketing: 0, other: 0 };
  const examples = { pii: [], fingerprint: [], behavior: [], marketing: [] };

  events.forEach(event => {
    if (!event.payload) return;
    
    let keys = [];
    try {
      const parsed = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
      keys = Object.keys(parsed);
    } catch (e) {
      // String parsing fallback
      keys = event.payload.split('&').map(p => p.split('=')[0]);
    }

    keys.forEach(key => {
      const lowercaseKey = key.toLowerCase();
      if (/email|mail|name|phone|usr|user|address|zip|postal|gender|dob|birth|profile/i.test(lowercaseKey)) {
        stats.pii += 1;
        if (examples.pii.length < 5 && !examples.pii.includes(key)) examples.pii.push(key);
      } else if (/canvas|webgl|gpu|audio|oscillator|screen|res|width|height|avail|font|platform|navigator|agent|webrtc|rtc/i.test(lowercaseKey)) {
        stats.fingerprint += 1;
        if (examples.fingerprint.length < 5 && !examples.fingerprint.includes(key)) examples.fingerprint.push(key);
      } else if (/scroll|click|mouse|hover|track|drag|key|keypress|keydown|keyup/i.test(lowercaseKey)) {
        stats.behavior += 1;
        if (examples.behavior.length < 5 && !examples.behavior.includes(key)) examples.behavior.push(key);
      } else if (/utm_|gclid|fbclid|clink|affiliate|camp|source|medium|term|clickid/i.test(lowercaseKey)) {
        stats.marketing += 1;
        if (examples.marketing.length < 5 && !examples.marketing.includes(key)) examples.marketing.push(key);
      } else {
        stats.other += 1;
      }
    });
  });

  return { stats, examples };
}

export default function ThreatAnalytics({ sites, visits, events, fingerprints }) {
  const bipartiteRef = useRef(null);
  const bandwidthRef = useRef(null);
  const [hoveredCompany, setHoveredCompany] = useState(null);

  // ── Global Stats ──────────────────────────────────────────
  const totalSites = sites.length;
  const totalAlerts = fingerprints.length;
  
  const bandwidthStats = useMemo(() => {
    let exfiltrated = 0;
    let blocked = 0;
    events.forEach(e => {
      const size = e.size || 0;
      if (e.blocked) {
        blocked += 12 * 1024; // 12KB average saved per blocked asset
      } else {
        exfiltrated += size > 0 ? size : (8 * 1024); // 8KB average baseline
      }
    });
    return { exfiltrated, blocked };
  }, [events]);

  const { stats: threatStats, examples: threatExamples } = useMemo(() => parseThreatVectors(events), [events]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  // ── D3 Bipartite Matrix (Cross-Site Contamination) ──────────
  useEffect(() => {
    if (!bipartiteRef.current || events.length === 0) return;

    const svg = d3.select(bipartiteRef.current);
    svg.selectAll('*').remove();

    const width = bipartiteRef.current.clientWidth || 800;
    const height = 380;
    
    // Extract connections: Top 7 sites and Top 8 tracker companies
    const siteDomainCounts = {};
    const companyCounts = {};
    const connections = [];

    events.forEach(e => {
      siteDomainCounts[e.siteDomain] = (siteDomainCounts[e.siteDomain] || 0) + 1;
      companyCounts[e.company] = (companyCounts[e.company] || 0) + 1;
      connections.push({ site: e.siteDomain, company: e.company, risk: e.risk });
    });

    const topSites = Object.keys(siteDomainCounts)
      .sort((a, b) => siteDomainCounts[b] - siteDomainCounts[a])
      .slice(0, 7);

    const topCompanies = Object.keys(companyCounts)
      .sort((a, b) => companyCounts[b] - companyCounts[a])
      .slice(0, 8);

    // Keep only connections relating to top sites and top companies
    const filteredConnections = connections.filter(
      c => topSites.includes(c.site) && topCompanies.includes(c.company)
    );

    // Coordinate mapping
    const leftX = 140;
    const rightX = width - 140;
    
    const leftScale = d3.scalePoint().domain(topSites).range([40, height - 40]);
    const rightScale = d3.scalePoint().domain(topCompanies).range([30, height - 30]);

    const bipartiteG = svg.append('g');

    // Draw connecting lines (smooth cubic curves)
    const linkGenerator = d3.linkHorizontal()
      .x(d => d[0])
      .y(d => d[1]);

    const links = bipartiteG.append('g')
      .selectAll('path')
      .data(filteredConnections)
      .join('path')
      .attr('d', d => {
        const yStart = leftScale(d.site);
        const yEnd = rightScale(d.company);
        return linkGenerator({ source: [leftX, yStart], target: [rightX, yEnd] });
      })
      .attr('fill', 'none')
      .attr('stroke', d => riskAccent(d.risk))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', d => hoveredCompany === null ? 0.25 : (d.company === hoveredCompany ? 0.85 : 0.04))
      .style('transition', 'stroke-opacity 180ms ease, stroke-width 180ms ease');

    // Left Node Group (Sites)
    const leftNodes = bipartiteG.append('g')
      .selectAll('g')
      .data(topSites)
      .join('g')
      .attr('transform', d => `translate(${leftX}, ${leftScale(d)})`);

    leftNodes.append('circle')
      .attr('r', 5)
      .attr('fill', 'var(--color-accent)');

    leftNodes.append('text')
      .attr('x', -12)
      .attr('dy', '0.31em')
      .attr('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .attr('fill', 'var(--color-text)')
      .text(d => d.length > 20 ? d.substring(0, 18) + '...' : d);

    // Right Node Group (Companies)
    const rightNodes = bipartiteG.append('g')
      .selectAll('g')
      .data(topCompanies)
      .join('g')
      .attr('transform', d => `translate(${rightX}, ${rightScale(d)})`)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => setHoveredCompany(d))
      .on('mouseleave', () => setHoveredCompany(null));

    rightNodes.append('circle')
      .attr('r', 6)
      .attr('fill', d => hoveredCompany === d ? 'var(--color-accent)' : 'var(--color-secondary)');

    rightNodes.append('text')
      .attr('x', 14)
      .attr('dy', '0.31em')
      .attr('text-anchor', 'start')
      .attr('font-size', '11.5px')
      .attr('font-family', 'Outfit, sans-serif')
      .attr('font-weight', d => hoveredCompany === d ? '600' : '500')
      .attr('fill', d => hoveredCompany === d ? 'var(--color-accent)' : 'var(--color-text)')
      .text(d => d);

  }, [events, hoveredCompany]);

  // ── D3 Bandwidth Savings Timeline Area Chart ───────────────
  useEffect(() => {
    if (!bandwidthRef.current || visits.length === 0) return;

    const svg = d3.select(bandwidthRef.current);
    svg.selectAll('*').remove();

    const width = bandwidthRef.current.clientWidth || 800;
    const height = 220;
    const margin = { top: 15, right: 20, bottom: 30, left: 50 };

    // Sort visits chronologically
    const sortedVisits = [...visits].sort((a, b) => a.timestamp - b.timestamp);

    // Map aggregate exfiltration sizes
    let runningExfiltrated = 0;
    let runningSaved = 0;
    const chartData = sortedVisits.map(v => {
      const siteEvents = events.filter(e => e.visitId === v.visitId);
      siteEvents.forEach(e => {
        if (e.blocked) runningSaved += 12 * 1024;
        else runningExfiltrated += e.size > 0 ? e.size : (8 * 1024);
      });
      return {
        date: new Date(v.timestamp),
        exfiltrated: runningExfiltrated / 1024, // KB
        saved: runningSaved / 1024 // KB
      };
    });

    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.date))
      .range([margin.left, width - margin.right]);

    const yMax = Math.max(
      d3.max(chartData, d => d.exfiltrated) || 10,
      d3.max(chartData, d => d.saved) || 10
    );

    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([height - margin.bottom, margin.top]);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%I:%M %p'));
    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d => `${d} KB`);

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .attr('color', 'var(--color-muted)')
      .call(xAxis)
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .attr('color', 'var(--color-muted)')
      .call(yAxis)
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace');

    // Area generator for exfiltrated payload
    const areaExfiltrated = d3.area()
      .x(d => xScale(d.date))
      .y0(yScale(0))
      .y1(d => yScale(d.exfiltrated))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(chartData)
      .attr('fill', 'var(--color-accent-soft)')
      .attr('stroke', 'var(--color-accent)')
      .attr('stroke-width', 1.5)
      .attr('d', areaExfiltrated)
      .attr('opacity', 0.85);

    // Area generator for blocked/saved payload
    const areaSaved = d3.area()
      .x(d => xScale(d.date))
      .y0(yScale(0))
      .y1(d => yScale(d.saved))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(chartData)
      .attr('fill', 'rgba(40, 205, 65, 0.06)')
      .attr('stroke', 'var(--color-success)')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1.5)
      .attr('d', areaSaved)
      .attr('opacity', 0.85);

  }, [visits, events]);

  // Total parsed leak metrics
  const totalLeaks = threatStats.pii + threatStats.fingerprint + threatStats.behavior + threatStats.marketing;
  
  return (
    <main className="flex-1 p-5 md:p-6 space-y-6 overflow-y-auto scrollbar animate-fade-in">
      {/* Header */}
      <header className="acrylic-panel px-6 py-5 flex items-center justify-between">
        <div>
          <p className="section-label tracking-wider">Dossier Audits</p>
          <h1 className="text-[22px] font-display font-bold text-text mt-1 tracking-tight">Threat Intelligence</h1>
        </div>
        <div className="flex items-center gap-2 border border-accent/20 bg-accent-soft px-3 py-1.5 rounded-lg text-accent text-[11px] font-mono">
          <Activity size={13} className="animate-pulse" />
          AGGREGATING {totalSites} DOMAINS
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="stat-card flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="section-label text-muted">Exfiltration Saved</div>
            <div className="text-[26px] font-display font-bold text-success mt-1.5 tabular-nums">
              {formatBytes(bandwidthStats.blocked)}
            </div>
          </div>
          <div className="text-[10px] text-muted tracking-wide mt-1 uppercase font-mono">Telemetry Blocked</div>
        </div>

        <div className="stat-card flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="section-label text-muted">Exfiltrated Overhead</div>
            <div className="text-[26px] font-display font-bold text-text mt-1.5 tabular-nums">
              {formatBytes(bandwidthStats.exfiltrated)}
            </div>
          </div>
          <div className="text-[10px] text-muted tracking-wide mt-1 uppercase font-mono">Leaked to Third Parties</div>
        </div>

        <div className="stat-card flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="section-label text-muted">Heuristics Alerts</div>
            <div className="text-[26px] font-display font-bold text-riskHigh mt-1.5 tabular-nums">
              {totalAlerts}
            </div>
          </div>
          <div className="text-[10px] text-muted tracking-wide mt-1 uppercase font-mono">Fingerprinting Intercepts</div>
        </div>

        <div className="stat-card flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="section-label text-muted">Parsed Threat Vectors</div>
            <div className="text-[26px] font-display font-bold text-accent mt-1.5 tabular-nums">
              {totalLeaks}
            </div>
          </div>
          <div className="text-[10px] text-muted tracking-wide mt-1 uppercase font-mono">Telemetry Parameter Scans</div>
        </div>
      </div>

      {/* Cross-Site Contamination Matrix */}
      <section className="acrylic-panel p-5">
        <div className="px-1 pb-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="section-label text-text">Cross-Site Contamination Map</p>
            <p className="text-[11px] text-muted mt-0.5">Exposing surveillance networks linking your identity across domains.</p>
          </div>
          <span className="text-[10px] text-accent border border-accent/20 bg-accent-soft px-2 py-0.5 rounded font-mono font-medium">
            {hoveredCompany ? `CORRELATING: ${hoveredCompany.toUpperCase()}` : 'HOVER COMPANY TO INSPECT LINKS'}
          </span>
        </div>
        
        <div className="relative pt-4 overflow-x-auto">
          {events.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted font-mono text-[12px]">
              No cross-site data logs recorded yet.
            </div>
          ) : (
            <svg ref={bipartiteRef} className="w-full h-[380px]" />
          )}
        </div>
      </section>

      {/* Exfiltrated Data Classification & Timeline row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6 items-start">
        {/* Classification Breakdown */}
        <section className="acrylic-panel p-5 space-y-4">
          <div className="pb-3 border-b border-border">
            <p className="section-label text-text">Parsed Exfiltration Audit</p>
            <p className="text-[11px] text-muted mt-0.5">Automated deep packet inspection of exfiltrated keys.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                label: 'User Identity (PII) Data',
                count: threatStats.pii,
                desc: 'Sensitive descriptors linking requests to accounts or emails.',
                keys: threatExamples.pii,
                color: 'var(--color-risk-high)',
                icon: Database
              },
              {
                label: 'Hardware & WebGL Fingerprints',
                count: threatStats.fingerprint,
                desc: 'Client-side parameter queries used to build canvas/browser hashes.',
                keys: threatExamples.fingerprint,
                color: 'var(--color-accent)',
                icon: Cpu
              },
              {
                label: 'Behavioral Diagnostics',
                count: threatStats.behavior,
                desc: 'Telemetry logging keystrokes, scroll depth, or focus clicks.',
                keys: threatExamples.behavior,
                color: 'var(--color-risk-medium)',
                icon: AlertTriangle
              },
              {
                label: 'Campaign Ad Trackers',
                count: threatStats.marketing,
                desc: 'Unique clicks or affiliate tracking parameters embedded in urls.',
                keys: threatExamples.marketing,
                color: 'var(--color-risk-low)',
                icon: Shield
              }
            ].map(row => {
              const pct = totalLeaks > 0 ? Math.round((row.count / totalLeaks) * 100) : 0;
              return (
                <div key={row.label} className="border border-border bg-surface-2/30 p-4 rounded-lg flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-surface-3 flex items-center justify-center">
                        <row.icon size={14} style={{ color: row.color }} />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-display font-semibold text-text">{row.label}</h4>
                        <p className="text-[11px] text-muted leading-tight mt-0.5">{row.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[13px] font-bold text-text tabular-nums">{row.count}</span>
                      <span className="text-muted text-[10px] block font-mono">{pct}%</span>
                    </div>
                  </div>

                  {/* Horizontal Bar indicator */}
                  <div className="h-1 w-full bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: row.color }} />
                  </div>

                  {/* Examples/Keys found */}
                  {row.keys.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[9px] font-mono text-muted uppercase tracking-wider mr-1">Captured Keys:</span>
                      {row.keys.map(k => (
                        <code key={k} className="font-mono text-[10px] bg-surface-3 px-1.5 py-0.5 rounded text-secondary border border-border select-all">{k}</code>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bandwidth Savings Timeline */}
        <section className="acrylic-panel p-5 flex flex-col justify-between min-h-[380px]">
          <div className="pb-3 border-b border-border flex items-center justify-between">
            <div>
              <p className="section-label text-text">Exfiltration Savings Timeline</p>
              <p className="text-[11px] text-muted mt-0.5">Historical bandwidth blocked vs exfiltrated (cumulative).</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Leaked
              </div>
              <div className="flex items-center gap-1.5 text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" /> Blocked
              </div>
            </div>
          </div>

          <div className="relative pt-4 flex-1">
            {visits.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted font-mono text-[12px]">
                No visit logs available.
              </div>
            ) : (
              <svg ref={bandwidthRef} className="w-full h-[220px]" />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
