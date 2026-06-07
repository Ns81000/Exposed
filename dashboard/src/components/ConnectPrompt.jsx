import { Eye, RefreshCw } from 'lucide-react';

export default function ConnectPrompt() {
  return (
    <div className="min-h-screen bg-bg text-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-xl border border-border bg-surface p-8 animate-scale-in">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-raised">
            <Eye size={20} className="text-accent" />
          </div>
          <div>
            <p className="section-label">Extension Connection</p>
            <h1 className="text-[20px] font-medium text-text mt-0.5">Connect your Exposed extension</h1>
          </div>
        </div>

        <p className="text-[13px] text-secondary leading-relaxed">
          The Exposed extension intercepts tracker requests and sends them to this dashboard. Load the extension into Chrome to get started.
        </p>

        <ol className="mt-6 space-y-2.5 text-[13px] text-secondary list-decimal list-inside">
          <li>Open <code className="text-text bg-raised px-1.5 py-0.5 text-[12px]">chrome://extensions</code></li>
          <li>Enable <strong className="text-text">Developer mode</strong> (top right)</li>
          <li>Click <strong className="text-text">Load unpacked</strong> and select the <code className="text-text bg-raised px-1.5 py-0.5 text-[12px]">extension/</code> folder</li>
        </ol>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn btn-accent mt-6"
        >
          <RefreshCw size={14} />
          Retry Connection
        </button>
      </div>
    </div>
  );
}
