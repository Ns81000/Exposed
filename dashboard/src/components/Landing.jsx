import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Github, Eye, Shield, Network, Lock, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const GITHUB_URL = 'https://github.com/Ns81000/Exposed';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-bg text-text min-h-screen flex flex-col relative overflow-hidden font-sans">
      {/* Subtle ambient background */}
      <div className="mesh-bg" />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border px-6 py-3.5 transition-all duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Eye size={17} className="text-white" />
            </div>
            <h1 className="text-[18px] font-display font-semibold tracking-tight text-text">Exposed</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-surface-1 hover:bg-surface-2 hover:text-text text-secondary transition-all duration-150"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-surface-1 text-[11px] text-secondary font-semibold tracking-wider uppercase rounded-full mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
            Local-first · Open source
          </div>
          <h2 className="text-[36px] md:text-[52px] font-display font-bold leading-[1.1] mb-6 text-text tracking-tight animate-fade-in delay-100">
            uBlock hides them.<br />
            <span className="text-accent">Exposed names them.</span>
          </h2>
          <p className="text-[16px] text-secondary leading-relaxed mb-10 max-w-2xl mx-auto font-normal animate-fade-in delay-200">
            See every tracker on every website. Understand who is watching, what they collect, and why it matters — all without leaving your browser.
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-in delay-300">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-accent px-7 py-3 text-[14px]"
            >
              Open Dashboard
              <ArrowRight size={16} className="ml-1" />
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn px-7 py-3 text-[14px]"
            >
              <Github size={16} className="mr-1" />
              Source Code
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 border-t border-border relative">
        <div className="max-w-7xl mx-auto">
          <h3 className="section-label mb-14 text-center tracking-widest">What it does</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Intercepts everything',
                desc: 'Every network request from every page is matched against 120+ known tracker domains from major surveillance companies.'
              },
              {
                icon: Network,
                title: 'Maps the surveillance network',
                desc: 'See which companies own each tracker, their category, and risk level. Understand the full picture of who watches your browsing.'
              },
              {
                icon: Lock,
                title: 'Stays local',
                desc: 'All data lives in your browser. No servers. No account. No cloud. No data ever leaves your machine.'
              }
            ].map((feature, i) => (
              <div key={feature.title} className="acrylic-panel p-7 animate-fade-in-up" style={{ animationDelay: `${200 + i * 80}ms` }}>
                <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center mb-5">
                  <feature.icon size={20} className="text-accent" />
                </div>
                <h4 className="text-[16px] font-display font-semibold text-text mb-2.5">{feature.title}</h4>
                <p className="text-[13px] text-secondary leading-relaxed font-normal">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h3 className="section-label mb-14 text-center tracking-widest">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Install the extension', desc: 'Load the extension from your local folder. It becomes your surveillance sensor.' },
              { step: '02', title: 'Open the dashboard', desc: 'The dashboard syncs in real-time with the extension. Watch the trackers as you browse.' },
              { step: '03', title: 'Understand your exposure', desc: 'Browse the D3 graph, timeline, and tracker details. Export sessions as reports.' }
            ].map((item, i) => (
              <div key={item.step} className="acrylic-panel p-7 flex flex-col gap-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-[28px] font-display font-bold text-muted leading-none">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-[15px] font-display font-semibold text-text mb-2">{item.title}</h4>
                  <p className="text-[13px] text-secondary leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Local-First */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h3 className="section-label mb-12 tracking-widest text-center">Why local-first</h3>
          <div className="space-y-4">
            {[
              {
                title: 'No account needed',
                desc: 'Zero friction. Install and go. No signup, no email, no password. Your data never leaves your machine because there\'s nowhere for it to go.'
              },
              {
                title: 'Your data stays yours',
                desc: 'All tracking data is stored in IndexedDB on your computer. We can\'t see it, hackers can\'t see it, and advertisers definitely can\'t see it. You control the deletion policy.'
              },
              {
                title: 'Auditable',
                desc: 'The source code is open. The extension is unpacked. You can inspect every line, audit the tracker list, verify nothing leaves your browser.'
              }
            ].map((item, i) => (
              <div key={item.title} className="acrylic-panel p-6 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <h4 className="text-[15px] font-display font-semibold text-text mb-2">{item.title}</h4>
                <p className="text-[13px] text-secondary leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h3 className="section-label mb-12 tracking-widest text-center">Installation</h3>
          <div className="space-y-4">
            <p className="text-[14px] text-secondary text-center max-w-lg mx-auto leading-relaxed mb-6">
              Exposed is a local Chrome extension and dashboard. Load it manually from your machine:
            </p>
            <ol className="space-y-4">
              <li className="acrylic-panel p-6 animate-fade-in delay-100">
                <span className="text-text font-display font-semibold text-[14px]">1. Clone the repository</span>
                <div className="mt-3 p-3.5 bg-surface-2 rounded-lg border border-border font-mono text-[12px] text-secondary overflow-x-auto select-all">
                  git clone {GITHUB_URL}.git
                </div>
              </li>
              <li className="acrylic-panel p-6 animate-fade-in delay-200">
                <span className="text-text font-display font-semibold text-[14px]">2. Install dependencies for the dashboard</span>
                <div className="mt-3 p-3.5 bg-surface-2 rounded-lg border border-border font-mono text-[12px] text-secondary overflow-x-auto select-all">
                  cd dashboard && pnpm install && pnpm build
                </div>
              </li>
              <li className="acrylic-panel p-6 animate-fade-in delay-300">
                <span className="text-text font-display font-semibold text-[14px]">3. Load the extension in Chrome</span>
                <div className="mt-3 space-y-2 text-[13px] text-secondary">
                  <p>Open <code className="text-accent font-mono bg-accent-soft px-1.5 py-0.5 rounded font-medium">chrome://extensions</code> in your Chrome browser.</p>
                  <p>Enable <strong className="text-text">Developer mode</strong> in the top-right corner.</p>
                  <p>Click <strong className="text-text">Load unpacked</strong> in the top-left.</p>
                  <p>Select the <code className="text-text bg-surface-2 px-1.5 py-0.5 rounded font-mono">extension/</code> folder in the cloned directory.</p>
                </div>
              </li>
              <li className="acrylic-panel p-6 animate-fade-in delay-400">
                <span className="text-text font-display font-semibold text-[14px]">4. Start the dashboard dev server</span>
                <div className="mt-3 p-3.5 bg-surface-2 rounded-lg border border-border font-mono text-[12px] text-secondary overflow-x-auto select-all">
                  cd dashboard && pnpm dev
                </div>
              </li>
              <li className="acrylic-panel p-6 animate-fade-in delay-500">
                <span className="text-text font-display font-semibold text-[14px]">5. Open the dashboard</span>
                <div className="mt-3 text-[13px] text-secondary leading-relaxed">
                  Open the dashboard at <a href="https://exposed-dashboard.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">exposed-dashboard.vercel.app</a> or use your local server at <span className="text-text font-mono font-medium">http://localhost:5173</span> and start browsing.
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-accent-soft flex items-center justify-center">
                <Eye size={11} className="text-accent" />
              </div>
              <p className="text-[12px] text-muted font-medium">
                Exposed — Local-first surveillance intelligence.
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
