const GITHUB_URL = 'https://github.com/Ns81000/Exposed';

const styles = `
  .mobile-button {
    border-color: #52525B;
    color: #FAFAFA;
    transition: border-color 150ms ease-in-out;
  }
  
  .mobile-button:hover {
    border-color: #FAFAFA;
  }
`;

export default function MobileGate() {
  return (
    <div className="bg-[#09090B] text-[#FAFAFA] min-h-screen px-6 py-12 flex flex-col items-center justify-center">
      <style>{styles}</style>
      <div className="max-w-sm mx-auto text-center space-y-8">
        <div>
          <h1 className="text-[24px] font-400 tracking-tight mb-4">
            Exposed
          </h1>
          <p className="text-[15px] text-[#A1A1AA] leading-relaxed">
            Exposed is a desktop-only tool designed for Chrome on Windows, macOS, or Linux. Mobile access is not supported.
          </p>
        </div>

        <div className="border-t border-[#27272A] border-b pt-8 pb-8">
          <h2 className="text-[13px] font-400 text-[#FAFAFA] mb-6">
            How to set up on desktop
          </h2>
          <ol className="space-y-5 text-left">
            <li>
              <p className="text-[11px] text-[#52525B] uppercase tracking-wider mb-2">
                Clone the repository
              </p>
              <div className="bg-[#1A1A1A] rounded border border-[#27272A] p-3">
                <p className="font-mono text-[11px] text-[#A1A1AA] break-words">
                  git clone {GITHUB_URL}.git
                </p>
              </div>
            </li>
            <li>
              <p className="text-[11px] text-[#52525B] uppercase tracking-wider mb-2">
                Install & build dashboard
              </p>
              <div className="bg-[#1A1A1A] rounded border border-[#27272A] p-3">
                <p className="font-mono text-[11px] text-[#A1A1AA] break-words">
                  cd dashboard && pnpm install && pnpm build
                </p>
              </div>
            </li>
            <li>
              <p className="text-[11px] text-[#52525B] uppercase tracking-wider mb-2">
                Load extension in Chrome
              </p>
              <p className="text-[13px] text-[#A1A1AA] space-y-1">
                <span className="block">1. Go to chrome://extensions</span>
                <span className="block">2. Enable Developer mode</span>
                <span className="block">3. Click Load unpacked</span>
                <span className="block">4. Select the extension/ folder</span>
              </p>
            </li>
            <li>
              <p className="text-[11px] text-[#52525B] uppercase tracking-wider mb-2">
                Start dashboard server
              </p>
              <div className="bg-[#1A1A1A] rounded border border-[#27272A] p-3">
                <p className="font-mono text-[11px] text-[#A1A1AA] break-words">
                  cd dashboard && pnpm dev
                </p>
              </div>
            </li>
            <li>
              <p className="text-[11px] text-[#52525B] uppercase tracking-wider mb-2">
                Open dashboard
              </p>
              <p className="text-[13px] text-[#A1A1AA]">
                Navigate to localhost:5173 in your desktop browser.
              </p>
            </li>
          </ol>
        </div>

        <div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-button inline-block px-6 py-3 border text-[13px] bg-transparent"
          >
            View on GitHub
          </a>
        </div>

        <p className="text-[11px] text-[#52525B]">
          Full documentation and source code available on GitHub.
        </p>
      </div>
    </div>
  );
}
