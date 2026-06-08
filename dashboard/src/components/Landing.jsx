import { useNavigate } from 'react-router-dom';
import { 
  Github, Shield, Network, Lock, ArrowRight, Eye, Fingerprint, 
  Layers, Database, Cpu, MousePointer, Tag, 
  ShieldAlert, BarChart3, Zap, Activity, Globe
} from 'lucide-react';
import BrandIcon from './BrandIcon';
import BrandLogo from './BrandLogo';

const GITHUB_URL = 'https://github.com/Ns81000/Exposed';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-bg text-text min-h-screen flex flex-col relative overflow-hidden font-sans">
      {/* Subtle ambient background */}
      <div className="mesh-bg" />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border px-6 py-3.5 transition-all duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandIcon size={30} showBackground={true} bgFill="rgba(94, 106, 210, 0.08)" />
            <h1 className="text-[18px] tracking-tight text-text">
              <BrandLogo />
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-1 text-[13px] text-secondary hover:text-text hover:bg-surface-2 transition-all duration-150 font-medium"
            >
              <Github size={14} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 px-6 py-28 flex items-center justify-center relative">
        <div className="max-w-3xl mx-auto text-center z-10">
          {/* Centered Brand Emblem */}
          <div className="flex flex-col items-center gap-3.5 mb-8 animate-fade-in">
            <div className="relative group cursor-default">
              {/* Subtle ambient glow behind the icon */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-accent/35 to-accent/5 rounded-2xl blur-xl opacity-60 group-hover:opacity-95 transition duration-500" />
              {/* The glassmorphic outer container */}
              <div className="relative flex items-center justify-center p-3.5 rounded-2xl bg-surface-1/90 border border-border/80 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:border-accent/40 group-hover:scale-105">
                <BrandIcon size={48} showBackground={false} />
              </div>
            </div>
            {/* Brand Wordmark */}
            <div className="flex items-center gap-2 mt-1">
              <BrandLogo className="text-[20px]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-surface-1 text-[11px] text-secondary font-semibold tracking-wider uppercase rounded-full mb-8 animate-fade-in delay-100">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
            Local-first · Open source
          </div>
          
          <h2 className="text-[36px] md:text-[52px] font-display font-bold leading-[1.1] mb-6 text-text tracking-tight animate-fade-in delay-200">
            They watch you.<br />
            <span className="text-accent">Now watch them.</span>
          </h2>
          
          <p className="text-[16px] text-secondary leading-relaxed mb-10 max-w-2xl mx-auto font-normal animate-fade-in delay-300">
            See every tracker on every website. Understand who is watching, what they collect, and why it matters — all without leaving your browser.
          </p>
          
          <div className="flex items-center justify-center gap-4 animate-fade-in delay-400">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-7 py-3 text-[14px] bg-[#f7f8f8] text-[#010102] font-semibold rounded-full hover:bg-[#e2e8f0] transition-all duration-150 flex items-center gap-1.5 shadow-lg shadow-white/5"
            >
              Open Dashboard
              <ArrowRight size={16} className="ml-0.5" />
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3 text-[14px] border border-border bg-surface-1 hover:bg-surface-2 text-text font-medium rounded-full transition-all duration-150 flex items-center gap-1.5"
            >
              <Github size={16} />
              Source Code
            </a>
          </div>
        </div>
      </section>

      {/* Advanced Capabilities Grid - Immersive Feature Showcase */}
      <section className="px-6 py-24 border-t border-border relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4 tracking-widest">Intelligence Capabilities</p>
            <h3 className="text-[32px] font-display font-bold text-text tracking-tight">
              Deep Surveillance<br />Analysis Platform
            </h3>
          </div>

          {/* Primary Features - Large Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* D3 Network Visualization */}
            <div className="acrylic-panel p-8 relative overflow-hidden group animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Network size={24} className="text-accent" />
                </div>
                <h4 className="text-[18px] font-display font-bold text-text mb-3">Force-Directed Network Graph</h4>
                <p className="text-[14px] text-secondary leading-relaxed mb-4">
                  Interactive D3.js visualization mapping tracker relationships. Drag nodes, zoom, and explore surveillance networks connecting companies to your browsing sessions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-1 rounded bg-surface-2 border border-border text-muted font-mono">D3.js Physics</span>
                  <span className="text-[10px] px-2 py-1 rounded bg-surface-2 border border-border text-muted font-mono">Real-time Updates</span>
                  <span className="text-[10px] px-2 py-1 rounded bg-surface-2 border border-border text-muted font-mono">Risk Coloring</span>
                </div>
              </div>
            </div>

            {/* DNS CNAME Unmasking */}
            <div className="acrylic-panel p-8 relative overflow-hidden group animate-fade-in delay-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-riskHigh/5 rounded-full blur-3xl group-hover:bg-riskHigh/10 transition-all duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-riskHigh/10 border border-riskHigh/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Eye size={24} className="text-riskHigh" />
                </div>
                <h4 className="text-[18px] font-display font-bold text-text mb-3">DNS-over-HTTPS CNAME De-cloaking</h4>
                <p className="text-[14px] text-secondary leading-relaxed mb-4">
                  Unmasks trackers hiding behind first-party subdomains using Cloudflare's secure DoH API. Exposes <code className="text-accent font-mono text-[13px] bg-accent-soft px-1.5 py-0.5 rounded">analytics.site.com → metrics.adobe.com</code> cloaking attempts.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-1 rounded bg-surface-2 border border-border text-muted font-mono">Cloudflare DoH</span>
                  <span className="text-[10px] px-2 py-1 rounded bg-surface-2 border border-border text-muted font-mono">CNAME Resolution</span>
                  <span className="text-[10px] px-2 py-1 rounded bg-surface-2 border border-border text-muted font-mono">Evasion Detection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Features - Compact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Fingerprint,
                title: 'Browser Fingerprinting Detection',
                desc: 'Traps Canvas, WebGL, Audio API, and WebRTC profiling attempts with JavaScript call stack traces.',
                color: 'accent',
                tags: ['Canvas', 'WebGL', 'Audio API']
              },
              {
                icon: ShieldAlert,
                title: 'Dynamic Blocker Shield',
                desc: 'Opt-in high-performance blocking using declarativeNetRequest API with 50k+ tracker domains.',
                color: 'success',
                tags: ['50k+ Domains', 'MV3 API', 'Real-time']
              },
              {
                icon: BarChart3,
                title: 'Threat Analytics Dashboard',
                desc: 'Cross-site contamination maps, bandwidth leak timelines, and exfiltration vector classification.',
                color: 'riskMedium',
                tags: ['Bipartite Graph', 'Timeline', 'PII Analysis']
              },
              {
                icon: Database,
                title: 'Identity Shadow Profiling',
                desc: 'Reconstructs your digital persona by parsing PII, device fingerprints, and behavioral telemetry.',
                color: 'riskHigh',
                tags: ['Orbital Map', 'Parameter Parse', 'Live Ledger']
              }
            ].map((feature, i) => (
              <div 
                key={feature.title} 
                className="acrylic-panel p-6 flex flex-col group hover:border-accent/30 transition-all duration-300 animate-fade-in-up" 
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg bg-${feature.color}/10 border border-${feature.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon size={18} className={`text-${feature.color}`} />
                </div>
                <h4 className="text-[15px] font-display font-semibold text-text mb-2">{feature.title}</h4>
                <p className="text-[12px] text-secondary leading-relaxed mb-3 flex-1">{feature.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {feature.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-2 text-muted font-mono uppercase tracking-wide">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Deep Dive */}
      <section className="px-6 py-24 border-t border-border relative bg-surface-1/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4 tracking-widest">Deep Intelligence</p>
            <h3 className="text-[32px] font-display font-bold text-text tracking-tight">
              Beyond Blocking —<br />Understanding Surveillance
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payload Decryption */}
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center">
                <Database size={26} className="text-accent" />
              </div>
              <h4 className="text-[20px] font-display font-bold text-text">Real-Time Payload Inspection</h4>
              <p className="text-[14px] text-secondary leading-relaxed">
                Decodes query parameters and POST body JSON in real-time. Formats exfiltrated tracking IDs, device dimensions, and session tokens into searchable key-value grids.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Zap size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-secondary">Parses URL queries, JSON payloads, and NDJSON envelopes</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-secondary">Classifies PII, fingerprints, behavior tracking, and marketing params</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-secondary">Live searchable ledger with 2,800+ intercepted vectors</p>
                </div>
              </div>
            </div>

            {/* Privacy Scoring */}
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-success/20 to-success/5 border border-success/30 flex items-center justify-center">
                <Shield size={26} className="text-success" />
              </div>
              <h4 className="text-[20px] font-display font-bold text-text">Privacy Scoring Engine</h4>
              <p className="text-[14px] text-secondary leading-relaxed">
                Evaluates sites with algorithmic scoring. Starts at 100 points, deducts based on tracker risk levels and fingerprinting attempts. Grades: A–F scale.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Shield size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-secondary">High-risk trackers: <span className="text-riskHigh font-semibold">-15 pts</span>, Medium: <span className="text-riskMedium font-semibold">-5 pts</span></p>
                </div>
                <div className="flex items-start gap-2">
                  <Shield size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-secondary">Active fingerprinting: <span className="text-riskHigh font-semibold">-25 pts penalty</span></p>
                </div>
                <div className="flex items-start gap-2">
                  <Shield size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-secondary">Blocked trackers carry minimal penalties (shield protection bonus)</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Three Dashboard Views Showcase */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4 tracking-widest">Multi-Perspective Intelligence</p>
            <h3 className="text-[32px] font-display font-bold text-text tracking-tight">
              Three Specialized Views
            </h3>
            <p className="text-[15px] text-secondary mt-3 max-w-2xl mx-auto">
              Switch between Console, Analytics, and Profile modes to analyze surveillance from different angles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Console View',
                subtitle: 'Real-Time Surveillance Monitoring',
                icon: Activity,
                color: 'accent',
                features: [
                  'Live D3 force-directed network graph',
                  'Chronological visit timeline',
                  'Fingerprint alert panel',
                  'Tracker detail inspector',
                  'Privacy grade scoring'
                ],
                badge: 'Primary View'
              },
              {
                title: 'Threat Analytics',
                subtitle: 'Cross-Site Intelligence',
                icon: BarChart3,
                color: 'riskMedium',
                features: [
                  'Bipartite contamination matrix',
                  'Bandwidth savings timeline',
                  'Exfiltration classification',
                  'Company threat breakdown',
                  'Protection rate metrics'
                ],
                badge: 'Analytics Mode'
              },
              {
                title: 'Shadow Profile',
                subtitle: 'Digital Persona Map',
                icon: Globe,
                color: 'riskHigh',
                features: [
                  'Orbital radar visualization',
                  'Persona reconstruction',
                  'Live telemetry ledger',
                  'Company node inspection',
                  'Searchable leak database'
                ],
                badge: 'Profile View'
              }
            ].map((view, i) => (
              <div key={view.title} className="acrylic-panel p-7 flex flex-col group hover:border-accent/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-${view.color}/10 border border-${view.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <view.icon size={24} className={`text-${view.color}`} />
                  </div>
                  <span className={`inline-block text-[9px] px-2 py-1 rounded-full bg-${view.color}/10 border border-${view.color}/20 text-${view.color} font-mono font-semibold uppercase tracking-wide`}>
                    {view.badge}
                  </span>
                </div>
                <h4 className="text-[18px] font-display font-bold text-text mb-1">{view.title}</h4>
                <p className="text-[12px] text-muted mb-5 font-medium">{view.subtitle}</p>
                <ul className="space-y-2.5 flex-1">
                  {view.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-${view.color}`} />
                      <p className="text-[13px] text-secondary leading-relaxed">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="px-6 py-24 border-t border-border bg-surface-1/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4 tracking-widest">Architecture</p>
            <h3 className="text-[32px] font-display font-bold text-text tracking-tight">
              Enterprise-Grade<br />Privacy Intelligence Stack
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="acrylic-panel p-7">
              <div className="flex items-center gap-3 mb-5">
                <Layers size={20} className="text-accent" />
                <h4 className="text-[17px] font-display font-semibold text-text">Extension Sensor Layer</h4>
              </div>
              <ul className="space-y-3 text-[13px] text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">●</span>
                  <span><strong className="text-text">Manifest V3</strong> service worker with webRequest intercept hooks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">●</span>
                  <span><strong className="text-text">Content script</strong> injecting main-world fingerprint sensors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">●</span>
                  <span><strong className="text-text">50k+ tracker domains</strong> from uBlock Origin filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">●</span>
                  <span><strong className="text-text">Cloudflare DoH</strong> for async CNAME resolution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">●</span>
                  <span><strong className="text-text">chrome.storage.local</strong> live buffer for dashboard sync</span>
                </li>
              </ul>
            </div>

            <div className="acrylic-panel p-7">
              <div className="flex items-center gap-3 mb-5">
                <Cpu size={20} className="text-success" />
                <h4 className="text-[17px] font-display font-semibold text-text">React Dashboard Layer</h4>
              </div>
              <ul className="space-y-3 text-[13px] text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">●</span>
                  <span><strong className="text-text">React 18.3</strong> with Vite 5.4 HMR for instant dev feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">●</span>
                  <span><strong className="text-text">Zustand</strong> global state with Dexie.js IndexedDB persistence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">●</span>
                  <span><strong className="text-text">D3.js 7.9</strong> force simulation with custom physics tuning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">●</span>
                  <span><strong className="text-text">Tailwind CSS 3.4</strong> with custom Linear/Raycast design tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">●</span>
                  <span><strong className="text-text">window.postMessage</strong> bridge for extension ↔ dashboard IPC</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="acrylic-panel p-8">
            <div className="flex items-center gap-3 mb-6">
              <Database size={22} className="text-riskMedium" />
              <h4 className="text-[18px] font-display font-semibold text-text">Local-First Data Architecture</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { table: 'sites', key: 'domain', desc: 'Target hostnames visited' },
                { table: 'visits', key: 'visitId', desc: 'Page session metrics' },
                { table: 'trackerEvents', key: '++id', desc: 'Network intercept logs' },
                { table: 'fingerprintEvents', key: '++id', desc: 'API profiling attempts' },
                { table: 'archives', key: 'date', desc: 'Daily summary snapshots' }
              ].map(item => (
                <div key={item.table} className="border border-border rounded-lg p-4 bg-surface-2/50">
                  <p className="text-[11px] font-mono text-accent mb-1">{item.table}</p>
                  <p className="text-[10px] text-muted mb-2 font-mono">PK: {item.key}</p>
                  <p className="text-[12px] text-secondary leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[13px] text-secondary text-center">
              <strong className="text-text">IndexedDB via Dexie.js</strong> • Auto-archiving • Configurable TTL • Transparent inspection via DevTools
            </p>
          </div>
        </div>
      </section>

      {/* Why Local-First - Enhanced */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-4 tracking-widest">Security First</p>
            <h3 className="text-[32px] font-display font-bold text-text tracking-tight">
              Zero Trust. Zero Cloud.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              {
                icon: Lock,
                title: 'No account needed',
                desc: 'Zero friction. Install and go. No signup, no email, no password.',
                color: 'accent'
              },
              {
                icon: Database,
                title: 'Your data stays yours',
                desc: 'All data stored in IndexedDB on your computer. You control deletion.',
                color: 'success'
              },
              {
                icon: Eye,
                title: 'Auditable',
                desc: 'Open source code. Unpacked extension. Inspect every line.',
                color: 'riskMedium'
              },
              {
                icon: ShieldAlert,
                title: 'No telemetry outbound',
                desc: 'Never logs metrics or reports. No tracking the tracker tracker.',
                color: 'riskLow'
              }
            ].map((item, i) => (
              <div key={item.title} className="acrylic-panel p-6 flex flex-col group hover:border-accent/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${i * 70}ms` }}>
                <div className={`w-11 h-11 rounded-xl bg-${item.color}/10 border border-${item.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon size={20} className={`text-${item.color}`} />
                </div>
                <h4 className="text-[15px] font-display font-semibold text-text mb-2">{item.title}</h4>
                <p className="text-[13px] text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="acrylic-panel p-6 border-accent/20 bg-accent/5">
            <div className="flex items-start gap-4">
              <Shield size={20} className="text-accent mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[15px] font-display font-semibold text-text mb-2">Built for Security Analysts</h4>
                <p className="text-[13px] text-secondary leading-relaxed">
                  Perfect for <strong className="text-text">GDPR/CCPA compliance audits</strong>, behavioral adware analysis, and 
                  documenting tracker behavior as auditable proof.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation - Streamlined */}
      <section className="px-6 py-24 border-t border-border bg-surface-1/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-4 tracking-widest">Get Started</p>
            <h3 className="text-[32px] font-display font-bold text-text tracking-tight">
              Installation
            </h3>
            <p className="text-[15px] text-secondary mt-3 max-w-xl mx-auto">
              Exposed is a local Chrome extension and dashboard. Load it manually from your machine:
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Clone the repository',
                code: `git clone ${GITHUB_URL}.git`,
                color: 'accent'
              },
              {
                step: '2',
                title: 'Install dashboard dependencies',
                code: 'cd dashboard && pnpm install && pnpm build',
                color: 'success'
              },
              {
                step: '3',
                title: 'Load extension in Chrome',
                instructions: [
                  'Open chrome://extensions',
                  'Enable Developer mode (top-right toggle)',
                  'Click "Load unpacked" (top-left button)',
                  'Select the extension/ folder'
                ],
                color: 'riskMedium'
              },
              {
                step: '4',
                title: 'Start the dashboard',
                code: 'cd dashboard && pnpm dev',
                url: 'http://localhost:5173',
                deployUrl: 'https://exposed-dashboard.vercel.app/',
                color: 'riskLow'
              }
            ].map((item, i) => (
              <div key={item.step} className="acrylic-panel p-6 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-${item.color}/10 border border-${item.color}/20 flex items-center justify-center flex-shrink-0 font-display font-bold text-${item.color}`}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] font-display font-semibold text-text mb-3">{item.title}</h4>
                    {item.code && (
                      <div className="p-3.5 bg-surface-2 rounded-lg border border-border font-mono text-[12px] text-accent overflow-x-auto select-all">
                        {item.code}
                      </div>
                    )}
                    {item.instructions && (
                      <ul className="space-y-2">
                        {item.instructions.map((instruction, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[13px] text-secondary">
                            <span className={`text-${item.color} mt-0.5`}>•</span>
                            <span dangerouslySetInnerHTML={{ __html: instruction.replace(/chrome:\/\/extensions/, '<code class="text-accent font-mono bg-accent-soft px-1.5 py-0.5 rounded">chrome://extensions</code>').replace(/Developer mode/, '<strong class="text-text">Developer mode</strong>').replace(/Load unpacked/, '<strong class="text-text">Load unpacked</strong>').replace(/extension\//, '<code class="text-text bg-surface-2 px-1.5 py-0.5 rounded font-mono">extension/</code>') }} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.url && (
                      <div className="mt-3 flex flex-col gap-2">
                        <p className="text-[13px] text-secondary">
                          Visit <span className="text-text font-mono font-medium">{item.url}</span> locally, or use the deployed version:
                        </p>
                        <a 
                          href={item.deployUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[13px] text-accent hover:underline font-medium w-fit"
                        >
                          {item.deployUrl}
                          <ArrowRight size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-7 py-3 text-[14px] bg-[#f7f8f8] text-[#010102] font-semibold rounded-full hover:bg-[#e2e8f0] transition-all duration-150 inline-flex items-center gap-1.5 shadow-lg shadow-white/5"
            >
              Open Dashboard
              <ArrowRight size={16} className="ml-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BrandIcon size={20} showBackground={false} />
              <p className="text-[12px] text-muted font-medium">
                <BrandLogo className="text-[12px]" /> — Local-first surveillance intelligence.
              </p>
            </div>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[12px] text-muted hover:text-text transition-colors duration-150 font-medium"
            >
              <Github size={13} />
              View on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
