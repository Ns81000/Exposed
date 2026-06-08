import { useEffect, useRef, useState, useCallback, memo } from 'react';
import * as d3 from 'd3';
import { Maximize2, Minimize2, Plus, Minus, RotateCcw } from 'lucide-react';
import { riskAccent } from '../utils/riskColor';

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    bg: style.getPropertyValue('--color-bg').trim(),
    surface1: style.getPropertyValue('--color-surface-1').trim(),
    surface2: style.getPropertyValue('--color-surface-2').trim(),
    border: style.getPropertyValue('--color-border').trim(),
    text: style.getPropertyValue('--color-text').trim(),
    muted: style.getPropertyValue('--color-muted').trim(),
    accent: style.getPropertyValue('--color-accent').trim(),
    secondary: style.getPropertyValue('--color-secondary').trim()
  };
}

const RISK_RING = { high: 1, medium: 2, low: 3 };

function buildGraph(events) {
  const counts = {};

  events.forEach((event) => {
    if (!counts[event.company]) {
      counts[event.company] = {
        count: 0,
        risk: event.risk,
        category: event.category
      };
    }
    counts[event.company].count += 1;
  });

  const siteDomain = events[0]?.siteDomain || 'site';
  const nodes = [
    { id: 'site', label: siteDomain, type: 'site', radius: 22 },
    ...Object.entries(counts).map(([company, value]) => ({
      id: company,
      label: company,
      type: 'tracker',
      risk: value.risk,
      category: value.category,
      count: value.count,
      ring: RISK_RING[value.risk] || 3,
      radius: Math.max(7, Math.min(22, 7 + value.count * 1.5))
    }))
  ];

  const links = nodes
    .filter((node) => node.type === 'tracker')
    .map((node) => ({ source: 'site', target: node.id }));

  return { nodes, links };
}

