import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Github, Eye, Shield, Network, Lock, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const GITHUB_URL = 'https://github.com/Ns81000/Exposed';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-bg text-text min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Eye size={20} className="text-accent" />
            <h1 className="text-[18px] font-semibold tracking-tight">Exposed</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="text-muted hover:text-text transition-colors duration-150"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-muted hover:text-text transition-colors duration-150"
            >
              <Github size={16} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 px-6 py-24 flex items-center justify-center animate-fade-in-up">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-surface text-[11px] text-muted tracking-[0.08em] uppercase mb-8 animate-fade-in delay-100">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
            Local-first · Open source
          </div>
          <h2 className="text-[28px] md:text-[36px] font-semibold leading-tight mb-6 text-text animate-fade-in delay-200">
            uBlock hides them.<br />
            <span className="text-accent">Exposed names them.</span>
          </h2>
          <p className="text-[15px] text-secondary leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in delay-300">
            See every tracker on every website. Understand who is watching, what they collect, and why it matters — all without leaving your browser.
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-in delay-400">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-accent px-6 py-2.5 text-[14px]"
            >
              Open Dashboard
              <ArrowRight size={16} />
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn px-6 py-2.5 text-[14px]"
            >
              <Github size={16} />
              Source Code
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h3 className="section-label mb-14 animate-fade-in">What it does</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
              <div key={feature.title} className="animate-fade-in-up" style={{ animationDelay: `${200 + i * 100}ms` }}>
                <div className="w-9 h-9 rounded border border-border bg-surface flex items-center justify-center mb-4">
                  <feature.icon size={18} className="text-accent" />
                </div>
                <h4 className="text-[15px] font-medium text-text mb-3">{feature.title}</h4>
                <p className="text-[13px] text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h3 className="section-label mb-14">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Install the extension', desc: 'Load the extension from your local folder. It becomes your surveillance sensor.' },
              { step: '2', title: 'Open the dashboard', desc: 'The dashboard syncs in real-time with the extension. Watch the trackers as you browse.' },
              { step: '3', title: 'Understand your exposure', desc: 'Browse the D3 graph, timeline, and tracker details. Export sessions as reports.' }
            ].map((item, i) => (
              <div key={item.step} className="flex gap-5 animate-fade-in" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded border border-border text-[13px] text-muted font-medium bg-surface">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h4 className="text-[15px] font-medium text-text mb-2">{item.title}</h4>
                  <p className="text-[13px] text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Local-First */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h3 className="section-label mb-10">Why local-first</h3>
          <div className="space-y-7">
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
              <div key={item.title} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <h4 className="text-[15px] font-medium text-text mb-2">{item.title}</h4>
                <p className="text-[13px] text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h3 className="section-label mb-10">Installation</h3>
          <div className="space-y-5">
            <p className="text-[13px] text-secondary">
              Exposed is a local Chrome extension and dashboard. Load it manually from your machine:
            </p>
            <ol className="space-y-5">
              <li className="text-[13px] text-secondary leading-relaxed animate-fade-in delay-100">
                <span className="text-text font-medium">1. Clone the repository</span>
                <div className="mt-2 p-3 bg-raised rounded border border-border font-mono text-[11px] text-secondary overflow-x-auto">
                  git clone {GITHUB_URL}.git
                </div>
              </li>
              <li className="text-[13px] text-secondary leading-relaxed animate-fade-in delay-200">
                <span className="text-text font-medium">2. Install dependencies for the dashboard</span>
                <div className="mt-2 p-3 bg-raised rounded border border-border font-mono text-[11px] text-secondary overflow-x-auto">
                  cd dashboard && pnpm install && pnpm build
                </div>
              </li>
              <li className="text-[13px] text-secondary leading-relaxed animate-fade-in delay-300">
                <span className="text-text font-medium">3. Load the extension in Chrome</span>
                <div className="mt-2 space-y-1.5 text-[13px]">
                  <p>Open <span className="text-text">chrome://extensions</span></p>
                  <p>Enable <span className="text-text font-medium">Developer mode</span> (top right)</p>
                  <p>Click <span className="text-text font-medium">Load unpacked</span></p>
                  <p>Select the <span className="text-text">extension/</span> folder</p>
                </div>
              </li>
              <li className="text-[13px] text-secondary leading-relaxed animate-fade-in delay-400">
                <span className="text-text font-medium">4. Start the dashboard dev server</span>
                <div className="mt-2 p-3 bg-raised rounded border border-border font-mono text-[11px] text-secondary overflow-x-auto">
                  cd dashboard && pnpm dev
                </div>
              </li>
              <li className="text-[13px] text-secondary leading-relaxed animate-fade-in delay-500">
                <span className="text-text font-medium">5. Open the dashboard</span>
                <div className="mt-2">
                  Open the dashboard at <a href="https://exposed-dashboard.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">exposed-dashboard.vercel.app</a> (or use your local server at <span className="text-text">http://localhost:5173</span>) and start browsing.
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-muted" />
              <p className="text-[11px] text-muted">
                Exposed — Local-first surveillance intelligence.
              </p>
            </div>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-muted hover:text-text transition-colors duration-150"
            >
              <Github size={12} />
              View on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
