import { useNavigate } from 'react-router-dom';

const GITHUB_URL = 'https://github.com/Ns81000/Exposed';

const styles = `
  .landing-link {
    opacity: 0.65;
    transition: opacity 150ms ease-in-out;
  }
  
  .landing-link:hover {
    opacity: 1;
  }
  
  .landing-button {
    border-color: #52525B;
    color: #FAFAFA;
    transition: border-color 150ms ease-in-out;
  }
  
  .landing-button:hover {
    border-color: #FAFAFA;
  }
`;

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#09090B] text-[#FAFAFA] min-h-screen flex flex-col">
      <style>{styles}</style>

      {/* Navigation Bar */}
      <nav className="border-b border-[#27272A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-[24px] font-400 tracking-tight">Exposed</h1>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-link text-[13px] text-[#A1A1AA]"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 px-6 py-24 flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[24px] font-400 leading-tight mb-8 text-[#FAFAFA]">
            uBlock hides them. Exposed names them.
          </h2>
          <p className="text-[15px] text-[#A1A1AA] leading-relaxed mb-12 max-w-2xl mx-auto">
            See every tracker on every website. Understand who is watching, what they collect, and why it matters — all without leaving your browser.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="landing-button inline-block px-6 py-3 border text-[13px] cursor-pointer bg-transparent"
          >
            Open Dashboard
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-[11px] uppercase tracking-wider text-[#52525B] mb-16">
            What it does
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-[15px] font-400 text-[#FAFAFA] mb-4">
                Intercepts everything
              </h4>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                Every network request from every page is matched against 50,000+ known trackers. Nothing is missed.
              </p>
            </div>
            <div>
              <h4 className="text-[15px] font-400 text-[#FAFAFA] mb-4">
                Maps the surveillance network
              </h4>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                See which companies own each tracker, their category, and risk level. Understand the full picture of who watches your browsing.
              </p>
            </div>
            <div>
              <h4 className="text-[15px] font-400 text-[#FAFAFA] mb-4">
                Stays local
              </h4>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                All data lives in your browser. No servers. No account. No cloud. No data ever leaves your machine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-24 border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-[11px] uppercase tracking-wider text-[#52525B] mb-16">
            How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded border border-[#52525B] text-[13px] text-[#52525B] font-400">
                  1
                </div>
              </div>
              <div>
                <h4 className="text-[15px] font-400 text-[#FAFAFA] mb-3">
                  Install the extension
                </h4>
                <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  Load the extension from your local folder. It becomes your surveillance sensor.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded border border-[#52525B] text-[13px] text-[#52525B] font-400">
                  2
                </div>
              </div>
              <div>
                <h4 className="text-[15px] font-400 text-[#FAFAFA] mb-3">
                  Open the dashboard
                </h4>
                <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  The dashboard syncs in real-time with the extension. Watch the trackers as you browse.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded border border-[#52525B] text-[13px] text-[#52525B] font-400">
                  3
                </div>
              </div>
              <div>
                <h4 className="text-[15px] font-400 text-[#FAFAFA] mb-3">
                  Understand your exposure
                </h4>
                <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  Browse the D3 graph, timeline, and tracker details. Export sessions as reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Local-First Section */}
      <section className="px-6 py-24 border-t border-[#27272A]">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-[11px] uppercase tracking-wider text-[#52525B] mb-12">
            Why local-first
          </h3>
          <div className="space-y-8">
            <div>
              <h4 className="text-[15px] font-400 text-[#FAFAFA] mb-3">
                No account needed
              </h4>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                Zero friction. Install and go. No signup, no email, no password. Your data never leaves your machine because there's nowhere for it to go.
              </p>
            </div>
            <div>
              <h4 className="text-[15px] font-400 text-[#FAFAFA] mb-3">
                Your data stays yours
              </h4>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                All tracking data is stored in IndexedDB on your computer. We can't see it, hackers can't see it, and advertisers definitely can't see it. You control the deletion policy.
              </p>
            </div>
            <div>
              <h4 className="text-[15px] font-400 text-[#FAFAFA] mb-3">
                Auditable
              </h4>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                The source code is open. The extension is unpacked. You can inspect every line, audit the tracker list, verify nothing leaves your browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section className="px-6 py-24 border-t border-[#27272A]">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-[11px] uppercase tracking-wider text-[#52525B] mb-12">
            Installation
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-[13px] text-[#A1A1AA] mb-4">
                Exposed is a local Chrome extension and dashboard. Load it manually from your machine:
              </p>
              <ol className="space-y-4">
                <li className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  <span className="text-[#FAFAFA]">1. Clone the repository</span>
                  <div className="mt-2 p-3 bg-[#1A1A1A] rounded border border-[#27272A] font-mono text-[11px] text-[#A1A1AA] overflow-x-auto">
                    git clone {GITHUB_URL}.git
                  </div>
                </li>
                <li className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  <span className="text-[#FAFAFA]">2. Install dependencies for the dashboard</span>
                  <div className="mt-2 p-3 bg-[#1A1A1A] rounded border border-[#27272A] font-mono text-[11px] text-[#A1A1AA] overflow-x-auto">
                    cd dashboard && pnpm install && pnpm build
                  </div>
                </li>
                <li className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  <span className="text-[#FAFAFA]">3. Load the extension in Chrome</span>
                  <div className="mt-2 space-y-2">
                    <p>Open <span className="text-[#FAFAFA]">chrome://extensions</span></p>
                    <p>Enable <span className="text-[#FAFAFA]">Developer mode</span> (top right)</p>
                    <p>Click <span className="text-[#FAFAFA]">Load unpacked</span></p>
                    <p>Select the <span className="text-[#FAFAFA]">extension/</span> folder</p>
                  </div>
                </li>
                <li className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  <span className="text-[#FAFAFA]">4. Start the dashboard dev server</span>
                  <div className="mt-2 p-3 bg-[#1A1A1A] rounded border border-[#27272A] font-mono text-[11px] text-[#A1A1AA] overflow-x-auto">
                    cd dashboard && pnpm dev
                  </div>
                </li>
                <li className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  <span className="text-[#FAFAFA]">5. Open the dashboard</span>
                  <div className="mt-2">
                    Navigate to <span className="text-[#FAFAFA]">http://localhost:5173</span> and start browsing.
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272A] px-6 py-12 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-[11px] text-[#52525B]">
              Exposed — Local-first surveillance intelligence.
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="landing-link text-[11px] text-[#52525B]"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
