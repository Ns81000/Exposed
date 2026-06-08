import { RefreshCw } from 'lucide-react';
import BrandIcon from './BrandIcon';

export default function ConnectPrompt() {
  return (
    <div className="min-h-screen bg-bg text-secondary flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="mesh-bg" />

      <div className="w-full max-w-xl acrylic-panel p-8 md:p-10 animate-scale-in relative z-10 bg-surface-1">
        <div className="flex items-center gap-3.5 mb-6">
          <BrandIcon size={44} showBackground={true} bgFill="rgba(94, 106, 210, 0.08)" />
          <div>
            <p className="section-label tracking-wider">Extension Connection</p>
            <h1 className="text-[22px] font-display font-bold text-text mt-0.5 tracking-tight">Connect your Exposed extension</h1>
          </div>
        </div>

        <p className="text-[13.5px] text-secondary leading-relaxed font-normal mb-6">
          The Exposed extension intercepts tracker requests and sends them to this dashboard. Load the extension into Chrome to get started.
        </p>

        <div className="bg-surface-2 border border-border rounded-xl p-5 space-y-3.5">
          <p className="section-label text-[10px] tracking-wider text-text">Setup Instructions</p>
          <ol className="space-y-3 text-[13px] text-secondary list-decimal list-inside leading-relaxed">
            <li>
              Open <code className="text-accent font-mono bg-accent-soft px-2 py-0.5 rounded select-all font-medium">chrome://extensions</code> in a new tab.
            </li>
            <li>
              Enable <strong className="text-text font-semibold">Developer mode</strong> using the toggle in the top right.
            </li>
            <li>
              Click <strong className="text-text font-semibold">Load unpacked</strong> and select the <code className="text-text bg-surface-3 px-1.5 py-0.5 rounded font-mono">extension/</code> folder inside the cloned repo.
            </li>
          </ol>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn btn-accent mt-8 px-6 py-2.5 flex items-center gap-2"
        >
          <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
          Retry Connection
        </button>
      </div>
    </div>
  );
}
