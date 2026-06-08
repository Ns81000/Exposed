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
  const [activeHover, setActiveHover] = useState(null);
  const [showLeaked, setShowLeaked] = useState(true);
  const [showBlocked, setShowBlocked] = useState(true);

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
    const connectionMap = {};

    events.forEach(e => {
      siteDomainCounts[e.siteDomain] = (siteDomainCounts[e.siteDomain] || 0) + 1;
      companyCounts[e.company] = (companyCounts[e.company] || 0) + 1;
      
      // Group by site domain and company to deduplicate overlapping lines
      const key = `${e.siteDomain}::${e.company}`;
      if (!connectionMap[key]) {
        connectionMap[key] = {
          site: e.siteDomain,
          company: e.company,
          risk: e.risk,
          count: 0
        };
      }
      connectionMap[key].count += 1;
    });

    const topSites = Object.keys(siteDomainCounts)
      .sort((a, b) => siteDomainCounts[b] - siteDomainCounts[a])
      .slice(0, 7);

    const topCompanies = Object.keys(companyCounts)
      .sort((a, b) => companyCounts[b] - companyCounts[a])
      .slice(0, 8);

    // Keep only unique connections relating to top sites and top companies
    const uniqueConnections = Object.values(connectionMap).filter(
      c => topSites.includes(c.site) && topCompanies.includes(c.company)
    );

    // Coordinate mapping
    const leftX = 140;
    const rightX = width - 140;
    
    const leftScale = d3.scalePoint().domain(topSites).range([40, height - 40]);
    const rightScale = d3.scalePoint().domain(topCompanies).range([30, height - 30]);

    // Helper check functions
    const isLinkActive = (c) => {
      if (!activeHover) return false;
      if (activeHover.type === 'company') return c.company === activeHover.val;
      if (activeHover.type === 'site') return c.site === activeHover.val;
      if (activeHover.type === 'link') return c.site === activeHover.site && c.company === activeHover.company;
      return false;
    };

    const isSiteActive = (site) => {
      if (!activeHover) return true;
      if (activeHover.type === 'site') return site === activeHover.val;
      if (activeHover.type === 'company') {
        return uniqueConnections.some(c => c.site === site && c.company === activeHover.val);
      }
      if (activeHover.type === 'link') return activeHover.site === site;
      return false;
    };

    const isCompanyActive = (company) => {
      if (!activeHover) return true;
      if (activeHover.type === 'company') return company === activeHover.val;
      if (activeHover.type === 'site') {
        return uniqueConnections.some(c => c.site === activeHover.val && c.company === company);
      }
      if (activeHover.type === 'link') return activeHover.company === company;
      return false;
    };

    const bipartiteG = svg.append('g');

    // Draw connecting lines (smooth cubic curves)
    const linkGenerator = d3.linkHorizontal()
      .x(d => d[0])
      .y(d => d[1]);

    // Background links
    const links = bipartiteG.append('g')
      .selectAll('path')
      .data(uniqueConnections)
      .join('path')
      .attr('d', d => {
        const yStart = leftScale(d.site);
        const yEnd = rightScale(d.company);
        return linkGenerator({ source: [leftX, yStart], target: [rightX, yEnd] });
      })
      .attr('fill', 'none')
      .attr('stroke', d => `var(--color-risk-${d.risk})`)
      .attr('stroke-width', d => 1.2 + Math.log2(d.count) * 0.8) // Log thickness based on request volume
      .attr('stroke-opacity', d => {
        if (activeHover === null) return 0.15;
        return isLinkActive(d) ? 0.95 : 0.01;
      })
      .style('transition', 'stroke-opacity 220ms ease, stroke-width 220ms ease');

    // Flowing particles for active links
    const flowPaths = bipartiteG.append('g')
      .selectAll('path')
      .data(uniqueConnections)
      .join('path')
      .attr('d', d => {
        const yStart = leftScale(d.site);
        const yEnd = rightScale(d.company);
        return linkGenerator({ source: [leftX, yStart], target: [rightX, yEnd] });
      })
      .attr('fill', 'none')
      .attr('stroke', d => `var(--color-risk-${d.risk})`)
      .attr('stroke-width', d => (1.2 + Math.log2(d.count) * 0.8) * 1.5)
      .attr('stroke-opacity', d => activeHover !== null && isLinkActive(d) ? 0.85 : 0)
      .attr('class', 'link-flow-active')
      .style('pointer-events', 'none')
      .style('transition', 'stroke-opacity 220ms ease');

    // Invisible thick links for easier hover interaction
    const interactiveLinks = bipartiteG.append('g')
      .selectAll('path')
      .data(uniqueConnections)
      .join('path')
      .attr('d', d => {
        const yStart = leftScale(d.site);
        const yEnd = rightScale(d.company);
        return linkGenerator({ source: [leftX, yStart], target: [rightX, yEnd] });
      })
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 10)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => setActiveHover({ type: 'link', site: d.site, company: d.company }))
      .on('mouseleave', () => setActiveHover(null));

    // Left Node Group (Sites)
    const leftNodes = bipartiteG.append('g')
      .selectAll('g')
      .data(topSites)
      .join('g')
      .attr('transform', d => `translate(${leftX}, ${leftScale(d)})`)
      .style('cursor', 'pointer')
      .style('opacity', d => isSiteActive(d) ? 1 : 0.08)
      .style('transition', 'opacity 220ms ease')
      .on('mouseenter', (event, d) => setActiveHover({ type: 'site', val: d }))
      .on('mouseleave', () => setActiveHover(null));

    // Outer Ring
    leftNodes.append('circle')
      .attr('r', d => (activeHover && isSiteActive(d)) ? 8 : 6)
      .attr('fill', 'none')
      .attr('stroke', d => (activeHover?.type === 'site' && activeHover.val === d) ? 'var(--color-accent)' : 'var(--color-border)')
      .attr('stroke-width', 1.5)
      .style('transition', 'all 220ms ease');

    // Inner Dot
    leftNodes.append('circle')
      .attr('r', 2.5)
      .attr('fill', d => (activeHover?.type === 'site' && activeHover.val === d) ? 'var(--color-accent-hover)' : 'var(--color-accent)')
      .style('transition', 'all 220ms ease');

    leftNodes.append('text')
      .attr('x', -14)
      .attr('dy', '0.31em')
      .attr('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .attr('font-weight', d => (activeHover?.type === 'site' && activeHover.val === d) ? '600' : '500')
      .attr('fill', d => (activeHover?.type === 'site' && activeHover.val === d) ? 'var(--color-text)' : 'var(--color-secondary)')
      .style('transition', 'all 220ms ease')
      .text(d => d.length > 20 ? d.substring(0, 18) + '...' : d);

    // Right Node Group (Companies)
    const rightNodes = bipartiteG.append('g')
      .selectAll('g')
      .data(topCompanies)
      .join('g')
      .attr('transform', d => `translate(${rightX}, ${rightScale(d)})`)
      .style('cursor', 'pointer')
      .style('opacity', d => isCompanyActive(d) ? 1 : 0.08)
      .style('transition', 'opacity 220ms ease')
      .on('mouseenter', (event, d) => setActiveHover({ type: 'company', val: d }))
      .on('mouseleave', () => setActiveHover(null));

    // Outer Ring for Companies
    rightNodes.append('circle')
      .attr('r', d => (activeHover && isCompanyActive(d)) ? 8 : 6)
      .attr('fill', 'none')
      .attr('stroke', d => (activeHover?.type === 'company' && activeHover.val === d) ? 'var(--color-accent)' : 'var(--color-border)')
      .attr('stroke-width', 1.5)
      .style('transition', 'all 220ms ease');

    // Inner Dot for Companies
    rightNodes.append('circle')
      .attr('r', 2.5)
      .attr('fill', d => (activeHover?.type === 'company' && activeHover.val === d) ? 'var(--color-accent)' : 'var(--color-secondary)')
      .style('transition', 'all 220ms ease');

    rightNodes.append('text')
      .attr('x', 14)
      .attr('dy', '0.31em')
      .attr('text-anchor', 'start')
      .attr('font-size', '11.5px')
      .attr('font-family', 'Outfit, sans-serif')
      .attr('font-weight', d => (activeHover?.type === 'company' && activeHover.val === d) ? '600' : '500')
      .attr('fill', d => (activeHover?.type === 'company' && activeHover.val === d) ? 'var(--color-accent)' : 'var(--color-text)')
      .style('transition', 'all 220ms ease')
      .text(d => d);

  }, [events, activeHover]);

  // ── D3 Bandwidth Savings Timeline Area Chart ───────────────
  useEffect(() => {
    if (!bandwidthRef.current || visits.length === 0) return;

    const svg = d3.select(bandwidthRef.current);
    svg.selectAll('*').remove();

    const width = bandwidthRef.current.clientWidth || 800;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 30, left: 55 };

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

    let xDomain = d3.extent(chartData, d => d.date);
    if (xDomain[0] && xDomain[0].getTime() === xDomain[1].getTime()) {
      xDomain = [new Date(xDomain[0].getTime() - 3600 * 1000), new Date(xDomain[1].getTime() + 3600 * 1000)];
    }

    const xScale = d3.scaleTime()
      .domain(xDomain)
      .range([margin.left, width - margin.right]);

    const maxVal = Math.max(
      showLeaked ? (d3.max(chartData, d => d.exfiltrated) || 10) : 0,
      showBlocked ? (d3.max(chartData, d => d.saved) || 10) : 0
    );
    const yMax = maxVal === 0 ? 10 : maxVal;

    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.15])
      .range([height - margin.bottom, margin.top]);

    // Setup linear gradients for premium glows
    const defs = svg.append('defs');

    const gradExfiltrated = defs.append('linearGradient')
      .attr('id', 'grad-exfiltrated')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradExfiltrated.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'var(--color-accent)')
      .attr('stop-opacity', 0.16);
    gradExfiltrated.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'var(--color-accent)')
      .attr('stop-opacity', 0.0);

    const gradSaved = defs.append('linearGradient')
      .attr('id', 'grad-saved')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradSaved.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'var(--color-success)')
      .attr('stop-opacity', 0.16);
    gradSaved.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'var(--color-success)')
      .attr('stop-opacity', 0.0);

    // Gridlines (subtle horizontal dashed lines)
    const yTicks = yScale.ticks(4);
    svg.append('g')
      .attr('class', 'gridlines')
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'var(--color-border)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,4');

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%I:%M %p'));
    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d => `${Math.round(d)} KB`);

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .attr('color', 'var(--color-border)')
      .call(xAxis)
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .selectAll('text')
      .attr('fill', 'var(--color-secondary)');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .attr('color', 'var(--color-border)')
      .call(yAxis)
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .selectAll('text')
      .attr('fill', 'var(--color-secondary)');

    // Area generators
    const areaExfiltrated = d3.area()
      .x(d => xScale(d.date))
      .y0(yScale(0))
      .y1(d => yScale(d.exfiltrated))
      .curve(d3.curveMonotoneX);

    const areaSaved = d3.area()
      .x(d => xScale(d.date))
      .y0(yScale(0))
      .y1(d => yScale(d.saved))
      .curve(d3.curveMonotoneX);

    // Render shaded areas conditionally
    if (showLeaked) {
      svg.append('path')
        .datum(chartData)
        .attr('fill', 'url(#grad-exfiltrated)')
        .attr('d', areaExfiltrated);
    }

    if (showBlocked) {
      svg.append('path')
        .datum(chartData)
        .attr('fill', 'url(#grad-saved)')
        .attr('d', areaSaved);
    }

    // Render crisp border strokes conditionally
    if (showLeaked) {
      svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-accent)')
        .attr('stroke-width', 2)
        .attr('d', d3.line().x(d => xScale(d.date)).y(d => yScale(d.exfiltrated)).curve(d3.curveMonotoneX));
    }

    if (showBlocked) {
      svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-success)')
        .attr('stroke-width', 2)
        .attr('d', d3.line().x(d => xScale(d.date)).y(d => yScale(d.saved)).curve(d3.curveMonotoneX));
    }

    // Interactive hover scanner line
    const hoverLine = svg.append('line')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'var(--color-muted)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Glowing coordinate dots
    const focusDotExfiltrated = svg.append('circle')
      .attr('r', 4)
      .attr('fill', 'var(--color-accent)')
      .attr('stroke', 'var(--color-surface-1)')
      .attr('stroke-width', 1.5)
      .style('opacity', 0)
      .style('pointer-events', 'none');

    const focusDotSaved = svg.append('circle')
      .attr('r', 4)
      .attr('fill', 'var(--color-success)')
      .attr('stroke', 'var(--color-surface-1)')
      .attr('stroke-width', 1.5)
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Tooltip overlay element
    const tooltip = d3.select(bandwidthRef.current.parentNode)
      .selectAll('.timeline-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'timeline-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'var(--color-surface-2)')
      .style('backdrop-filter', 'blur(8px)')
      .style('border', '1px solid var(--color-border)')
      .style('padding', '6px 10px')
      .style('border-radius', '6px')
      .style('font-size', '10.5px')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('box-shadow', '0 4px 16px rgba(0,0,0,0.4)')
      .style('opacity', 0)
      .style('z-index', 10);

    const bisectDate = d3.bisector(d => d.date).left;

    // Invisible cursor tracking rectangle
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', () => {
        if (showLeaked || showBlocked) {
          hoverLine.style('opacity', 0.6);
          if (showLeaked) focusDotExfiltrated.style('opacity', 1);
          if (showBlocked) focusDotSaved.style('opacity', 1);
          tooltip.style('opacity', 1);
        }
      })
      .on('mouseout', () => {
        hoverLine.style('opacity', 0);
        focusDotExfiltrated.style('opacity', 0);
        focusDotSaved.style('opacity', 0);
        tooltip.style('opacity', 0);
      })
      .on('mousemove', (event) => {
        if (!showLeaked && !showBlocked) {
          hoverLine.style('opacity', 0);
          focusDotExfiltrated.style('opacity', 0);
          focusDotSaved.style('opacity', 0);
          tooltip.style('opacity', 0);
          return;
        }

        const xPos = d3.pointer(event)[0];
        const datePos = xScale.invert(xPos);
        
        let d;
        if (chartData.length === 1) {
          d = chartData[0];
        } else {
          const index = bisectDate(chartData, datePos, 1);
          const d0 = chartData[index - 1];
          const d1 = chartData[index];
          if (!d0 && !d1) return;
          if (!d0) d = d1;
          else if (!d1) d = d0;
          else d = datePos - d0.date > d1.date - datePos ? d1 : d0;
        }
        
        const xCoord = xScale(d.date);
        
        hoverLine.attr('x1', xCoord).attr('x2', xCoord);
        if (showLeaked) focusDotExfiltrated.attr('cx', xCoord).attr('cy', yScale(d.exfiltrated));
        if (showBlocked) focusDotSaved.attr('cx', xCoord).attr('cy', yScale(d.saved));

        // Position tooltip intelligently inside bounds
        const tooltipW = 160;
        const tx = Math.min(xCoord + 15, width - tooltipW - 10);
        
        let activeY = height / 2;
        if (showLeaked && showBlocked) {
          activeY = yScale(Math.max(d.exfiltrated, d.saved));
        } else if (showLeaked) {
          activeY = yScale(d.exfiltrated);
        } else if (showBlocked) {
          activeY = yScale(d.saved);
        }
        const ty = activeY - 30;

        let htmlContent = `
          <div style="font-weight: 600; color: var(--color-text); margin-bottom: 2px;">
            ${d3.timeFormat('%I:%M %p')(d.date)}
          </div>
        `;
        if (showLeaked) {
          htmlContent += `<div style="color: var(--color-accent)">Leaked: ${d.exfiltrated.toFixed(1)} KB</div>`;
        }
        if (showBlocked) {
          htmlContent += `<div style="color: var(--color-success)">Blocked: ${d.saved.toFixed(1)} KB</div>`;
        }

        tooltip
          .style('left', `${tx}px`)
          .style('top', `${ty}px`)
          .html(htmlContent);
      });

  }, [visits, events, showLeaked, showBlocked]);

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
            {activeHover ? (
              activeHover.type === 'company' ? `CORRELATING COMPANY: ${activeHover.val.toUpperCase()}` :
              activeHover.type === 'site' ? `CORRELATING SITE: ${activeHover.val.toUpperCase()}` :
              `LINK DETECTED: ${activeHover.site} ── ${activeHover.company}`
            ) : 'HOVER ELEMENTS TO INSPECT LINKS'}
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
              <button 
                onClick={() => setShowLeaked(!showLeaked)}
                className={`flex items-center gap-1.5 transition-all duration-200 hover:opacity-100 focus:outline-none ${showLeaked ? 'text-accent' : 'text-muted opacity-40'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Leaked
              </button>
              <button 
                onClick={() => setShowBlocked(!showBlocked)}
                className={`flex items-center gap-1.5 transition-all duration-200 hover:opacity-100 focus:outline-none ${showBlocked ? 'text-success' : 'text-muted opacity-40'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success" /> Blocked
              </button>
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