const NodeGraph = memo(function NodeGraph({ events, onNodeClick }) {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const prevStructureRef = useRef('');
  const zoomBehaviorRef = useRef(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  // ResizeObserver to track container dimension updates dynamically
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || element.clientWidth,
          height: entry.contentRect.height || element.clientHeight
        });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  const drawGraph = useCallback(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    const tooltip = d3.select(tooltipRef.current);
    let simulation;
    let bounds = null;

    if (events.length === 0) {
      svg.selectAll('*').remove();
      prevStructureRef.current = '';
      return;
    }

    const colors = getThemeColors();
    const element = ref.current;
    const width = dimensions.width || element.clientWidth || 900;
    const height = dimensions.height || element.clientHeight || 360;

    const counts = {};
    events.forEach((event) => {
      if (!counts[event.company]) {
        counts[event.company] = {
          count: 0,
          risk: event.risk
        };
      }
      counts[event.company].count += 1;
    });

    const siteDomain = events[0]?.siteDomain || 'site';
    const sortedCompanies = Object.keys(counts).sort();
    const serializedStructure = JSON.stringify({
      siteDomain,
      bg: colors.bg,
      width,
      height,
      trackers: sortedCompanies.map(company => ({
        company,
        count: counts[company].count,
        risk: counts[company].risk
      }))
    });

    if (serializedStructure === prevStructureRef.current) {
      return;
    }
    prevStructureRef.current = serializedStructure;

    svg.selectAll('*').remove();

    const { nodes, links } = buildGraph(events);

    const graphLayer = svg.append('g');

    // Setup zoom behavior and reset to identity to guarantee centering on site switch
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.15, 4.5])
      .on('zoom', (event) => {
        graphLayer.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, d3.zoomIdentity);

    // Setup defs (dot grid pattern)
    const defs = svg.append('defs');
    
    const pattern = defs.append('pattern')
      .attr('id', 'dot-grid')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 20)
      .attr('height', 20);
    pattern.append('circle')
      .attr('cx', 10)
      .attr('cy', 10)
      .attr('r', 0.8)
      .attr('fill', colors.border);

    // Background Grid Rect
    svg.insert('rect', ':first-child')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', `url(#dot-grid)`);

    // Concentric ring guides (subtle orbit lines centered on Site Node)
    const cx = width / 2;
    const cy = height / 2;
    const minDim = Math.min(width, height);
    const ringRadii = [minDim * 0.18, minDim * 0.32, minDim * 0.44];

    const ringGroup = graphLayer.append('g').attr('class', 'ring-guides');
    ringRadii.forEach((r) => {
      ringGroup.append('circle')
        .attr('fill', 'none')
        .attr('stroke', colors.border)
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '3,6')
        .attr('stroke-opacity', 0.4);
    });

    // Links Layer
    const linkGroup = graphLayer.append('g').attr('class', 'links');
    
    // 1. Base links (subtle static lines)
    const baseLink = linkGroup
      .selectAll('path.link-base')
      .data(links)
      .join('path')
      .attr('class', 'link-base')
      .attr('fill', 'none')
      .attr('stroke', d => {
        const targetNode = nodes.find(n => n.id === d.target);
        return targetNode ? riskAccent(targetNode.risk) : colors.muted;
      })
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.12);

    // 2. Pulse links (active animated data packet overlays)
    const pulseLink = linkGroup
      .selectAll('path.link-pulse')
      .data(links)
      .join('path')
      .attr('class', 'link-pulse')
      .attr('fill', 'none')
      .attr('stroke', d => {
        const targetNode = nodes.find(n => n.id === d.target);
        return targetNode ? riskAccent(targetNode.risk) : colors.muted;
      })
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.5)
      .style('stroke-dasharray', '4, 16');

    // Node Groups Layer
    const node = graphLayer
      .append('g')
      .selectAll('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', (event, datum) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            datum.fx = datum.x;
            datum.fy = datum.y;
          })
          .on('drag', (event, datum) => {
            datum.fx = event.x;
            datum.fy = event.y;
          })
          .on('end', (event, datum) => {
            if (!event.active) simulation.alphaTarget(0);
            if (datum.id !== 'site') {
              datum.fx = null;
              datum.fy = null;
            }
          })
      );

    // --- Node Rendering Details ---

    // Site Node Layer Configuration
    const siteNodes = node.filter(d => d.type === 'site');
    
    // Outer pulse halo
    siteNodes.append('circle')
      .attr('class', 'site-pulse-ring')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', d => d.radius + 8)
      .attr('fill', 'none')
      .attr('stroke', colors.accent)
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.35);

    // Outer rotating dashed selector
    siteNodes.append('circle')
      .attr('class', 'site-compass-ring')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', d => d.radius + 4)
      .attr('fill', 'none')
      .attr('stroke', colors.accent)
      .attr('stroke-width', 0.8)
      .attr('stroke-dasharray', '5, 3');

    // Accent solid core
    siteNodes.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', d => d.radius)
      .attr('fill', colors.accent)
      .attr('stroke', '#ffffff')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 1.2);

    // Site inside text label (upper-cased domain initials)
    siteNodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '700')
      .attr('fill', '#FFFFFF')
      .style('pointer-events', 'none')
      .text(d => {
        const domain = d.label;
        const parts = domain.split('.');
        if (parts.length >= 2) {
          const name = parts[parts.length - 2];
          return name.length > 5 ? name.substring(0, 5).toUpperCase() : name.toUpperCase();
        }
        return domain.substring(0, 5).toUpperCase();
      });

    // Floating text label card above Site Node
    const siteLabelGroup = siteNodes.append('g')
      .attr('class', 'site-label-group')
      .style('opacity', 0.95);
    
    const siteTextW = siteDomain.length * 4.8 + 8;
    siteLabelGroup.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', colors.bg)
      .attr('fill-opacity', 0.9)
      .attr('stroke', colors.accent)
      .attr('stroke-width', 0.7)
      .attr('height', 14)
      .attr('width', siteTextW)
      .attr('x', -siteTextW / 2)
      .attr('y', -36);

    siteLabelGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', -26)
      .attr('font-size', '7.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600')
      .attr('fill', colors.text)
      .style('pointer-events', 'none')
      .text(siteDomain);

    // Tracker Node Layer Configuration
    const trackerNodes = node.filter(d => d.type === 'tracker');

    // Outer semi-transparent bounding zone
    trackerNodes.append('circle')
      .attr('class', 'tracker-glow')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', d => d.radius)
      .attr('fill', d => riskAccent(d.risk))
      .attr('fill-opacity', 0.12)
      .attr('stroke', d => riskAccent(d.risk))
      .attr('stroke-opacity', 0.35)
      .attr('stroke-width', 1);

    // Middle dashboard rings
    trackerNodes.append('circle')
      .attr('class', 'tracker-ring')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', d => d.radius - 2)
      .attr('fill', 'none')
      .attr('stroke', d => riskAccent(d.risk))
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 0.8)
      .attr('stroke-dasharray', d => d.risk === 'high' ? '2, 1.5' : null);

    // Threat Core dot
    trackerNodes.append('circle')
      .attr('class', 'tracker-core')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', d => Math.max(3.5, d.radius * 0.38))
      .attr('fill', d => riskAccent(d.risk));

    // Tracker Text Label Group
    const trackerLabelGroup = trackerNodes.append('g')
      .attr('class', 'node-label-group')
      .style('opacity', d => d.count > 4 ? 0.75 : 0)
      .style('transition', 'opacity 0.15s ease');
      
    trackerLabelGroup.append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', colors.bg)
      .attr('fill-opacity', 0.85)
      .attr('stroke', colors.border)
      .attr('stroke-width', 0.5)
      .attr('height', 13)
      .attr('y', d => d.radius + 5);

    trackerLabelGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => d.radius + 14)
      .attr('font-size', '7.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '500')
      .attr('fill', colors.secondary)
      .style('pointer-events', 'none')
      .text(d => d.label.length > 14 ? d.label.substring(0, 12) + '…' : d.label);

    trackerLabelGroup.each(function(d) {
      const textStr = d.label.length > 14 ? d.label.substring(0, 12) + '…' : d.label;
      const textW = textStr.length * 4.8 + 8;
      d3.select(this).select('rect')
        .attr('width', textW)
        .attr('x', -textW / 2);
    });

    // Tooltip & Interactive hover state handlers
    node
      .on('mouseenter', function (event, datum) {
        // Cache bounds once on enter to avoid layout thrashing in mousemove
        bounds = containerRef.current.getBoundingClientRect();

        // Build connection set for O(1) lookup
        const connectedIds = new Set();
        connectedIds.add(datum.id);
        links.forEach(l => {
          if (l.source.id === datum.id) connectedIds.add(l.target.id);
          else if (l.target.id === datum.id) connectedIds.add(l.source.id);
        });

        // Set classes on D3 selections; styles are driven natively by CSS transition engine
        svg.classed('has-hover', true);
        node.classed('is-focused', d => connectedIds.has(d.id));
        baseLink.classed('is-focused', d => d.source.id === datum.id || d.target.id === datum.id);
        pulseLink.classed('is-focused', d => d.source.id === datum.id || d.target.id === datum.id);

        d3.select(this).classed('is-hovered', true);

        // Position and reveal tooltip using translate3d (relative to container)
        const x = Math.min(event.clientX - bounds.left + 14, bounds.width - 240);
        const y = event.clientY - bounds.top + 14;

        tooltip
          .style('transform', `translate3d(${x}px, ${y}px, 0)`)
          .style('opacity', 1);

        const riskColor = riskAccent(datum.risk);
        tooltip.style('border-left', `3px solid ${riskColor}`);

        if (datum.type === 'site') {
          tooltip.html(`
            <div class="font-display font-semibold text-[13px]" style="color: ${colors.text}">
              ${datum.label}
            </div>
            <div class="text-[10px] font-mono mt-1" style="color: ${colors.muted}">ACTIVE ROOT SECTOR</div>
          `);
        } else {
          tooltip.html(`
            <div class="font-display font-semibold text-[13px] mb-2" style="color: ${colors.text}">
              ${datum.label}
            </div>
            <div class="flex flex-col gap-1 text-[11px] font-mono" style="color: ${colors.secondary}">
              <div>CLASS: <span style="color: ${colors.text}; font-weight: 500">${datum.category || 'TRACKER'}</span></div>
              <div>THREAT: <span style="color: ${riskColor}; font-weight: 600; text-transform: uppercase">${datum.risk}</span></div>
              <div class="mt-0.5 pt-0.5 border-t border-border/40">REQS: <span style="color: ${colors.text}; font-weight: 500">${datum.count}</span></div>
            </div>
          `);
        }
      })
      .on('mousemove', function (event) {
        if (!bounds) return;
        const x = Math.min(event.clientX - bounds.left + 14, bounds.width - 240);
        const y = event.clientY - bounds.top + 14;
        tooltip
          .style('transform', `translate3d(${x}px, ${y}px, 0)`);
      })
      .on('mouseleave', function () {
        svg.classed('has-hover', false);
        node.classed('is-focused', false);
        baseLink.classed('is-focused', false);
        pulseLink.classed('is-focused', false);

        d3.select(this).classed('is-hovered', false);

        tooltip.style('opacity', 0);
        bounds = null;
      })
      .on('click', (_, datum) => {
        if (datum.type === 'tracker') {
          onNodeClick(datum);
        }
      });

    // Pin center site node permanently at center of viewport coordinates
    const siteNode = nodes.find((n) => n.id === 'site');
    if (siteNode) {
      siteNode.fx = cx;
      siteNode.fy = cy;
    }

    // Distribute remaining nodes in a circle initially to speed up stabilization
    nodes.forEach((n, i) => {
      if (n.id === 'site') {
        n.x = cx;
        n.y = cy;
      } else {
        const angle = (i / (nodes.length - 1)) * 2 * Math.PI;
        const dist = ringRadii[(n.ring || 2) - 1] || 120;
        n.x = cx + Math.cos(angle) * dist;
        n.y = cy + Math.sin(angle) * dist;
      }
    });

    // Create simulation with link, charge, and collision forces (removing conflicting center force)
    simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(d => {
        const target = nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : d.target.id));
        const ring = target?.ring || 2;
        return ringRadii[ring - 1] || 120;
      }).strength(1.0))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('collision', d3.forceCollide().radius((d) => d.radius + 14))
      .force('radial', d3.forceRadial(
        d => d.type === 'site' ? 0 : ringRadii[(d.ring || 2) - 1],
        cx, cy
      ).strength(0.35));

    // Run ticks synchronously to settle layout immediately
    simulation.stop();
    for (let i = 0; i < 100; ++i) {
      simulation.tick();
    }

    const drawPath = d => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const mx = (d.source.x + d.target.x) / 2;
      const my = (d.source.y + d.target.y) / 2;
      return `M${d.source.x},${d.source.y} Q${mx - dy * 0.15},${my + dx * 0.15} ${d.target.x},${d.target.y}`;
    };

    // Cache selections for positioning and tick loop efficiency
    const orbitCircles = ringGroup.selectAll('circle');

    // Render initial coordinates immediately
    baseLink.attr('d', drawPath);
    pulseLink.attr('d', drawPath);
    node.attr('transform', d => `translate(${d.x},${d.y})`);

    // Position orbit circles around the settled Site Node center
    if (siteNode) {
      orbitCircles.attr('cx', siteNode.x).attr('cy', siteNode.y);
    }

    // Zoom-to-fit: calculate bounding box of node layout
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    nodes.forEach(d => {
      x0 = Math.min(x0, d.x - d.radius - 30);
      x1 = Math.max(x1, d.x + d.radius + 30);
      y0 = Math.min(y0, d.y - d.radius - 30);
      y1 = Math.max(y1, d.y + d.radius + 30);
    });

    let scale = 1.0;
    let tx = 0;
    let ty = 0;

    if (x0 !== Infinity) {
      const graphW = x1 - x0;
      const graphH = y1 - y0;
      
      // Compute best scaling factor and bounding center offset
      scale = 0.85 / Math.max(graphW / width, graphH / height);
      scale = Math.max(0.65, Math.min(1.2, scale));

      tx = width / 2 - scale * (x0 + x1) / 2;
      ty = height / 2 - scale * (y0 + y1) / 2;
    }

    // Set auto-fitting zoom transform immediately
    const initialTransform = d3.zoomIdentity.translate(tx, ty).scale(scale);
    svg.call(zoomBehavior.transform, initialTransform);

    // Save zoom control behaviors in ref
    zoomBehaviorRef.current = {
      zoomIn: () => svg.transition().duration(200).call(zoomBehavior.scaleBy, 1.25),
      zoomOut: () => svg.transition().duration(200).call(zoomBehavior.scaleBy, 1 / 1.25),
      reset: () => svg.transition().duration(300).call(zoomBehavior.transform, initialTransform)
    };

    // Register active tick handler for manual drags
    simulation.on('tick', () => {
      baseLink.attr('d', drawPath);
      pulseLink.attr('d', drawPath);
      node.attr('transform', d => `translate(${d.x},${d.y})`);

      if (siteNode) {
        orbitCircles.attr('cx', siteNode.x).attr('cy', siteNode.y);
      }
    });

    return () => simulation.stop();
  }, [events, onNodeClick, isFullscreen, dimensions]);

  useEffect(() => {
    const cleanup = drawGraph();
    return cleanup;
  }, [drawGraph]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      drawGraph();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    return () => observer.disconnect();
  }, [drawGraph]);

  async function toggleFullscreen() {
    if (!containerRef.current) return;

    if (document.fullscreenElement === containerRef.current) {
      await document.exitFullscreen();
      return;
    }

    await containerRef.current.requestFullscreen();
  }

  return (
    <section
      ref={containerRef}
      className={`acrylic-panel overflow-hidden animate-fade-in relative ${isFullscreen ? 'h-screen p-5' : 'h-[400px]'}`}
      style={{ animationDelay: '100ms' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes d3-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes d3-pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.08); opacity: 0.55; }
        }
        @keyframes d3-line-pulse {
          to {
            stroke-dashoffset: -20;
          }
        }
        .site-pulse-ring {
          transform-origin: 0px 0px;
          animation: d3-pulse 3s infinite ease-in-out;
        }
        .site-compass-ring {
          transform-origin: 0px 0px;
          animation: d3-spin 25s linear infinite;
        }
        .link-pulse {
          stroke-opacity: 0;
          pointer-events: none;
        }

        /* Native hardware-accelerated transitions */
        .node circle, .node text, .node rect, .link-base, .link-pulse {
          transition: opacity 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), 
                      stroke-opacity 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), 
                      stroke-width 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), 
                      transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1),
                      fill-opacity 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-origin: 0px 0px;
        }

        /* Hover active state: dim elements not focused */
        svg.has-hover .node:not(.is-focused) {
          opacity: 0.12;
        }
        svg.has-hover .link-base:not(.is-focused) {
          stroke-opacity: 0.01;
        }
        svg.has-hover .link-pulse:not(.is-focused) {
          stroke-opacity: 0.01;
        }

        /* Focus highlighted elements */
        svg.has-hover .node.is-focused {
          opacity: 1;
        }
        svg.has-hover .link-base.is-focused {
          stroke-opacity: 0.35;
        }
        svg.has-hover .link-pulse.is-focused {
          animation: d3-line-pulse 1.2s linear infinite;
          stroke-opacity: 0.95;
          stroke-width: 2.2px;
        }

        /* GPU accelerated transforms for hovered nodes */
        .node.is-hovered .tracker-glow {
          transform: scale(1.15);
          fill-opacity: 0.22 !important;
          stroke-opacity: 0.85 !important;
        }
        .node.is-hovered .tracker-core {
          transform: scale(1.22);
        }
        .node.is-hovered .node-label-group {
          opacity: 1 !important;
        }
      `}} />

      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <p className="section-label text-text">Tracker Network</p>
        <div className="flex items-center gap-3">
          <p className="text-[11px] text-muted tracking-wider uppercase">D3 Force Graph</p>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="btn py-1.5 px-3 flex items-center gap-1.5"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="text-[11px] font-sans">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>
      
      <svg ref={ref} className={`w-full ${isFullscreen ? 'h-[calc(100vh-96px)]' : 'h-[348px]'}`} />

      {/* Floating Zoom/Pan Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-surface-2/75 backdrop-blur-md border border-border rounded-lg p-1 shadow-lg z-20">
        <button
          type="button"
          onClick={() => zoomBehaviorRef.current?.zoomIn()}
          className="p-1.5 rounded-md hover:bg-surface-3 text-muted hover:text-text transition-colors"
          title="Zoom In"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={() => zoomBehaviorRef.current?.zoomOut()}
          className="p-1.5 rounded-md hover:bg-surface-3 text-muted hover:text-text transition-colors"
          title="Zoom Out"
        >
          <Minus size={14} />
        </button>
        <div className="w-[1px] h-4 bg-border mx-0.5" />
        <button
          type="button"
          onClick={() => zoomBehaviorRef.current?.reset()}
          className="p-1.5 rounded-md hover:bg-surface-3 text-muted hover:text-text transition-colors"
          title="Reset View"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none opacity-0 bg-surface-1/90 backdrop-blur-md border border-border p-3.5 rounded-lg shadow-2xl text-[12px] min-w-[190px] max-w-[250px] z-50 transition-opacity duration-120"
        style={{ left: 0, top: 0 }}
      />
    </section>
  );
});

export default NodeGraph;
