export default function SettingsPanel({ ttl, onChange, onDeleteAll, deletingAll }) {
  return (
    <div className="border border-border bg-surface p-4 space-y-6">
      <div>
        <p className="section-label">Session Retention</p>
        <div className="mt-3">
          <select
            value={String(ttl)}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-full bg-surface border border-border px-3 py-2 text-[13px] text-secondary focus:outline-none focus:ring-0"
          >
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="0">Never</option>
          </select>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="section-label">Delete All Tracking Data</p>
        <p className="mt-2 text-[11px] text-muted tracking-[0.08em] uppercase">
          Removes current sessions and archived history from this browser.
        </p>
        <button
          type="button"
          onClick={onDeleteAll}
          disabled={deletingAll}
          className="mt-3 w-full border border-border px-3 py-2 text-[13px] text-secondary hover:border-muted hover:text-text transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deletingAll ? 'Deleting...' : 'Delete All Tracking Data'}
        </button>
      </div>
    </div>
  );
}
