import { Monitor, Github } from 'lucide-react';

const GITHUB_URL = 'https://github.com/Ns81000/Exposed';

export default function MobileGate() {
  return (
    <div className="bg-bg text-text min-h-screen px-6 py-12 flex flex-col items-center justify-center">
      <div className="max-w-sm mx-auto text-center space-y-8">
        <div>
          <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center mx-auto mb-5">
            <Monitor size={22} className="text-accent" />
          </div>
          <h1 className="text-[22px] font-medium tracking-tight mb-3">
            Desktop Only
          </h1>
          <p className="text-[14px] text-secondary leading-relaxed">
            Exposed is a desktop Chrome extension. Mobile access is not supported — open this page on your computer.
          </p>
        </div>

        <div className="border-t border-b border-border pt-7 pb-7">
          <h2 className="text-[13px] font-medium text-text mb-5">
            How to set up on desktop
          </h2>
          <ol className="space-y-4 text-left">
            <li>
              <p className="section-label mb-2">Get the Extension</p>
              <div className="bg-raised rounded border border-border p-3">
                <p className="font-mono text-[11px] text-secondary break-words">
                  git clone {GITHUB_URL}.git
                </p>
              </div>
            </li>
            <li>
              <p className="section-label mb-2">Load in Chrome</p>
              <div className="text-[13px] text-secondary space-y-1">
                <p>1. Go to chrome://extensions</p>
                <p>2. Enable Developer mode</p>
                <p>3. Click Load unpacked</p>
                <p>4. Select the extension/ folder</p>
              </div>
            </li>
            <li>
              <p className="section-label mb-2">Open Dashboard</p>
              <p className="text-[13px] text-secondary">
                Visit exposed-dashboard.vercel.app on your desktop browser.
              </p>
            </li>
          </ol>
        </div>

        <div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent inline-flex"
          >
            <Github size={14} />
            View on GitHub
          </a>
        </div>

        <p className="text-[11px] text-muted">
          Full documentation and source code available on GitHub.
        </p>
      </div>
    </div>
  );
}
