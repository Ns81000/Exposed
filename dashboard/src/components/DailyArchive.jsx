import { db } from '../db/schema';
import { exportArchiveReport } from '../utils/exportHtml';

export default function DailyArchive({ archives, onRefresh }) {
  async function exportAndDelete(archive) {
    exportArchiveReport(archive);
    await db.archives.delete(archive.id);
    await onRefresh();
  }

  return (
    <section className="border border-border bg-surface">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="section-label">Daily Archive</p>
        <p className="text-[11px] text-muted tracking-[0.08em] uppercase">{archives.length} days</p>
      </div>

      <div className="max-h-[220px] overflow-y-auto scrollbar">
        {archives.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-muted text-center">No archived days available.</p>
        ) : (
          archives.map((archive) => (
            <div key={archive.id} className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-[13px] text-text">{archive.date}</p>
                <p className="text-[11px] text-muted tracking-[0.08em] uppercase">
                  {archive.data?.summary?.totalTrackers || 0} trackers
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportAndDelete(archive)}
                className="border border-border px-3 py-1 text-[11px] text-secondary hover:border-muted hover:text-text transition-all duration-150"
              >
                Download
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
