import { riskAccent } from '../utils/riskColor';

export default function TrackerDetailPanel({ tracker, onClose }) {
  if (!tracker) return null;

  return (
    <aside className="border border-border bg-surface p-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <p className="section-label">Tracker Details</p>
        <button
          type="button"
          className="text-[11px] text-muted hover:text-text transition-all duration-150"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="mt-4 space-y-3 text-[13px] text-secondary">
        <div>
          <p className="section-label">Company</p>
          <p className="mt-1 text-text">{tracker.company}</p>
        </div>

        <div>
          <p className="section-label">Category</p>
          <p className="mt-1">{tracker.category}</p>
        </div>

        <div>
          <p className="section-label">Risk</p>
          <p className="mt-1" style={{ color: riskAccent(tracker.risk) }}>
            {tracker.risk}
          </p>
        </div>

        <div>
          <p className="section-label">Domain</p>
          <p className="mt-1 text-text">{tracker.trackerDomain}</p>
        </div>

        <div>
          <p className="section-label">Request URL</p>
          <p className="mt-1 break-all text-muted">{tracker.requestUrl}</p>
        </div>

        {tracker.description ? (
          <div>
            <p className="section-label">Description</p>
            <p className="mt-1">{tracker.description}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
