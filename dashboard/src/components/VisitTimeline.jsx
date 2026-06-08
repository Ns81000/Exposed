import { riskAccent } from '../utils/riskColor';
import { getCategoryStyle } from '../utils/categoryStyles';

function groupByVisit(events) {
  return events.reduce((acc, event) => {
    const key = event.visitId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
}

export default function VisitTimeline({ events, selectedTracker, onSelectTracker }) {
  const grouped = Object.entries(groupByVisit(events)).sort((a, b) => {
    const at = new Date(a[1][0]?.timestamp || 0).valueOf();
    const bt = new Date(b[1][0]?.timestamp || 0).valueOf();
    return bt - at;
  });

  return (
    <section className="acrylic-panel overflow-hidden self-start h-fit animate-fade-in" style={{ animationDelay: '200ms' }}>
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <p className="section-label text-text">Visit Timeline</p>
        <p className="text-[11px] text-muted tracking-wider uppercase">{events.length} Events</p>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar">
        {grouped.length === 0 ? (
          <p className="px-5 py-10 text-[13px] text-muted text-center font-normal">No tracker events for this site yet.</p>
        ) : (
          grouped.map(([visitId, visitEvents]) => (
            <div key={visitId} className="border-b border-border last:border-b-0">
              <div className="px-5 py-2.5 text-[11px] text-secondary tracking-wide bg-surface-2 border-b border-border/60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                <span>{new Date(visitEvents[0].timestamp).toLocaleString()}</span>
                <span className="text-muted">·</span>
                <span className="truncate text-text font-medium">{visitEvents[0].pageTitle || visitEvents[0].siteDomain}</span>
              </div>
              <div className="divide-y divide-border/40">
                {visitEvents.map((event, index) => {
                  const catStyle = getCategoryStyle(event.category);
                  const isSelected = selectedTracker === event;
                  return (
                    <button
                      key={`${event.timestamp}-${event.requestUrl}-${index}`}
                      type="button"
                      className={`w-full text-left px-5 py-3 transition-all duration-150 relative flex items-center gap-3 ${
                        isSelected
                          ? 'bg-accent-soft text-text'
                          : 'hover:bg-surface-2'
                      }`}
                      onClick={() => onSelectTracker(event)}
                    >
                      {isSelected && (
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" />
                      )}
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: riskAccent(event.risk) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[13px] font-sans ${isSelected ? 'text-accent font-semibold' : 'text-text font-medium'}`}>
                            {event.company}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border flex-shrink-0 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                            {event.category}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-muted truncate mt-0.5">{event.trackerDomain}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
