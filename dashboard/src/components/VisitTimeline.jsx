import { riskAccent } from '../utils/riskColor';

function groupByVisit(events) {
  return events.reduce((acc, event) => {
    const key = event.visitId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
}

export default function VisitTimeline({ events, onSelectTracker }) {
  const grouped = Object.entries(groupByVisit(events)).sort((a, b) => {
    const at = new Date(a[1][0]?.timestamp || 0).valueOf();
    const bt = new Date(b[1][0]?.timestamp || 0).valueOf();
    return bt - at;
  });

  return (
    <section className="border border-border bg-surface self-start h-fit animate-fade-in" style={{ animationDelay: '200ms' }}>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="section-label">Visit Timeline</p>
        <p className="text-[11px] text-muted tracking-[0.08em] uppercase tabular-nums">{events.length} Events</p>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar">
        {grouped.length === 0 ? (
          <p className="px-4 py-8 text-[13px] text-muted text-center">No tracker events for this site yet.</p>
        ) : (
          grouped.map(([visitId, visitEvents]) => (
            <div key={visitId} className="border-b border-border">
              <div className="px-4 py-2.5 text-[11px] text-muted tracking-[0.08em] uppercase bg-raised/50">
                {new Date(visitEvents[0].timestamp).toLocaleString()} · {visitEvents[0].pageTitle || visitEvents[0].siteDomain}
              </div>
              {visitEvents.map((event, index) => (
                <button
                  key={`${event.timestamp}-${event.requestUrl}-${index}`}
                  type="button"
                  className="w-full text-left px-4 py-2.5 border-t border-border bg-surface hover:bg-raised transition-all duration-150"
                  style={{ borderLeft: `3px solid ${riskAccent(event.risk)}` }}
                  onClick={() => onSelectTracker(event)}
                >
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-text">{event.company}</span>
                    <span className="text-muted text-[11px]">{event.category}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] tracking-[0.08em] uppercase text-muted truncate">{event.trackerDomain}</div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
