import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { riskAccent } from '../utils/riskColor';

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
    { id: 'site', label: siteDomain, type: 'site', radius: 12 },
    ...Object.entries(counts).map(([company, value]) => ({
      id: company,
      label: company,
      type: 'tracker',
      risk: value.risk,
      category: value.category,
      count: value.count,
      radius: Math.max(8, Math.min(28, 8 + value.count * 2))
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    if (events.length === 0) return;

    const element = ref.current;
    const width = element.clientWidth || 900;
    const height = element.clientHeight || 360;

    const { nodes, links } = buildGraph(events);
    const graphLayer = svg.append('g');

    svg.call(
      d3.zoom().scaleExtent([0.3, 3]).on('zoom', (event) => {
        graphLayer.attr('transform', event.transform);
      })
    );

    const link = graphLayer
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#242424')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6);

    const node = graphLayer
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => (d.type === 'site' ? '#FAFAFA' : riskAccent(d.risk)))
      .attr('fill-opacity', (d) => (d.type === 'site' ? 1 : 0.6))
      .attr('stroke', '#242424')
      .attr('stroke-width', (d) => (d.type === 'site' ? 0 : 1))
      .style('cursor', 'pointer')
      .on('mouseenter', function onMouseEnter(_, datum) {
        d3.select(this).attr('stroke', '#FAFAFA');
        link.attr('stroke-opacity', (edge) => (edge.source.id === datum.id || edge.target.id === datum.id ? 1 : 0.2));
      })
      .on('mouseleave', function onMouseLeave(_, datum) {
        d3.select(this).attr('stroke', datum.type === 'site' ? 'none' : '#242424');
        link.attr('stroke-opacity', 0.6);
      })
      .on('click', (_, datum) => {
        if (datum.type === 'tracker') {
          onNodeClick(datum);
        }
      })
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
            datum.fx = null;
            datum.fy = null;
          })
      );

    const label = graphLayer
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', 11)
      .attr('fill', '#52525B')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    node.on('mouseenter.label', function onLabelEnter(_, datum) {
      label.filter((nodeDatum) => nodeDatum.id === datum.id).style('opacity', 1).attr('fill', '#FAFAFA');
    });

    node.on('mouseleave.label', function onLabelLeave(_, datum) {
      label.filter((nodeDatum) => nodeDatum.id === datum.id).style('opacity', 0).attr('fill', '#52525B');
    });

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(130))
      .force('charge', d3.forceManyBody().strength(-450))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d) => d.radius + 8));

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      label.attr('x', (d) => d.x).attr('y', (d) => d.y + d.radius + 14);
    });

    return () => simulation.stop();
  }, [events, onNodeClick]);

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
      className={`border border-border bg-surface ${isFullscreen ? 'h-screen p-4' : 'h-[360px]'}`}
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="section-label">Tracker Network</p>
        <div className="flex items-center gap-3">
          <p className="text-[11px] text-muted tracking-[0.08em] uppercase">D3 Graph</p>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="border border-border px-3 py-1 text-[11px] text-secondary hover:border-muted hover:text-text transition-all duration-150"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>
      <svg ref={ref} className={`w-full bg-bg ${isFullscreen ? 'h-[calc(100vh-96px)]' : 'h-[312px]'}`} />
    </section>
  );
}
