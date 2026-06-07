import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { riskAccent } from '../utils/riskColor';

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

  const fields = [
    { label: 'Company', value: tracker.company, className: 'text-text' },
    { label: 'Category', value: tracker.category },
    {
      label: 'Risk',
      value: tracker.risk,
      style: { color: riskAccent(tracker.risk) },
      transform: (v) => v?.toUpperCase()
    },
    { label: 'Domain', value: tracker.trackerDomain, className: 'text-text' },
    { label: 'Request URL', value: tracker.requestUrl, className: 'break-all text-muted text-[11px]' }
  ];

  return (
    <aside className="border border-border bg-surface p-4 animate-slide-in-right self-start">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <p className="section-label">Tracker Details</p>
        <button
          type="button"
          className="text-muted hover:text-text transition-colors duration-150"
          onClick={onClose}
          title="Close (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 space-y-3 text-[13px] text-secondary">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="section-label">{field.label}</p>
            <p className={`mt-1 ${field.className || ''}`} style={field.style}>
              {field.transform ? field.transform(field.value) : field.value}
            </p>
          </div>
        ))}

        {tracker.description && (
          <div>
            <p className="section-label">Description</p>
            <p className="mt-1 text-[12px] leading-relaxed">{tracker.description}</p>
          </div>
        )}

        {tracker.learnMore && (
          <div>
            <a
              href={tracker.learnMore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-1 text-[12px] text-accent hover:underline transition-colors"
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
