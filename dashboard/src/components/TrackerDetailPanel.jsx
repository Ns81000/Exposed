import { useEffect } from 'react';
import { X, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { riskAccent } from '../utils/riskColor';
import { getCategoryStyle } from '../utils/categoryStyles';

function formatPayload(payload) {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    if (typeof parsed === 'object' && parsed !== null) {
      const entries = Object.entries(parsed);
      if (entries.length === 0) return <span className="text-muted italic text-[11px]">Empty payload</span>;
      return (
        <div className="mt-2 space-y-2 bg-surface-2 p-3 font-mono text-[11px] border border-border rounded-lg max-h-[180px] overflow-y-auto scrollbar">
          {entries.map(([key, val]) => (
            <div key={key} className="flex flex-col gap-0.5 pb-2 border-b border-border/40 last:border-b-0 last:pb-0">
              <span className="text-accent font-medium break-all text-[10px] uppercase tracking-wider">{key}</span>
              <span className="text-text break-all select-all">{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }
  } catch {}

  return (
    <pre className="mt-2 p-3 bg-surface-2 font-mono text-[11px] border border-border rounded-lg overflow-x-auto break-all whitespace-pre-wrap select-all leading-relaxed">
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

  const isRequestEvent = tracker.requestUrl !== undefined;

  const fields = [
    { label: 'Company', value: tracker.company, className: 'text-text font-semibold text-[15px]' },
    { label: 'Category', value: tracker.category, isCategory: true },
    {
      label: 'Risk level',
      value: tracker.risk,
      style: { color: riskAccent(tracker.risk) },
      className: 'font-semibold text-[12px] uppercase tracking-wide',
      transform: (v) => v?.toUpperCase()
    },
    ...(isRequestEvent ? [
      { label: 'Tracking Domain', value: tracker.trackerDomain, className: 'text-text font-mono font-medium text-[12px]' },
      { label: 'HTTP Method', value: tracker.method || 'GET', className: 'text-text font-mono font-medium text-[12px]' },
      { 
        label: 'Payload Size', 
        value: tracker.blocked ? '0 B (Blocked)' : (tracker.size ? (tracker.size < 1024 ? `${tracker.size} B` : `${(tracker.size / 1024).toFixed(1)} KB`) : 'Pending'),
        className: 'text-text font-mono text-[12px]' 
      },
      { label: 'Request URL', value: tracker.requestUrl, className: 'break-all text-muted text-[11px] font-mono leading-normal bg-surface-2 p-2.5 rounded-lg border border-border block select-all mt-1' }
    ] : [
      { label: 'Identified Domain', value: tracker.trackerDomain || tracker.id, className: 'text-text font-mono text-[12px]' }
    ])
  ];

  return (
    <aside className="acrylic-panel p-5 animate-slide-in-right self-start w-full overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <p className="section-label text-text">Tracker details</p>
          {isRequestEvent && (
            tracker.blocked ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-riskHigh/10 text-riskHigh text-[10px] font-medium tracking-wide rounded">
                <ShieldAlert size={10} />
                Blocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-soft text-accent text-[10px] font-medium tracking-wide rounded">
                <ShieldCheck size={10} />
                Allowed
              </span>
            )
          )}
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
        {fields.map((field) => (
          <div key={field.label} className="border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
            <p className="section-label text-[10px] tracking-wider mb-1">{field.label}</p>
            {field.isCategory ? (
              (() => {
                const style = getCategoryStyle(field.value);
                return (
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-medium tracking-wide rounded-md border border-border/30 ${style.bg} ${style.text}`}>
                    {field.value}
                  </span>
                );
              })()
            ) : (
              <p className={`${field.className || ''}`} style={field.style}>
                {field.transform ? field.transform(field.value) : field.value}
              </p>
            )}
          </div>
        ))}

        {isRequestEvent && tracker.payload && (
          <div className="border-t border-border/40 pt-3">
            <p className="section-label text-[10px] tracking-wider mb-1">Exfiltrated Data / Payload</p>
            {formatPayload(tracker.payload)}
          </div>
        )}

        {tracker.description && (
          <div className="border-t border-border/40 pt-3">
            <p className="section-label text-[10px] tracking-wider mb-1">Description</p>
            <p className="mt-1 text-[12px] leading-relaxed text-secondary font-normal">{tracker.description}</p>
          </div>
        )}

        {tracker.learnMore && (
          <div className="pt-2 border-t border-border/40">
            <a
              href={tracker.learnMore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:underline transition-colors font-medium"
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
