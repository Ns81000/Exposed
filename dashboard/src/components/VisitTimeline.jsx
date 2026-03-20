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
    <section className="border border-border bg-surface self-start h-fit">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="section-label">Visit Timeline</p>
        <p className="text-[11px] text-muted tracking-[0.08em] uppercase">{events.length} Events</p>
      </div>

      <div className="max-h-[320px] overflow-y-auto scrollbar">
        {grouped.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-muted text-center">No tracker events for this site yet.</p>
        ) : (
          grouped.map(([visitId, visitEvents]) => (
            <div key={visitId} className="border-b border-border">
              <div className="px-4 py-3 text-[11px] text-muted tracking-[0.08em] uppercase">
                {new Date(visitEvents[0].timestamp).toLocaleString()} | {visitEvents[0].pageTitle || visitEvents[0].siteDomain}
              </div>
              {visitEvents.map((event, index) => (
                <button
                  key={`${event.timestamp}-${event.requestUrl}-${index}`}
                  type="button"
                  className="w-full text-left px-4 py-3 border-t border-border bg-surface hover:bg-raised transition-all duration-150"
                  style={{ borderLeft: `2px solid ${riskAccent(event.risk)}` }}
                  onClick={() => onSelectTracker(event)}
                >
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-text">{event.company}</span>
                    <span className="text-muted">{event.category}</span>
                  </div>
                  <div className="mt-1 text-[11px] tracking-[0.08em] uppercase text-muted">{event.trackerDomain}</div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
