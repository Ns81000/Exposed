import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  User, Fingerprint, MousePointer, Tag, Search, ShieldAlert, 
  Building2, Database, AlertTriangle, Eye, Globe, ChevronRight, HelpCircle
} from 'lucide-react';
import { riskAccent } from '../utils/riskColor';

// ── Helpers for parsing parameters ──
function extractKeysFromPayload(payload) {
  if (!payload) return {};
  let parsed = {};
  
  if (typeof payload === 'object') {
    return payload;
  }

  const str = payload.trim();

  // Try JSON
  try {
    const obj = JSON.parse(str);
    if (obj && typeof obj === 'object') return obj;
  } catch (e) {
    // Ignore and try URL query params
  }

  // Try URL query params
  if (str.includes('=') && (str.includes('&') || !str.startsWith('{'))) {
    str.split('&').forEach(p => {
      const parts = p.split('=');
      if (parts[0]) {
        try {
          parsed[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
        } catch {
          parsed[parts[0]] = parts[1] || '';
        }
      }
    });
    return parsed;
  }

  return parsed;
}

export default function ProfileMap({ sites, visits, events, fingerprints }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 440 });
  const [hoveredNode, setHoveredNode] = useState(null); // { type: 'center'|'category'|'company', id: string }
  const [selectedNode, setSelectedNode] = useState(null); // { type: 'category'|'company', id: string }
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);

  // ResizeObserver for responsive SVG coordinates
  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || element.clientWidth || 600,
          height: entry.contentRect.height || element.clientHeight || 440
        });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // ── Deep Telemetry Analysis & Classification ──
  const profile = useMemo(() => {
    const pii = { count: 0, keys: {}, values: new Set() };
    const fingerprint = { count: 0, keys: {}, values: new Set() };
    const behavior = { count: 0, keys: {}, values: new Set() };
    const marketing = { count: 0, keys: {}, values: new Set() };
    const companies = {};

    events.forEach(e => {
      const company = e.company || 'Unknown';
      if (!companies[company]) {
        companies[company] = {
          name: company,
          pii: new Set(),
          fingerprint: new Set(),
          behavior: new Set(),
          marketing: new Set(),
          count: 0,
          risk: e.risk || 'medium'
        };
      }
      companies[company].count += 1;

      const payloadObj = extractKeysFromPayload(e.payload);
      Object.entries(payloadObj).forEach(([key, val]) => {
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        if (!valStr || valStr === 'null' || valStr === 'undefined') return;

        const lowercaseKey = key.toLowerCase();
        let cat = null;

        if (/email|mail|name|phone|usr|user|address|zip|postal|gender|dob|birth|profile/i.test(lowercaseKey)) {
          cat = 'pii';
          pii.values.add(valStr);
          pii.keys[key] = (pii.keys[key] || 0) + 1;
        } else if (/canvas|webgl|gpu|audio|oscillator|screen|res|width|height|avail|font|platform|navigator|agent|webrtc|rtc/i.test(lowercaseKey)) {
          cat = 'fingerprint';
          fingerprint.values.add(valStr);
          fingerprint.keys[key] = (fingerprint.keys[key] || 0) + 1;
        } else if (/scroll|click|mouse|hover|track|drag|key|keypress|keydown|keyup/i.test(lowercaseKey)) {
          cat = 'behavior';
          behavior.values.add(valStr);
          behavior.keys[key] = (behavior.keys[key] || 0) + 1;
        } else if (/utm_|gclid|fbclid|clink|affiliate|camp|source|medium|term|clickid/i.test(lowercaseKey)) {
          cat = 'marketing';
          marketing.values.add(valStr);
          marketing.keys[key] = (marketing.keys[key] || 0) + 1;
        }

        if (cat) {
          companies[company][cat].add(key);
          if (cat === 'pii') pii.count += 1;
          if (cat === 'fingerprint') fingerprint.count += 1;
          if (cat === 'behavior') behavior.count += 1;
          if (cat === 'marketing') marketing.count += 1;
        }
      });
    });

    // Merge fingerprintEvents from script APIs
    fingerprints.forEach(f => {
      const apiName = f.api || 'Unknown API';
      fingerprint.count += 1;
      fingerprint.keys[apiName] = (fingerprint.keys[apiName] || 0) + 1;
      fingerprint.values.add(apiName);

      const compName = 'Browser API Snooping';
      if (!companies[compName]) {
        companies[compName] = {
          name: compName,
          pii: new Set(),
          fingerprint: new Set(),
          behavior: new Set(),
          marketing: new Set(),
          count: 0,
          risk: 'high'
        };
      }
      companies[compName].count += 1;
      companies[compName].fingerprint.add(apiName);
    });

    return { pii, fingerprint, behavior, marketing, companies };
  }, [events, fingerprints]);

  // Generate Ledger Items
  const ledgerItems = useMemo(() => {
    const list = [];

    events.forEach(e => {
      const payloadObj = extractKeysFromPayload(e.payload);
      Object.entries(payloadObj).forEach(([key, val]) => {
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        if (!valStr || valStr === 'null' || valStr === 'undefined') return;

        const lowercaseKey = key.toLowerCase();
        let category = 'other';
        if (/email|mail|name|phone|usr|user|address|zip|postal|gender|dob|birth|profile/i.test(lowercaseKey)) {
          category = 'pii';
        } else if (/canvas|webgl|gpu|audio|oscillator|screen|res|width|height|avail|font|platform|navigator|agent|webrtc|rtc/i.test(lowercaseKey)) {
          category = 'fingerprint';
        } else if (/scroll|click|mouse|hover|track|drag|key|keypress|keydown|keyup/i.test(lowercaseKey)) {
          category = 'behavior';
        } else if (/utm_|gclid|fbclid|clink|affiliate|camp|source|medium|term|clickid/i.test(lowercaseKey)) {
          category = 'marketing';
        }

        list.push({
          id: `t-${e.id}-${key}`,
          key,
          value: valStr,
          category,
          company: e.company || 'Unknown',
          site: e.siteDomain,
          timestamp: new Date(e.timestamp)
        });
      });
    });

    fingerprints.forEach(f => {
      list.push({
        id: `f-${f.id}-${f.api}`,
        key: f.api,
        value: 'Intercepted JS API Query',
        category: 'fingerprint',
        company: 'Browser API Snooping',
        site: f.siteDomain,
        timestamp: new Date(f.timestamp)
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [events, fingerprints]);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    const q = ledgerSearch.toLowerCase().trim();
    if (!q) return ledgerItems;
    return ledgerItems.filter(item => 
      item.key.toLowerCase().includes(q) || 
      item.value.toLowerCase().includes(q) || 
      item.company.toLowerCase().includes(q) || 
      item.site.toLowerCase().includes(q)
    );
  }, [ledgerItems, ledgerSearch]);

  const itemsPerPage = 8;
  const totalLedgerPages = Math.ceil(filteredLedger.length / itemsPerPage) || 1;
  const paginatedLedger = useMemo(() => {
    const start = (ledgerPage - 1) * itemsPerPage;
    return filteredLedger.slice(start, start + itemsPerPage);
  }, [filteredLedger, ledgerPage]);

  // Reset page when search changes
  useEffect(() => {
    setLedgerPage(1);
  }, [ledgerSearch]);

  // ── Coordinates and Mapping Logic for the Orbital Map ──
  const mapData = useMemo(() => {
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    
    // Orbital radii
    const r1 = Math.min(dimensions.width, dimensions.height) * 0.22; // Inner Category Ring
    const r2 = Math.min(dimensions.width, dimensions.height) * 0.42; // Outer Company Ring

    // 4 Category Nodes
    const categories = [
      { id: 'pii', label: 'Identity / PII', icon: User, angle: -Math.PI / 2, color: 'var(--color-risk-high)' },
      { id: 'fingerprint', label: 'Device Blueprint', icon: Fingerprint, angle: 0, color: 'var(--color-accent)' },
      { id: 'behavior', label: 'User Behavior', icon: MousePointer, angle: Math.PI / 2, color: 'var(--color-risk-medium)' },
      { id: 'marketing', label: 'Campaign Tracker', icon: Tag, angle: Math.PI, color: 'var(--color-risk-low)' }
    ].map(cat => ({
      ...cat,
      x: cx + r1 * Math.cos(cat.angle),
      y: cy + r1 * Math.sin(cat.angle)
    }));

    // Companies Node
    const companyKeys = Object.keys(profile.companies).slice(0, 10); // Limit to top 10 companies for clutter reduction
    const companiesNodes = companyKeys.map((cName, idx) => {
      const angle = (idx / companyKeys.length) * 2 * Math.PI - Math.PI / 4;
      const compData = profile.companies[cName];
      return {
        id: cName,
        label: cName,
        type: 'company',
        x: cx + r2 * Math.cos(angle),
        y: cy + r2 * Math.sin(angle),
        count: compData.count,
        risk: compData.risk,
        categories: {
          pii: compData.pii.size > 0,
          fingerprint: compData.fingerprint.size > 0,
          behavior: compData.behavior.size > 0,
          marketing: compData.marketing.size > 0
        }
      };
    });

    // Generate link curves
    const links = [];
    companiesNodes.forEach(c => {
      categories.forEach(cat => {
        if (c.categories[cat.id]) {
          links.push({
            id: `link-${c.id}-${cat.id}`,
            source: c,
            target: cat,
            risk: c.risk,
            color: cat.color
          });
        }
      });
    });

    return { cx, cy, r1, r2, categories, companiesNodes, links };
  }, [dimensions, profile]);

  // Reconstructed Persona helper
  const reconstructedPersona = useMemo(() => {
    const isHighPII = profile.pii.count > 0;
    const isHighFp = profile.fingerprint.count > 3;
    const isHighBeh = profile.behavior.count > 2;

    if (isHighPII && isHighFp) {
      return {
        title: 'De-anonymized Shadow Identity',
        desc: 'Corporate entities have combined unique hardware fingerprint hashes directly with your verified contact information.',
        alert: 'CRITICAL',
        color: 'text-riskHigh border-riskHigh/20 bg-riskHigh/5'
      };
    }
    if (isHighFp) {
      return {
        title: 'Uniquely Fingerprinted Client',
        desc: 'Advanced canvas and WebGL queries have compiled a mathematical identifier that recognizes your device across browser sessions.',
        alert: 'HIGH ALERT',
        color: 'text-accent border-accent/20 bg-accent-soft'
      };
    }
    if (isHighBeh) {
      return {
        title: 'Behaviorally Diagnosed Target',
        desc: 'Scripts are recording scrolling depths, focus changes, and micro-clicks to reconstruct your digital patterns.',
        alert: 'MEDIUM RISK',
        color: 'text-riskMedium border-riskMedium/20 bg-riskMedium/5'
      };
    }
    return {
      title: 'Monitored Guest',
      desc: 'Telemetry and advertising click queries are tracing navigation referrals and UTM sources.',
      alert: 'MONITORED',
      color: 'text-riskLow border-riskLow/20 bg-riskLow/5'
    };
  }, [profile]);

  // Selection detail box
  const selectedDetails = useMemo(() => {
    const node = selectedNode || hoveredNode;
    if (!node) return null;

    if (node.type === 'category') {
      const catData = profile[node.id];
      const categoryLabel = mapData.categories.find(c => c.id === node.id)?.label || '';
      const uniqueKeys = Object.keys(catData.keys);
      return {
        title: categoryLabel,
        subtitle: 'Telemetry Classification',
        stats: `${catData.count} Intercepts (${uniqueKeys.length} Unique Parameters)`,
        keys: uniqueKeys.slice(0, 8),
        companies: Object.values(profile.companies).filter(c => c[node.id].size > 0).map(c => c.name)
      };
    }

    if (node.type === 'company') {
      const compData = profile.companies[node.id];
      if (!compData) return null;
      const collectedCats = [];
      if (compData.pii.size > 0) collectedCats.push('PII');
      if (compData.fingerprint.size > 0) collectedCats.push('Device Fingerprints');
      if (compData.behavior.size > 0) collectedCats.push('Behavior Telemetry');
      if (compData.marketing.size > 0) collectedCats.push('Campaign Trackers');

      return {
        title: compData.name,
        subtitle: 'Surveillance Corporation',
        stats: `${compData.count} Network Leaks`,
        risk: compData.risk,
        categories: collectedCats,
        keys: [
          ...Array.from(compData.pii),
          ...Array.from(compData.fingerprint),
          ...Array.from(compData.behavior),
          ...Array.from(compData.marketing)
        ].slice(0, 10)
      };
    }

    return null;
  }, [selectedNode, hoveredNode, profile, mapData]);

  // Is node highlighted helper
  const getNodeOpacity = (node) => {
    const target = hoveredNode || selectedNode;
    if (!target) return 1.0;

    if (target.type === 'center') return 1.0;

    if (target.type === 'category') {
      if (node.id === target.id) return 1.0;
      if (node.type === 'company' && profile.companies[node.id]?.[target.id].size > 0) return 1.0;
      return 0.12;
    }

    if (target.type === 'company') {
      if (node.id === target.id) return 1.0;
      if (node.id === 'center') return 1.0;
      if (node.type === 'category' && profile.companies[target.id]?.[node.id].size > 0) return 1.0;
      return 0.12;
    }

    return 1.0;
  };

  const getLinkOpacity = (link) => {
    const target = hoveredNode || selectedNode;
    if (!target) return 0.22;

    if (target.type === 'category') {
      return link.target.id === target.id ? 0.85 : 0.02;
    }
    if (target.type === 'company') {
      return link.source.id === target.id ? 0.85 : 0.02;
    }
    return 0.22;
  };

  return (
    <main className="flex-1 p-5 md:p-6 space-y-6 overflow-y-auto scrollbar animate-fade-in">
      {/* Header */}
      <header className="acrylic-panel px-6 py-5 flex items-center justify-between">
        <div>
          <p className="section-label tracking-wider">Surveillance Mapping</p>
          <h1 className="text-[22px] font-display font-bold text-text mt-1 tracking-tight">Identity Shadow Profile</h1>
        </div>
        <div className="flex items-center gap-2 border border-danger/20 bg-danger/5 px-3 py-1.5 rounded-lg text-riskHigh text-[11px] font-mono">
          <ShieldAlert size={14} className="animate-pulse" />
          {ledgerItems.length} LEAKED VECTORS DETECTED
        </div>
      </header>

      {/* Main Graph + Bento Dossier Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1.1fr] gap-6 items-start">
        
        {/* Radar Orbit Map */}
        <section className="acrylic-panel p-5 relative overflow-hidden flex flex-col justify-between h-[520px]">
          <div className="px-1 pb-4 border-b border-border flex items-center justify-between z-10">
            <div>
              <p className="section-label text-text">Shadow Profile Radar</p>
              <p className="text-[11.5px] text-muted mt-0.5">Interactive concentric orbits showing corporations draining raw parameters.</p>
            </div>
            <span className="text-[10px] text-accent border border-accent/20 bg-accent-soft px-2.5 py-0.8 rounded font-mono font-medium">
              {(hoveredNode || selectedNode) ? 'AUDITING NODE CONNECTIONS' : 'HOVER OR CLICK NODES TO EXPLORE'}
            </span>
          </div>

          <div ref={containerRef} className="flex-1 relative cursor-grab active:cursor-grabbing">
            {/* Ambient Sonar sweep mesh */}
            <div className="mesh-bg" />

            <svg className="w-full h-full select-none" style={{ minHeight: '380px' }}>
              {/* Concentric Guide Rings */}
              <circle cx={mapData.cx} cy={mapData.cy} r={mapData.r1} fill="none" stroke="var(--color-border)" strokeWidth="0.8" strokeDasharray="4,6" />
              <circle cx={mapData.cx} cy={mapData.cy} r={mapData.r2} fill="none" stroke="var(--color-border)" strokeWidth="0.8" strokeDasharray="3,8" />

              {/* Connecting Lines */}
              {mapData.links.map(link => {
                const opacity = getLinkOpacity(link);
                // Draw elegant bezier curves from outer company to middle category
                const dx = link.target.x - link.source.x;
                const dy = link.target.y - link.source.y;
                const mx = (link.source.x + link.target.x) / 2;
                const my = (link.source.y + link.target.y) / 2;
                const curve = `M${link.source.x},${link.source.y} Q${mx - dy * 0.1},${my + dx * 0.1} ${link.target.x},${link.target.y}`;
                return (
                  <path
                    key={link.id}
                    d={curve}
                    fill="none"
                    stroke={link.color}
                    strokeWidth={opacity > 0.3 ? 2.5 : 1.2}
                    strokeOpacity={opacity}
                    style={{ transition: 'stroke-opacity 180ms ease, stroke-width 180ms ease' }}
                  />
                );
              })}

              {/* Connecting from categories to central 'You' node */}
              {mapData.categories.map(cat => {
                const opacity = hoveredNode || selectedNode 
                  ? (hoveredNode?.id === cat.id || selectedNode?.id === cat.id || 
                    (hoveredNode?.type === 'company' && profile.companies[hoveredNode.id]?.[cat.id].size > 0) ||
                    (selectedNode?.type === 'company' && profile.companies[selectedNode.id]?.[cat.id].size > 0) ? 0.9 : 0.03)
                  : 0.3;
                return (
                  <line
                    key={`center-link-${cat.id}`}
                    x1={cat.x}
                    y1={cat.y}
                    x2={mapData.cx}
                    y2={mapData.cy}
                    stroke={cat.color}
                    strokeWidth={opacity > 0.5 ? 3.0 : 1.5}
                    strokeOpacity={opacity}
                    style={{ transition: 'stroke-opacity 180ms ease, stroke-width 180ms ease' }}
                  />
                );
              })}

              {/* Central 'You' Node */}
              <g 
                transform={`translate(${mapData.cx}, ${mapData.cy})`}
                onMouseEnter={() => setHoveredNode({ type: 'center', id: 'center' })}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Sonar Pulse Ring */}
                <circle r="26" fill="none" stroke="var(--color-risk-low)" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle r="18" fill="var(--color-bg)" stroke="var(--color-risk-low)" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 8px var(--color-success))' }} />
                <text textAnchor="middle" dy="0.31em" fontSize="9px" fontFamily="JetBrains Mono" fontWeight="700" fill="var(--color-success)">YOU</text>
              </g>

              {/* Inner Categories Nodes */}
              {mapData.categories.map(cat => {
                const opacity = getNodeOpacity(cat);
                const isSelected = selectedNode?.type === 'category' && selectedNode.id === cat.id;
                return (
                  <g
                    key={cat.id}
                    transform={`translate(${cat.x}, ${cat.y})`}
                    style={{ cursor: 'pointer', transition: 'opacity 180ms ease' }}
                    opacity={opacity}
                    onMouseEnter={() => setHoveredNode({ type: 'category', id: cat.id })}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(isSelected ? null : { type: 'category', id: cat.id })}
                  >
                    <circle r={isSelected ? 16 : 14} fill="var(--color-surface-2)" stroke={cat.color} strokeWidth={isSelected ? 2.5 : 1.5} />
                    <g transform="translate(-7, -7)" className="text-secondary" style={{ color: cat.color }}>
                      <cat.icon size={14} color={cat.color} />
                    </g>
                    <text
                      textAnchor="middle"
                      dy={24}
                      fontSize="9.5px"
                      fontFamily="Outfit"
                      fontWeight="600"
                      fill="var(--color-text)"
                    >
                      {cat.label}
                    </text>
                  </g>
                );
              })}

              {/* Outer Companies Nodes */}
              {mapData.companiesNodes.map(comp => {
                const opacity = getNodeOpacity(comp);
                const isSelected = selectedNode?.type === 'company' && selectedNode.id === comp.id;
                return (
                  <g
                    key={comp.id}
                    transform={`translate(${comp.x}, ${comp.y})`}
                    style={{ cursor: 'pointer', transition: 'opacity 180ms ease' }}
                    opacity={opacity}
                    onMouseEnter={() => setHoveredNode({ type: 'company', id: comp.id })}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(isSelected ? null : { type: 'company', id: comp.id })}
                  >
                    <circle r={isSelected ? 10 : 8} fill={riskAccent(comp.risk)} stroke={riskAccent(comp.risk)} strokeOpacity="0.4" strokeWidth="3" />
                    <text
                      textAnchor={comp.x > mapData.cx ? 'start' : 'end'}
                      dx={comp.x > mapData.cx ? 14 : -14}
                      dy="0.31em"
                      fontSize="10px"
                      fontFamily="Outfit"
                      fontWeight="500"
                      fill={isSelected ? 'var(--color-accent)' : 'var(--color-secondary)'}
                    >
                      {comp.label.length > 18 ? comp.label.substring(0, 16) + '…' : comp.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Shadow Profile Bento Card */}
        <section className="space-y-5">
          {/* Persona Card */}
          <div className="acrylic-panel p-5 space-y-4">
            <div className="pb-3 border-b border-border">
              <p className="section-label">Shadow Persona</p>
              <h3 className="text-[16px] font-display font-bold text-text mt-1">Reconstructed Dossier</h3>
            </div>

            <div className={`border p-4 rounded-lg flex flex-col gap-2.5 ${reconstructedPersona.color}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-current bg-current/5">
                  {reconstructedPersona.alert}
                </span>
                <span className="text-[10px] text-muted font-mono">{sites.length} Active Sites</span>
              </div>
              <h4 className="text-[14px] font-display font-semibold text-text leading-snug">{reconstructedPersona.title}</h4>
              <p className="text-[11.5px] leading-relaxed opacity-90">{reconstructedPersona.desc}</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[12px] py-1 border-b border-border/40">
                <span className="text-secondary font-medium">PII Parameters Leaked:</span>
                <span className={`font-mono font-bold ${profile.pii.count > 0 ? 'text-riskHigh' : 'text-secondary'}`}>{profile.pii.count}</span>
              </div>
              <div className="flex justify-between items-center text-[12px] py-1 border-b border-border/40">
                <span className="text-secondary font-medium">Leaked Fingerprint Hashes:</span>
                <span className="font-mono font-bold text-accent">{profile.fingerprint.count}</span>
              </div>
              <div className="flex justify-between items-center text-[12px] py-1 border-b border-border/40">
                <span className="text-secondary font-medium">Recorded Scroll & Keystrokes:</span>
                <span className="font-mono font-bold text-riskMedium">{profile.behavior.count}</span>
              </div>
              <div className="flex justify-between items-center text-[12px] py-1 border-b border-border/40">
                <span className="text-secondary font-medium">Leaked Click/Ad Campaigns:</span>
                <span className="font-mono font-bold text-riskLow">{profile.marketing.count}</span>
              </div>
            </div>
          </div>

          {/* Node Inspector Detail Panel */}
          <div className="acrylic-panel p-5 min-h-[195px] flex flex-col justify-between">
            {selectedDetails ? (
              <div className="space-y-4 animate-scale-in">
                <div className="pb-3 border-b border-border flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-muted uppercase tracking-wider">{selectedDetails.subtitle}</span>
                    <h4 className="text-[15px] font-display font-bold text-text mt-0.5">{selectedDetails.title}</h4>
                  </div>
                  {selectedDetails.risk && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${riskAccent(selectedDetails.risk)}15`, color: riskAccent(selectedDetails.risk), border: `1px solid ${riskAccent(selectedDetails.risk)}25` }}>
                      {selectedDetails.risk} RISK
                    </span>
                  )}
                </div>

                <div className="text-[12px] text-secondary">
                  <p className="font-medium text-text mb-1.5">Metrics: <span className="font-mono text-secondary font-normal">{selectedDetails.stats}</span></p>
                  
                  {selectedDetails.categories && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {selectedDetails.categories.map(c => (
                        <span key={c} className="text-[9.5px] bg-surface-3 border border-border px-1.5 py-0.5 rounded font-medium text-text">{c}</span>
                      ))}
                    </div>
                  )}

                  {selectedDetails.keys && selectedDetails.keys.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Leaked Parameters:</span>
                      <div className="flex flex-wrap gap-1 max-h-[70px] overflow-y-auto scrollbar">
                        {selectedDetails.keys.map(k => (
                          <code key={k} className="text-[10px] bg-surface-2 border border-border px-1.5 py-0.5 rounded font-mono text-secondary">{k}</code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <Building2 size={24} className="text-muted mb-3" />
                <h4 className="font-display font-semibold text-[13px] text-text mb-1">Radar Inspector</h4>
                <p className="text-[11px] text-secondary max-w-xs font-normal leading-normal">
                  Hover or click a tracker company node or a data category bubble to audit leaking nodes.
                </p>
              </div>
            )}
            
            {selectedNode && (
              <button 
                type="button" 
                onClick={() => setSelectedNode(null)}
                className="w-full text-center text-[10.5px] font-mono text-muted hover:text-text border-t border-border/40 pt-2.5 mt-4 transition-colors"
              >
                CLEAR ACTIVE SELECTION
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Reconstructed Profile Value Blocks (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Identified Contacts Block */}
        <div className="stat-card space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Database size={15} className="text-riskHigh" />
            <h4 className="font-display font-semibold text-[13px] text-text">Contact Identity Leakage</h4>
          </div>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar pr-1">
            {profile.pii.values.size > 0 ? (
              Array.from(profile.pii.values).slice(0, 5).map((val, idx) => (
                <div key={idx} className="flex flex-col border border-border/40 bg-surface-2/20 px-2.5 py-1.5 rounded font-mono text-[11px] text-text truncate">
                  <span className="text-[9px] text-muted tracking-wide uppercase mb-0.5">Captured Val</span>
                  {val}
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted leading-relaxed">No direct contact details (emails, phone numbers) intercepted in telemetry payloads yet.</p>
            )}
          </div>
        </div>

        {/* Fingerprint Signatures Block */}
        <div className="stat-card space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Fingerprint size={15} className="text-accent" />
            <h4 className="font-display font-semibold text-[13px] text-text">Device Blueprint Hashes</h4>
          </div>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar pr-1">
            {profile.fingerprint.values.size > 0 ? (
              Array.from(profile.fingerprint.values).slice(0, 5).map((val, idx) => (
                <div key={idx} className="flex justify-between items-center border border-border/40 bg-surface-2/20 px-2.5 py-1.5 rounded font-mono text-[11.5px] text-text">
                  <span className="truncate">{val.split('(')[0]}</span>
                  <span className="text-[10px] text-accent border border-accent/20 bg-accent-soft px-1.5 py-0.2 rounded shrink-0">Queried</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted leading-relaxed">No client-side hardware queries detected on active pages.</p>
            )}
          </div>
        </div>

        {/* Marketing Click Tracker Campaign parameters */}
        <div className="stat-card space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Tag size={15} className="text-riskLow" />
            <h4 className="font-display font-semibold text-[13px] text-text">Campaign Referral Tags</h4>
          </div>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar pr-1">
            {profile.marketing.values.size > 0 ? (
              Array.from(profile.marketing.values).slice(0, 5).map((val, idx) => (
                <div key={idx} className="flex flex-col border border-border/40 bg-surface-2/20 px-2.5 py-1.5 rounded font-mono text-[11px] text-text truncate">
                  <span className="text-[9px] text-muted tracking-wide uppercase mb-0.5">Campaign Param</span>
                  {val}
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted leading-relaxed">No external marketing refers or UTM campaign queries tracked.</p>
            )}
          </div>
        </div>

      </div>

      {/* Ledger Table */}
      <section className="acrylic-panel p-5 space-y-4">
        <div className="pb-3 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="section-label text-text">Data Parameter Ledger</p>
            <p className="text-[11px] text-muted mt-0.5">Raw parameter scan ledger matching telemetry packets to recipients.</p>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 focus-within:border-accent-solid min-w-[240px]">
            <Search size={14} className="text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search parameters, companies..."
              value={ledgerSearch}
              onChange={e => setLedgerSearch(e.target.value)}
              className="flex-1 bg-transparent text-[12px] text-text placeholder:text-muted outline-none border-none"
            />
          </div>
        </div>

        {filteredLedger.length === 0 ? (
          <div className="py-12 text-center text-muted font-mono text-[12px]">
            No matching data parameter packets.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-mono text-muted uppercase tracking-wider">
                    <th className="pb-2.5 font-semibold">Parameter Key</th>
                    <th className="pb-2.5 font-semibold">Value</th>
                    <th className="pb-2.5 font-semibold">Classification</th>
                    <th className="pb-2.5 font-semibold">Recipient Entity</th>
                    <th className="pb-2.5 font-semibold">Origin Site</th>
                    <th className="pb-2.5 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-sans text-[12px]">
                  {paginatedLedger.map(item => {
                    let catColor = 'text-secondary';
                    if (item.category === 'pii') catColor = 'text-riskHigh font-semibold';
                    if (item.category === 'fingerprint') catColor = 'text-accent font-semibold';
                    if (item.category === 'behavior') catColor = 'text-riskMedium font-semibold';
                    if (item.category === 'marketing') catColor = 'text-riskLow font-semibold';

                    return (
                      <tr key={item.id} className="hover:bg-surface-2/20">
                        <td className="py-3 font-mono text-[11px] text-text font-medium select-all">{item.key}</td>
                        <td className="py-3 max-w-[200px] truncate font-mono text-[10.5px] text-secondary select-all" title={item.value}>{item.value}</td>
                        <td className={`py-3 capitalize text-[10.5px] ${catColor}`}>{item.category}</td>
                        <td className="py-3 font-medium text-text">{item.company}</td>
                        <td className="py-3 text-secondary">{item.site}</td>
                        <td className="py-3 font-mono text-[10.5px] text-muted">{item.timestamp.toLocaleTimeString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalLedgerPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/40 pt-4 text-[11px] font-mono">
                <span className="text-muted">
                  Showing {Math.min(filteredLedger.length, (ledgerPage - 1) * itemsPerPage + 1)}-{Math.min(filteredLedger.length, ledgerPage * itemsPerPage)} of {filteredLedger.length} items
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={ledgerPage === 1}
                    onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                    className="btn px-2.5 py-1 text-[11.5px]"
                  >
                    Prev
                  </button>
                  <span className="px-3 text-text">Page {ledgerPage} of {totalLedgerPages}</span>
                  <button
                    type="button"
                    disabled={ledgerPage === totalLedgerPages}
                    onClick={() => setLedgerPage(p => Math.min(totalLedgerPages, p + 1))}
                    className="btn px-2.5 py-1 text-[11.5px]"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
