export default function ConnectPrompt() {
  return (
    <div className="min-h-screen bg-bg text-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-xl border border-border bg-surface p-8">
        <p className="section-label">Extension Connection</p>
        <h1 className="mt-4 text-[24px] font-normal text-text">Connect your Exposed extension</h1>
        <p className="mt-4 text-[13px] text-secondary">
          Load the unpacked extension from the extension folder, then refresh this page.
        </p>
        <ol className="mt-6 space-y-2 text-[13px] text-secondary list-decimal list-inside">
          <li>Open chrome://extensions</li>
          <li>Enable developer mode</li>
          <li>Click load unpacked and select the extension folder</li>
        </ol>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 border border-border px-4 py-2 text-[13px] text-secondary hover:border-muted hover:text-text transition-all duration-150"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
