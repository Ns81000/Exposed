function formatRelative(isoTime) {
  const value = new Date(isoTime).toLocaleString();
  return Number.isNaN(new Date(isoTime).valueOf()) ? '-' : value;
}

export default function Sidebar({ sites, selectedDomain, onSelect }) {
  return (
    <aside className="w-full md:w-[320px] border-r border-border bg-surface flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <p className="section-label">Sites</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar">
        {sites.length === 0 ? (
          <div className="p-4 text-muted text-[13px]">No tracked sites yet.</div>
        ) : (
          sites.map((site) => {
            const isActive = selectedDomain === site.domain;
            return (
              <button
                key={site.domain}
                type="button"
                onClick={() => onSelect(site.domain)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-all duration-150 ${
                  isActive ? 'bg-raised text-text font-medium' : 'text-secondary font-normal hover:bg-raised'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{site.domain}</span>
                  <span className="text-muted">{site.totalTrackers}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted tracking-[0.08em] uppercase">{formatRelative(site.lastSeen)}</div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
