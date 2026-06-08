import { Monitor, Github } from 'lucide-react';

const GITHUB_URL = 'https://github.com/Ns81000/Exposed';

export default function MobileGate() {
  return (
    <div className="bg-bg text-text min-h-screen px-6 py-12 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="mesh-bg" />

      <div className="w-full max-w-md acrylic-panel p-8 md:p-10 text-center space-y-6 bg-surface-1 relative z-10">
        <div>
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-5">
            <Monitor size={22} className="text-white" />
          </div>
          <h1 className="text-[24px] font-display font-bold tracking-tight mb-2 text-text">
            Desktop Only
          </h1>
          <p className="text-[13.5px] text-secondary leading-relaxed font-normal">
            Exposed is a desktop Chrome extension. Mobile access is not supported — open this page on your computer.
          </p>
        </div>

        <div className="border-t border-b border-border py-6 text-left space-y-4">
          <h2 className="section-label text-text tracking-wider">
            How to set up on desktop
          </h2>
          <ol className="space-y-4">
            <li className="space-y-1.5">
              <p className="section-label text-[10px] text-text">1. Get the Extension</p>
              <div className="bg-surface-2 rounded-lg border border-border p-3">
                <p className="font-mono text-[11px] text-secondary break-all select-all">
                  git clone {GITHUB_URL}.git
                </p>
              </div>
            </li>
            <li className="space-y-1">
              <p className="section-label text-[10px] text-text">2. Load in Chrome</p>
              <div className="text-[12.5px] text-secondary space-y-1 font-sans pl-1">
                <p>1. Go to <code className="text-accent font-mono text-[11px]">chrome://extensions</code></p>
                <p>2. Enable Developer mode toggle</p>
                <p>3. Click Load unpacked button</p>
                <p>4. Select the unpacked <code className="text-text font-mono text-[11px] bg-surface-2 px-1 py-0.5 rounded">extension/</code> folder</p>
              </div>
            </li>
            <li className="space-y-1">
              <p className="section-label text-[10px] text-text">3. Open Dashboard</p>
              <p className="text-[12.5px] text-secondary pl-1 leading-normal">
                Visit <span className="text-text font-medium">exposed-dashboard.vercel.app</span> on your desktop browser.
              </p>
            </li>
          </ol>
        </div>

        <div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent inline-flex px-5 py-2.5"
          >
            <Github size={14} className="mr-1" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
