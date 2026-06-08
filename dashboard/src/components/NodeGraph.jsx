import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Maximize2, Minimize2 } from 'lucide-react';
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

export default function NodeGraph({ events, onNodeClick }) {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const prevStructureRef = useRef('');

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
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || ref.current.clientWidth,
          height: entry.contentRect.height || ref.current.clientHeight
        });
      }
    });

    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);

  const drawGraph = useCallback(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    const tooltip = d3.select(tooltipRef.current);
    let simulation;

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
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        graphLayer.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, d3.zoomIdentity);

    // Dot grid pattern
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

    svg.insert('rect', ':first-child')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', `url(#dot-grid)`);

    // Concentric ring guides (subtle)
    const cx = width / 2;
    const cy = height / 2;
    const minDim = Math.min(width, height);
    const ringRadii = [minDim * 0.18, minDim * 0.32, minDim * 0.44];

    const ringGroup = graphLayer.append('g').attr('class', 'ring-guides');
    ringRadii.forEach((r) => {
      ringGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', colors.border)
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '3,6');
    });

    // Links — smooth curves, colored by risk, subtle
    const linkGroup = graphLayer.append('g');
    const link = linkGroup
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', d => {
        const targetNode = nodes.find(n => n.id === d.target);
        return targetNode ? riskAccent(targetNode.risk) : colors.muted;
      })
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.25);

    // Node groups
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

    // Node circles — flat fill, subtle stroke
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => {
        if (d.type === 'site') return colors.accent;
        const color = riskAccent(d.risk);
        return color;
      })
      .attr('fill-opacity', d => d.type === 'site' ? 1 : 0.75)
      .attr('stroke', d => {
        if (d.type === 'site') return colors.accent;
        return riskAccent(d.risk);
      })
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 1);

    // Site node label
    node.filter(d => d.type === 'site')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '9px')
      .attr('font-family', 'Outfit, sans-serif')
      .attr('font-weight', '600')
      .attr('fill', '#FFFFFF')
      .style('pointer-events', 'none')
      .text(d => {
        const domain = d.label;
        const parts = domain.split('.');
        if (parts.length >= 2) {
          const name = parts[parts.length - 2];
          return name.length > 6 ? name.substring(0, 6).toUpperCase() : name.toUpperCase();
        }
        return domain.substring(0, 6).toUpperCase();
      });

    // Tracker node labels — show for larger nodes
    node.filter(d => d.type === 'tracker' && d.radius >= 12)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 14)
      .attr('font-size', '9px')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .attr('font-weight', '500')
      .attr('fill', colors.secondary)
      .style('pointer-events', 'none')
      .text(d => d.label.length > 14 ? d.label.substring(0, 12) + '…' : d.label);

    // Tooltip & Hover
    node
      .on('mouseenter', function (event, datum) {
        // Dim everything
        node.attr('opacity', d =>
          d.id === datum.id || links.some(l =>
            (l.source.id === datum.id && l.target.id === d.id) ||
            (l.target.id === datum.id && l.source.id === d.id)
          ) ? 1 : 0.15
        );

        link.attr('stroke-opacity', edge =>
          edge.source.id === datum.id || edge.target.id === datum.id ? 0.5 : 0.04
        );

        d3.select(this).select('circle')
          .transition().duration(120)
          .attr('r', d => d.radius + 2)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', 1.5);

        const bounds = containerRef.current.getBoundingClientRect();
        const x = Math.min(event.clientX - bounds.left + 14, bounds.width - 240);
        const y = event.clientY - bounds.top + 14;

        tooltip
          .style('left', `${x}px`)
          .style('top', `${y}px`)
          .transition().duration(120)
          .style('opacity', 1);

        if (datum.type === 'site') {
          tooltip.html(`
            <div class="font-display font-semibold text-[13px]" style="color: ${colors.text}">
              ${datum.label}
            </div>
            <div class="text-[11px] mt-1" style="color: ${colors.secondary}">Active Web Domain</div>
          `);
        } else {
          tooltip.html(`
            <div class="font-display font-semibold text-[13px] mb-2" style="color: ${colors.text}">
              ${datum.label}
            </div>
            <div class="text-[11px] mb-1" style="color: ${colors.secondary}">Category: <span style="color: ${colors.text}; font-weight: 500">${datum.category || 'Tracker'}</span></div>
            <div class="text-[11px] mb-1" style="color: ${colors.secondary}">Risk: <span style="color: ${riskAccent(datum.risk)}; font-weight: 600; text-transform: uppercase">${datum.risk}</span></div>
            <div class="text-[11px]" style="color: ${colors.secondary}">Requests: <span style="color: ${colors.text}; font-weight: 500; font-variant-numeric: tabular-nums">${datum.count}</span></div>
          `);
        }
      })
      .on('mousemove', function (event) {
        const bounds = containerRef.current.getBoundingClientRect();
        const x = Math.min(event.clientX - bounds.left + 14, bounds.width - 240);
        const y = event.clientY - bounds.top + 14;
        tooltip
          .style('left', `${x}px`)
          .style('top', `${y}px`);
      })
      .on('mouseleave', function () {
        node.attr('opacity', 1);
        link.attr('stroke-opacity', 0.2);

        d3.select(this).select('circle')
          .transition().duration(120)
          .attr('r', d => d.radius)
          .attr('stroke-opacity', 0.3)
          .attr('stroke-width', 1);

        tooltip.transition().duration(120).style('opacity', 0);
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
      .force('collision', d3.forceCollide().radius((d) => d.radius + 12))
      .force('radial', d3.forceRadial(
        d => d.type === 'site' ? 0 : ringRadii[(d.ring || 2) - 1],
        cx, cy
      ).strength(0.35));

    // Run ticks synchronously to settle layout immediately
    simulation.stop();
    for (let i = 0; i < 100; ++i) {
      simulation.tick();
    }

    // Render initial coordinates immediately
    link.attr('d', d => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.2; // slight arc curvature
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    });

    node.attr('transform', d => `translate(${d.x},${d.y})`);

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

    // Register active tick handler for manual drags
    simulation.on('tick', () => {
      link.attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      node.attr('transform', d => `translate(${d.x},${d.y})`);
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

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none opacity-0 bg-surface-1 border border-border p-3 rounded-lg shadow-xl text-[12px] min-w-[180px] max-w-[240px] z-50 transition-opacity duration-120"
      />
    </section>
  );
}
