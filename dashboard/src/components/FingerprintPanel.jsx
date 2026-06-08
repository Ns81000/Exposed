import { useEffect } from 'react';
import { X, Cpu } from 'lucide-react';

export default function FingerprintPanel({ event, onClose }) {
  useEffect(() => {
    if (!event) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [event, onClose]);

  if (!event) return null;

  return (
    <aside className="acrylic-panel p-5 animate-slide-in-right self-start w-full overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Cpu size={14} className="text-riskHigh" />
          <p className="section-label text-text">Fingerprint Telemetry</p>
        </div>
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:bg-surface-2 text-muted hover:text-text transition-colors duration-150"
          onClick={onClose}
          title="Close (Esc)"
        >
          <X size={15} />
        </button>
      </div>

      <div className="space-y-3.5 text-[13px] text-secondary">
        <div className="border-b border-border/40 pb-3">
          <p className="section-label text-[10px] tracking-wider mb-1">Target API Vector</p>
          <p className="font-mono text-[14px] text-text font-semibold tracking-tight select-all">{event.api}</p>
        </div>

        <div className="border-b border-border/40 pb-3">
          <p className="section-label text-[10px] tracking-wider mb-1">Trigger Time</p>
          <p className="text-text font-sans font-medium">{new Date(event.timestamp).toLocaleString()}</p>
        </div>

        <div>
          <p className="section-label text-[10px] tracking-wider mb-1.5">Source Context (Call Stack)</p>
          {event.stack ? (
            <pre className="p-3 bg-surface-2 font-mono text-[11px] border border-border rounded-lg overflow-x-auto break-all whitespace-pre-wrap select-all max-h-[220px] overflow-y-auto scrollbar text-secondary leading-relaxed">
              {event.stack}
            </pre>
          ) : (
            <p className="mt-1 text-[12px] text-muted italic font-sans">Call stack trace unavailable.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
