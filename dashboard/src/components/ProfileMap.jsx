import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  User, Fingerprint, MousePointer, Tag, Search, ShieldAlert, 
  Building2, Database, AlertTriangle, Eye, Globe, ChevronRight, HelpCircle,
  X, ExternalLink, Clock, Layers, TrendingUp, Zap, Radio
} from 'lucide-react';
import { riskAccent } from '../utils/riskColor';

// ── Helpers for parsing parameters ──
function extractKeysFromPayload(payload) {
  if (!payload) return {};
  
  if (typeof payload === 'object') {
    return payload;
  }

  const str = payload.trim();

  // 1. Try parsing as standard JSON (single-line or formatted multi-line)
  try {
    const obj = JSON.parse(str);
    if (obj && typeof obj === 'object') return obj;
  } catch (e) {
    // Ignore and proceed to NDJSON
  }

  // 2. Try parsing as NDJSON or space-separated JSON blocks (Sentry envelopes)
  if (str.startsWith('{') || str.includes('\n')) {
    const parts = str.split(/\n/);
    let merged = {};
    let parsedAny = false;
    parts.forEach(part => {
      const trimmedPart = part.trim();
      if (!trimmedPart) return;
      try {
        const parsed = JSON.parse(trimmedPart);
        if (parsed && typeof parsed === 'object') {
          merged = { ...merged, ...parsed };
          parsedAny = true;
        }
      } catch (e) {
        // Try splitting by space between JSON objects: } {
        const subParts = trimmedPart.split(/(?<=\})\s+(?=\{)/);
        if (subParts.length > 1) {
          subParts.forEach(sp => {
            try {
              const parsedSub = JSON.parse(sp.trim());
              if (parsedSub && typeof parsedSub === 'object') {
                merged = { ...merged, ...parsedSub };
                parsedAny = true;
              }
            } catch (e2) {
              // Ignored
            }
          });
        }
      }
    });
    if (parsedAny) {
      return merged;
    }
  }

  // 3. Try URL query params fallback
  let parsed = {};
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

// Category metadata
const CATEGORY_META = {
  pii: { label: 'Identity / PII', color: 'var(--color-risk-high)', icon: User, shortLabel: 'PII' },
  fingerprint: { label: 'Device Blueprint', color: 'var(--color-accent)', icon: Fingerprint, shortLabel: 'FP' },
  behavior: { label: 'User Behavior', color: 'var(--color-risk-medium)', icon: MousePointer, shortLabel: 'BEH' },
  marketing: { label: 'Campaign Tracker', color: 'var(--color-risk-low)', icon: Tag, shortLabel: 'MKT' }
};

export default function ProfileMap({ sites, visits, events, fingerprints }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 440 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState('all');
  const [tooltipPos, setTooltipPos] = useState(null);

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
          risk: e.risk || 'medium',
          sites: new Set(),
          firstSeen: e.timestamp,
          lastSeen: e.timestamp
        };
      }
      companies[company].count += 1;
      companies[company].sites.add(e.siteDomain);
      if (new Date(e.timestamp) < new Date(companies[company].firstSeen)) {
        companies[company].firstSeen = e.timestamp;
      }
      if (new Date(e.timestamp) > new Date(companies[company].lastSeen)) {
        companies[company].lastSeen = e.timestamp;
      }

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
          risk: 'high',
          sites: new Set(),
          firstSeen: f.timestamp,
          lastSeen: f.timestamp
        };
      }
      companies[compName].count += 1;
      companies[compName].fingerprint.add(apiName);
      companies[compName].sites.add(f.siteDomain);
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
          risk: e.risk || 'medium',
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
        risk: 'high',
        timestamp: new Date(f.timestamp)
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [events, fingerprints]);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    let items = ledgerItems;
    
    if (ledgerCategoryFilter !== 'all') {
      items = items.filter(item => item.category === ledgerCategoryFilter);
    }
    
    const q = ledgerSearch.toLowerCase().trim();
    if (q) {
      items = items.filter(item => 
        item.key.toLowerCase().includes(q) || 
        item.value.toLowerCase().includes(q) || 
        item.company.toLowerCase().includes(q) || 
        item.site.toLowerCase().includes(q)
      );
    }
    
    return items;
  }, [ledgerItems, ledgerSearch, ledgerCategoryFilter]);

  const itemsPerPage = 8;
  const totalLedgerPages = Math.ceil(filteredLedger.length / itemsPerPage) || 1;
  const paginatedLedger = useMemo(() => {
    const start = (ledgerPage - 1) * itemsPerPage;
    return filteredLedger.slice(start, start + itemsPerPage);
  }, [filteredLedger, ledgerPage]);

  // Reset page when search/filter changes
  useEffect(() => {
    setLedgerPage(1);
  }, [ledgerSearch, ledgerCategoryFilter]);

  // ── Coordinates and Mapping Logic for the Orbital Map ──
  const mapData = useMemo(() => {
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    
    const r1 = Math.min(dimensions.width, dimensions.height) * 0.22;
    const r2 = Math.min(dimensions.width, dimensions.height) * 0.42;

    const categories = [
      { id: 'pii', label: 'Identity / PII', icon: User, angle: -Math.PI / 2, color: 'var(--color-risk-high)' },
      { id: 'fingerprint', label: 'Device Blueprint', icon: Fingerprint, angle: 0, color: 'var(--color-accent)' },
      { id: 'behavior', label: 'User Behavior', icon: MousePointer, angle: Math.PI / 2, color: 'var(--color-risk-medium)' },
      { id: 'marketing', label: 'Campaign Tracker', icon: Tag, angle: Math.PI, color: 'var(--color-risk-low)' }
    ].map(cat => ({
      ...cat,
      x: cx + r1 * Math.cos(cat.angle),
      y: cy + r1 * Math.sin(cat.angle),
      type: 'category'
    }));

    const companyKeys = Object.keys(profile.companies)
      .sort((a, b) => profile.companies[b].count - profile.companies[a].count)
      .slice(0, 10);
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
        color: 'text-riskHigh border-riskHigh/20 bg-riskHigh/5',
        severity: 4
      };
    }
    if (isHighFp) {
      return {
        title: 'Uniquely Fingerprinted Client',
        desc: 'Advanced canvas and WebGL queries have compiled a mathematical identifier that recognizes your device across browser sessions.',
        alert: 'HIGH ALERT',
        color: 'text-accent border-accent/20 bg-accent-soft',
        severity: 3
      };
    }
    if (isHighBeh) {
      return {
        title: 'Behaviorally Diagnosed Target',
        desc: 'Scripts are recording scrolling depths, focus changes, and micro-clicks to reconstruct your digital patterns.',
        alert: 'MEDIUM RISK',
        color: 'text-riskMedium border-riskMedium/20 bg-riskMedium/5',
        severity: 2
      };
    }
    return {
      title: 'Monitored Guest',
      desc: 'Telemetry and advertising click queries are tracing navigation referrals and UTM sources.',
      alert: 'MONITORED',
      color: 'text-riskLow border-riskLow/20 bg-riskLow/5',
      severity: 1
    };
  }, [profile]);

  // Selection detail box
  const selectedDetails = useMemo(() => {
    const node = selectedNode;
    if (!node) return null;

    if (node.type === 'category') {
      const catData = profile[node.id];
      if (!catData) return null;
      const categoryLabel = mapData.categories.find(c => c.id === node.id)?.label || '';
      const uniqueKeys = Object.keys(catData.keys);
      const connectedCompanies = Object.values(profile.companies)
        .filter(c => c[node.id] && c[node.id].size > 0)
        .map(c => c.name);
      return {
        title: categoryLabel,
        subtitle: 'Telemetry Classification',
        stats: `${catData.count} Intercepts (${uniqueKeys.length} Unique Parameters)`,
        keys: uniqueKeys.slice(0, 8),
        companies: connectedCompanies,
        type: 'category'
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
        sites: compData.sites ? Array.from(compData.sites) : [],
        keys: [
          ...Array.from(compData.pii),
          ...Array.from(compData.fingerprint),
          ...Array.from(compData.behavior),
          ...Array.from(compData.marketing)
        ].slice(0, 10),
        type: 'company'
      };
    }

    return null;
  }, [selectedNode, hoveredNode, profile, mapData]);

  // Safe helper to check if company has a category
  const companyHasCategory = useCallback((companyId, categoryId) => {
    const comp = profile.companies[companyId];
    if (!comp) return false;
    const catSet = comp[categoryId];
    if (!catSet || typeof catSet.size !== 'number') return false;
    return catSet.size > 0;
  }, [profile]);

  // Is node highlighted helper — FIXED optional chaining
  const getNodeOpacity = useCallback((node) => {
    const target = hoveredNode || selectedNode;
    if (!target) return 1.0;

    if (target.type === 'center') return 1.0;

    if (target.type === 'category') {
      if (node.id === target.id) return 1.0;
      if (node.type === 'company' && companyHasCategory(node.id, target.id)) return 1.0;
      if (node.type === 'category') return 0.12;
      return 0.12;
    }

    if (target.type === 'company') {
      if (node.id === target.id) return 1.0;
      if (node.id === 'center') return 1.0;
      if (node.type === 'category' && companyHasCategory(target.id, node.id)) return 1.0;
      return 0.12;
    }

    return 1.0;
  }, [hoveredNode, selectedNode, companyHasCategory]);

  const getLinkOpacity = useCallback((link) => {
    const target = hoveredNode || selectedNode;
    if (!target) return 0.22;

    if (target.type === 'center') return 0.5;

    if (target.type === 'category') {
      return link.target.id === target.id ? 0.85 : 0.02;
    }
    if (target.type === 'company') {
      return link.source.id === target.id ? 0.85 : 0.02;
    }
    return 0.22;
  }, [hoveredNode, selectedNode]);

  // Handle node interaction
  const handleNodeHover = useCallback((node, event) => {
    setHoveredNode(node);
    if (event && node) {
      const svgRect = containerRef.current?.getBoundingClientRect();
      if (svgRect) {
        setTooltipPos({
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top
        });
      }
    } else {
      setTooltipPos(null);
    }
  }, []);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(prev => {
      if (prev?.type === node.type && prev?.id === node.id) return null;
      return node;
    });
  }, []);

  // Threat score computation
  const threatScore = useMemo(() => {
    let score = 0;
    score += Math.min(profile.pii.count * 5, 40);
    score += Math.min(profile.fingerprint.count * 2, 30);
    score += Math.min(profile.behavior.count * 3, 20);
    score += Math.min(profile.marketing.count * 1, 10);
    return Math.min(score, 100);
  }, [profile]);

  // Company stats
  const companyCount = Object.keys(profile.companies).length;
  const totalInterceptions = profile.pii.count + profile.fingerprint.count + profile.behavior.count + profile.marketing.count;

  // Category distribution for mini chart
  const categoryDistribution = useMemo(() => {
    const total = totalInterceptions || 1;
    return [
      { id: 'pii', label: 'PII', count: profile.pii.count, pct: Math.round((profile.pii.count / total) * 100), color: 'var(--color-risk-high)' },
      { id: 'fingerprint', label: 'Fingerprint', count: profile.fingerprint.count, pct: Math.round((profile.fingerprint.count / total) * 100), color: 'var(--color-accent)' },
      { id: 'behavior', label: 'Behavior', count: profile.behavior.count, pct: Math.round((profile.behavior.count / total) * 100), color: 'var(--color-risk-medium)' },
      { id: 'marketing', label: 'Campaign', count: profile.marketing.count, pct: Math.round((profile.marketing.count / total) * 100), color: 'var(--color-risk-low)' },
    ];
  }, [profile, totalInterceptions]);

  return (
    <main className="flex-1 p-5 md:p-6 space-y-6 overflow-y-auto scrollbar animate-fade-in">
      {/* Header */}
      <header className="acrylic-panel px-6 py-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-label tracking-wider">Surveillance Mapping</p>
          <h1 className="text-[22px] font-display font-bold text-text mt-1 tracking-tight">Identity Shadow Profile</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 border border-accent/20 bg-accent-soft px-3 py-1.5 rounded-lg text-accent text-[11px] font-mono">
            <Layers size={13} />
            {companyCount} ENTITIES TRACKING
          </div>
          <div className="flex items-center gap-2 border border-danger/20 bg-danger/5 px-3 py-1.5 rounded-lg text-riskHigh text-[11px] font-mono">
            <ShieldAlert size={14} className="animate-pulse" />
            {ledgerItems.length} LEAKED VECTORS DETECTED
          </div>
        </div>
      </header>

      {/* Main Graph + Bento Dossier Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1.1fr] gap-6">
        
        {/* Radar Orbit Map */}
        <section className="acrylic-panel p-5 relative overflow-hidden flex flex-col justify-between min-w-0" style={{ minHeight: '520px' }}>
          <div className="px-1 pb-4 border-b border-border flex flex-wrap items-center justify-between z-10 gap-2">
            <div>
              <p className="section-label text-text">Shadow Profile Radar</p>
              <p className="text-[11.5px] text-muted mt-0.5">Interactive concentric orbits showing corporations draining raw parameters.</p>
            </div>
            <span className="text-[10px] text-accent border border-accent/20 bg-accent-soft px-2.5 py-1 rounded font-mono font-medium whitespace-nowrap">
              {(hoveredNode || selectedNode) 
                ? `AUDITING: ${(hoveredNode || selectedNode).id === 'center' ? 'YOUR PROFILE' : (hoveredNode || selectedNode).id.toUpperCase()}`
                : 'HOVER OR CLICK NODES TO EXPLORE'
              }
            </span>
          </div>

          <div ref={containerRef} className="flex-1 relative" style={{ minHeight: '380px' }}>
            {/* Ambient Sonar sweep mesh */}
            <div className="mesh-bg" />

            <svg className="w-full h-full select-none" style={{ minHeight: '380px' }}>
              <defs>
                {/* Sonar pulse animation via SVG animate */}
                <radialGradient id="sonar-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--color-risk-low)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-risk-low)" stopOpacity="0" />
                </radialGradient>
                
                {/* Glow filter for active nodes */}
                <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Concentric Guide Rings */}
              <circle cx={mapData.cx} cy={mapData.cy} r={mapData.r1} fill="none" stroke="var(--color-border)" strokeWidth="0.8" strokeDasharray="4,6" opacity="0.6" />
              <circle cx={mapData.cx} cy={mapData.cy} r={mapData.r2} fill="none" stroke="var(--color-border)" strokeWidth="0.8" strokeDasharray="3,8" opacity="0.4" />
              
              {/* Additional subtle mid ring */}
              <circle cx={mapData.cx} cy={mapData.cy} r={(mapData.r1 + mapData.r2) / 2} fill="none" stroke="var(--color-border)" strokeWidth="0.4" strokeDasharray="2,10" opacity="0.2" />

              {/* Connecting Lines from companies to categories */}
              {mapData.links.map(link => {
                const opacity = getLinkOpacity(link);
                const dx = link.target.x - link.source.x;
                const dy = link.target.y - link.source.y;
                const mx = (link.source.x + link.target.x) / 2;
                const my = (link.source.y + link.target.y) / 2;
                const curveFactor = 0.1;
                const curve = `M${link.source.x},${link.source.y} Q${mx - dy * curveFactor},${my + dx * curveFactor} ${link.target.x},${link.target.y}`;
                return (
                  <path
                    key={link.id}
                    d={curve}
                    fill="none"
                    stroke={link.color}
                    strokeWidth={opacity > 0.3 ? 2.5 : 1.2}
                    strokeOpacity={opacity}
                    style={{ transition: 'stroke-opacity 200ms ease, stroke-width 200ms ease' }}
                  />
                );
              })}

              {/* Connecting from categories to central 'You' node */}
              {mapData.categories.map(cat => {
                const active = hoveredNode || selectedNode;
                let opacity = 0.3;
                if (active) {
                  if (active.id === cat.id) {
                    opacity = 0.9;
                  } else if (active.type === 'company' && companyHasCategory(active.id, cat.id)) {
                    opacity = 0.9;
                  } else if (active.type === 'center') {
                    opacity = 0.6;
                  } else {
                    opacity = 0.03;
                  }
                }
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
                    style={{ transition: 'stroke-opacity 200ms ease, stroke-width 200ms ease' }}
                  />
                );
              })}

              {/* Central 'You' Node */}
              <g 
                transform={`translate(${mapData.cx}, ${mapData.cy})`}
                onMouseEnter={(e) => handleNodeHover({ type: 'center', id: 'center' }, e)}
                onMouseLeave={() => handleNodeHover(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Sonar Pulse - uses SVG animate instead of CSS animate-ping to avoid blinking */}
                <circle r="26" fill="none" stroke="var(--color-risk-low)" strokeWidth="1" opacity="0">
                  <animate attributeName="r" from="18" to="35" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle r="22" fill="none" stroke="var(--color-risk-low)" strokeWidth="0.5" opacity="0">
                  <animate attributeName="r" from="18" to="30" dur="3s" begin="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="3s" begin="1.5s" repeatCount="indefinite" />
                </circle>
                <circle r="18" fill="var(--color-bg)" stroke="var(--color-risk-low)" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 8px var(--color-success))' }} />
                <text textAnchor="middle" dy="0.31em" fontSize="9px" fontFamily="JetBrains Mono" fontWeight="700" fill="var(--color-success)">YOU</text>
              </g>

              {/* Inner Categories Nodes */}
              {mapData.categories.map(cat => {
                const opacity = getNodeOpacity(cat);
                const isActive = selectedNode?.type === 'category' && selectedNode.id === cat.id;
                const isHovered = hoveredNode?.type === 'category' && hoveredNode.id === cat.id;
                const catCount = profile[cat.id]?.count || 0;
                return (
                  <g
                    key={cat.id}
                    transform={`translate(${cat.x}, ${cat.y})`}
                    style={{ cursor: 'pointer', transition: 'opacity 200ms ease' }}
                    opacity={opacity}
                    onMouseEnter={(e) => handleNodeHover({ type: 'category', id: cat.id }, e)}
                    onMouseLeave={() => handleNodeHover(null)}
                    onClick={() => handleNodeClick({ type: 'category', id: cat.id })}
                  >
                    {/* Active ring */}
                    {isActive && (
                      <circle r="20" fill="none" stroke={cat.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle 
                      r={isActive ? 16 : isHovered ? 15 : 14} 
                      fill="var(--color-surface-2)" 
                      stroke={cat.color} 
                      strokeWidth={isActive ? 2.5 : 1.5}
                      style={{ transition: 'r 200ms ease, stroke-width 200ms ease' }}
                    />
                    {/* Category Icon */}
                    {(() => {
                      const Icon = cat.icon;
                      const size = isActive ? 16 : isHovered ? 15 : 14;
                      const iconSize = size - 2;
                      return (
                        <Icon 
                          size={iconSize} 
                          x={-iconSize / 2} 
                          y={-iconSize / 2} 
                          stroke={cat.color}
                          strokeWidth={2}
                          fill="none"
                        />
                      );
                    })()}
                    {/* Count badge */}
                    {catCount > 0 && (
                      <>
                        <circle cx="10" cy="-10" r="8" fill={cat.color} />
                        <text x="10" y="-10" textAnchor="middle" dy="0.35em" fontSize="7px" fontFamily="JetBrains Mono" fontWeight="700" fill="var(--color-bg)">{catCount > 99 ? '99+' : catCount}</text>
                      </>
                    )}
                    <text
                      textAnchor="middle"
                      dy={26}
                      fontSize="9.5px"
                      fontFamily="Outfit"
                      fontWeight={isActive ? '700' : '600'}
                      fill={isActive ? cat.color : 'var(--color-text)'}
                      style={{ transition: 'fill 200ms ease' }}
                    >
                      {cat.label}
                    </text>
                  </g>
                );
              })}

              {/* Outer Companies Nodes */}
              {mapData.companiesNodes.map(comp => {
                const opacity = getNodeOpacity(comp);
                const isActive = selectedNode?.type === 'company' && selectedNode.id === comp.id;
                const isHovered = hoveredNode?.type === 'company' && hoveredNode.id === comp.id;
                return (
                  <g
                    key={comp.id}
                    transform={`translate(${comp.x}, ${comp.y})`}
                    style={{ cursor: 'pointer', transition: 'opacity 200ms ease' }}
                    opacity={opacity}
                    onMouseEnter={(e) => handleNodeHover({ type: 'company', id: comp.id }, e)}
                    onMouseLeave={() => handleNodeHover(null)}
                    onClick={() => handleNodeClick({ type: 'company', id: comp.id })}
                  >
                    {/* Selection ring */}
                    {isActive && (
                      <circle r="15" fill="none" stroke={riskAccent(comp.risk)} strokeWidth="1" strokeDasharray="2,4" opacity="0.6">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle 
                      r={isActive ? 10 : isHovered ? 9 : 8} 
                      fill={riskAccent(comp.risk)} 
                      stroke={riskAccent(comp.risk)} 
                      strokeOpacity="0.4" 
                      strokeWidth="3" 
                      style={{ transition: 'r 200ms ease' }}
                    />
                    {/* Risk indicator dot */}
                    {comp.risk === 'high' && (
                      <circle cx="0" cy="0" r="3" fill="var(--color-bg)" opacity="0.8" />
                    )}
                    <text
                      textAnchor={comp.x > mapData.cx ? 'start' : 'end'}
                      dx={comp.x > mapData.cx ? 14 : -14}
                      dy="0.31em"
                      fontSize="10px"
                      fontFamily="Outfit"
                      fontWeight={isActive ? '700' : '500'}
                      fill={isActive || isHovered ? 'var(--color-accent)' : 'var(--color-secondary)'}
                      style={{ transition: 'fill 200ms ease' }}
                    >
                      {comp.label.length > 18 ? comp.label.substring(0, 16) + '…' : comp.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {tooltipPos && hoveredNode && hoveredNode.type !== 'center' && !selectedNode && (
              <div 
                className="absolute pointer-events-none z-20 bg-surface-1 border border-border p-2.5 rounded-lg shadow-xl text-[11px] min-w-[140px] max-w-[200px] animate-scale-in"
                style={{
                  left: `${Math.min(tooltipPos.x + 16, dimensions.width - 200)}px`,
                  top: `${Math.max(tooltipPos.y - 40, 10)}px`
                }}
              >
                <div className="font-display font-semibold text-text text-[12px] mb-1">
                  {hoveredNode.id}
                </div>
                <div className="text-[10px] text-muted font-mono uppercase tracking-wider">
                  {hoveredNode.type === 'category' ? 'Data Category' : 'Tracker Entity'}
                </div>
                <div className="text-[10px] text-secondary mt-1">Click to inspect</div>
              </div>
            )}
          </div>
        </section>

        {/* Shadow Profile Bento Card */}
        <section className="space-y-5 min-w-0">
          {/* Persona Card */}
          <div className="acrylic-panel p-5 space-y-4">
            <div className="pb-3 border-b border-border flex items-center justify-between">
              <div>
                <p className="section-label">Shadow Persona</p>
                <h3 className="text-[16px] font-display font-bold text-text mt-1">Reconstructed Dossier</h3>
              </div>
              {/* Threat Score */}
              <div className="flex flex-col items-center">
                <div className="relative w-11 h-11">
                  <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-surface-3)" strokeWidth="3" />
                    <circle 
                      cx="20" cy="20" r="16" fill="none" 
                      stroke={threatScore > 70 ? 'var(--color-risk-high)' : threatScore > 40 ? 'var(--color-risk-medium)' : 'var(--color-risk-low)'}
                      strokeWidth="3" 
                      strokeDasharray={`${(threatScore / 100) * 100.53} 100.53`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-text">{threatScore}</span>
                </div>
                <span className="text-[8px] font-mono text-muted uppercase tracking-wider mt-0.5">Risk</span>
              </div>
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
              {[
                { label: 'PII Parameters Leaked:', value: profile.pii.count, colorClass: profile.pii.count > 0 ? 'text-riskHigh' : 'text-secondary', color: 'var(--color-risk-high)' },
                { label: 'Leaked Fingerprint Hashes:', value: profile.fingerprint.count, colorClass: 'text-accent', color: 'var(--color-accent)' },
                { label: 'Recorded Scroll & Keystrokes:', value: profile.behavior.count, colorClass: 'text-riskMedium', color: 'var(--color-risk-medium)' },
                { label: 'Leaked Click/Ad Campaigns:', value: profile.marketing.count, colorClass: 'text-riskLow', color: 'var(--color-risk-low)' }
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center text-[12px] py-1.5 border-b border-border/40">
                  <span className="text-secondary font-medium">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-surface-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${Math.min((row.value / Math.max(totalInterceptions, 1)) * 100, 100)}%`, 
                          backgroundColor: row.color 
                        }} 
                      />
                    </div>
                    <span className={`font-mono font-bold ${row.colorClass} tabular-nums min-w-[28px] text-right`}>{row.value}</span>
                  </div>
                </div>
              ))}
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
                  
                  {selectedDetails.sites && selectedDetails.sites.length > 0 && (
                    <div className="mt-2 mb-2">
                      <span className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-1">Active on Sites:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedDetails.sites.slice(0, 4).map(s => (
                          <span key={s} className="text-[9.5px] bg-surface-2 border border-border px-1.5 py-0.5 rounded font-mono text-secondary truncate max-w-[120px]">{s}</span>
                        ))}
                        {selectedDetails.sites.length > 4 && (
                          <span className="text-[9.5px] text-muted font-mono">+{selectedDetails.sites.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}

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
                          <code key={k} className="text-[10px] bg-surface-2 border border-border px-1.5 py-0.5 rounded font-mono text-secondary break-all max-w-full">{k}</code>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDetails.companies && selectedDetails.companies.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Connected Entities:</span>
                      <div className="flex flex-wrap gap-1 max-h-[50px] overflow-y-auto scrollbar">
                        {selectedDetails.companies.slice(0, 6).map(c => (
                          <span key={c} className="text-[9.5px] bg-accent-soft border border-accent/15 px-1.5 py-0.5 rounded font-medium text-accent">{c}</span>
                        ))}
                        {selectedDetails.companies.length > 6 && (
                          <span className="text-[9.5px] text-muted font-mono">+{selectedDetails.companies.length - 6} more</span>
                        )}
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
                  Click a tracker company node or a data category bubble to audit leaking nodes.
                </p>
              </div>
            )}
            
            {selectedNode && (
              <button 
                type="button" 
                onClick={() => setSelectedNode(null)}
                className="w-full text-center text-[10.5px] font-mono text-muted hover:text-text border-t border-border/40 pt-2.5 mt-4 transition-colors flex items-center justify-center gap-1.5"
              >
                <X size={10} />
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
                  <span className="truncate">{val}</span>
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
                  <span className="truncate mr-2">{val.split('(')[0]}</span>
                  <span className="text-[10px] text-accent border border-accent/20 bg-accent-soft px-1.5 py-0.5 rounded shrink-0">Queried</span>
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
                  <span className="truncate">{val}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted leading-relaxed">No external marketing refers or UTM campaign queries tracked.</p>
            )}
          </div>
        </div>

      </div>

      {/* Category Distribution Summary */}
      <div className="acrylic-panel p-5">
        <div className="pb-3 border-b border-border mb-4">
          <p className="section-label text-text">Data Classification Breakdown</p>
          <p className="text-[11px] text-muted mt-0.5">Proportional distribution of intercepted telemetry across classification categories.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryDistribution.map(cat => (
            <div key={cat.id} className="flex flex-col gap-2 p-3 bg-surface-2/30 border border-border/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-display font-semibold text-text">{cat.label}</span>
                <span className="font-mono text-[13px] font-bold tabular-nums" style={{ color: cat.color }}>{cat.count}</span>
              </div>
              <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} 
                />
              </div>
              <span className="text-[9px] font-mono text-muted tabular-nums">{cat.pct}% of total</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <section className="acrylic-panel p-5 space-y-4">
        <div className="pb-3 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="section-label text-text">Data Parameter Ledger</p>
            <p className="text-[11px] text-muted mt-0.5">Raw parameter scan ledger matching telemetry packets to recipients.</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'pii', label: 'PII', color: 'var(--color-risk-high)' },
                { id: 'fingerprint', label: 'FP', color: 'var(--color-accent)' },
                { id: 'behavior', label: 'BEH', color: 'var(--color-risk-medium)' },
                { id: 'marketing', label: 'MKT', color: 'var(--color-risk-low)' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setLedgerCategoryFilter(f.id)}
                  className={`text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-all ${
                    ledgerCategoryFilter === f.id 
                      ? 'bg-accent-soft border-accent/30 text-accent font-bold'
                      : 'bg-surface-2 border-border text-muted hover:text-text hover:border-border-hover'
                  }`}
                  style={ledgerCategoryFilter === f.id && f.color ? { color: f.color, borderColor: `${f.color}40` } : {}}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 focus-within:border-accent-solid min-w-[200px]">
              <Search size={14} className="text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Search parameters, companies..."
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                className="flex-1 bg-transparent text-[12px] text-text placeholder:text-muted outline-none border-none"
              />
              {ledgerSearch && (
                <button type="button" onClick={() => setLedgerSearch('')} className="text-muted hover:text-text transition-colors">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredLedger.length === 0 ? (
          <div className="py-12 text-center text-muted font-mono text-[12px]">
            No matching data parameter packets.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto scrollbar">
              <table className="w-full text-left border-collapse" style={{ minWidth: '700px' }}>
                <thead>
                  <tr className="border-b border-border text-[10px] font-mono text-muted uppercase tracking-wider">
                    <th className="pb-2.5 pr-3 font-semibold whitespace-nowrap">Parameter Key</th>
                    <th className="pb-2.5 pr-3 font-semibold whitespace-nowrap">Value</th>
                    <th className="pb-2.5 pr-3 font-semibold whitespace-nowrap">Classification</th>
                    <th className="pb-2.5 pr-3 font-semibold whitespace-nowrap">Recipient Entity</th>
                    <th className="pb-2.5 pr-3 font-semibold whitespace-nowrap">Origin Site</th>
                    <th className="pb-2.5 font-semibold whitespace-nowrap">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-sans text-[12px]">
                  {paginatedLedger.map(item => {
                    let catColor = 'text-secondary';
                    let catLabel = item.category;
                    let catDot = 'var(--color-secondary)';
                    if (item.category === 'pii') { catColor = 'text-riskHigh font-semibold'; catLabel = 'PII'; catDot = 'var(--color-risk-high)'; }
                    if (item.category === 'fingerprint') { catColor = 'text-accent font-semibold'; catLabel = 'Fingerprint'; catDot = 'var(--color-accent)'; }
                    if (item.category === 'behavior') { catColor = 'text-riskMedium font-semibold'; catLabel = 'Behavior'; catDot = 'var(--color-risk-medium)'; }
                    if (item.category === 'marketing') { catColor = 'text-riskLow font-semibold'; catLabel = 'Campaign'; catDot = 'var(--color-risk-low)'; }

                    return (
                      <tr key={item.id} className="hover:bg-surface-2/20 transition-colors">
                        <td className="py-3 pr-3 font-mono text-[11px] text-text font-medium select-all whitespace-nowrap">{item.key}</td>
                        <td className="py-3 pr-3 max-w-[200px] truncate font-mono text-[10.5px] text-secondary select-all" title={item.value}>{item.value}</td>
                        <td className={`py-3 pr-3 text-[10.5px] whitespace-nowrap`}>
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: catDot }} />
                            <span className={catColor}>{catLabel}</span>
                          </span>
                        </td>
                        <td className="py-3 pr-3 font-medium text-text whitespace-nowrap">{item.company}</td>
                        <td className="py-3 pr-3 text-secondary whitespace-nowrap max-w-[150px] truncate">{item.site}</td>
                        <td className="py-3 font-mono text-[10.5px] text-muted whitespace-nowrap">{item.timestamp.toLocaleTimeString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalLedgerPages > 1 && (
              <div className="flex flex-wrap items-center justify-between border-t border-border/40 pt-4 text-[11px] font-mono gap-2">
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
