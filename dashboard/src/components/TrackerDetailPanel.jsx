import { useEffect } from 'react';
import { X, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { riskAccent } from '../utils/riskColor';

function formatPayload(payload) {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    if (typeof parsed === 'object' && parsed !== null) {
      const entries = Object.entries(parsed);
      if (entries.length === 0) return <span className="text-muted italic text-[11px]">Empty payload</span>;
      return (
        <div className="mt-2 space-y-1 bg-raised/50 p-2.5 font-mono text-[10px] border border-border max-h-[160px] overflow-y-auto scrollbar">
          {entries.map(([key, val]) => (
            <div key={key} className="flex flex-col gap-0.5 pb-1 border-b border-border/40 last:border-b-0">
              <span className="text-accent font-medium break-all">{key}</span>
              <span className="text-text break-all select-all">{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }
  } catch {}

  return (
    <pre className="mt-2 p-2.5 bg-raised/50 font-mono text-[10px] border border-border overflow-x-auto break-all whitespace-pre-wrap select-all">
      {payload}
    </pre>
  );
}

export default function TrackerDetailPanel({ tracker, onClose }) {
  useEffect(() => {
    if (!tracker) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tracker, onClose]);

  if (!tracker) return null;

  // Check if this is an individual request event vs a grouped company node
  const isRequestEvent = tracker.requestUrl !== undefined;

  const fields = [
    { label: 'Company', value: tracker.company, className: 'text-text font-medium' },
    { label: 'Category', value: tracker.category },
    {
      label: 'Risk',
      value: tracker.risk,
      style: { color: riskAccent(tracker.risk) },
      transform: (v) => v?.toUpperCase()
    },
    ...(isRequestEvent ? [
      { label: 'Domain', value: tracker.trackerDomain, className: 'text-text' },
      { label: 'HTTP Method', value: tracker.method || 'GET', className: 'text-text font-mono' },
      { 
        label: 'Payload Size', 
        value: tracker.blocked ? '0 B (Blocked)' : (tracker.size ? (tracker.size < 1024 ? `${tracker.size} B` : `${(tracker.size / 1024).toFixed(1)} KB`) : 'Pending completed request'),
        className: 'text-text font-mono' 
      },
      { label: 'Request URL', value: tracker.requestUrl, className: 'break-all text-muted text-[11px]' }
    ] : [
      { label: 'Identified Domain', value: tracker.trackerDomain || tracker.id, className: 'text-text' }
    ])
  ];

  return (
    <aside className="border border-border bg-surface p-4 animate-slide-in-right self-start w-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <p className="section-label">Tracker Details</p>
          {isRequestEvent && (
            tracker.blocked ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] text-[10px] font-medium leading-none">
                <ShieldAlert size={10} />
                Blocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6] text-[10px] font-medium leading-none">
                <ShieldCheck size={10} />
                Allowed
              </span>
            )
          )}
        </div>
        <button
          type="button"
          className="text-muted hover:text-text transition-colors duration-150"
          onClick={onClose}
          title="Close (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 space-y-3.5 text-[13px] text-secondary">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="section-label">{field.label}</p>
            <p className={`mt-1 ${field.className || ''}`} style={field.style}>
              {field.transform ? field.transform(field.value) : field.value}
            </p>
          </div>
        ))}

        {isRequestEvent && tracker.payload && (
          <div>
            <p className="section-label">Exfiltrated Data / Payload</p>
            {formatPayload(tracker.payload)}
          </div>
        )}

        {tracker.description && (
          <div>
            <p className="section-label">Description</p>
            <p className="mt-1 text-[12px] leading-relaxed">{tracker.description}</p>
          </div>
        )}

        {tracker.learnMore && (
          <div className="pt-1">
            <a
              href={tracker.learnMore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:underline transition-colors"
            >
              <ExternalLink size={12} />
              Privacy Policy
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

