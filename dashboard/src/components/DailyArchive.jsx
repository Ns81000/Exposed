import { Download } from 'lucide-react';
import { db } from '../db/schema';
import { exportArchiveReport } from '../utils/exportHtml';
import { useToast } from './Toast';

export default function DailyArchive({ archives, onRefresh }) {
  const { addToast } = useToast();

  async function exportAndDelete(archive) {
    exportArchiveReport(archive);
    await db.archives.delete(archive.id);
    await onRefresh();
    addToast(`Archive for ${archive.date} exported`, 'success');
  }

  if (archives.length === 0) {
    return (
      <p className="px-4 py-4 text-[12px] text-muted text-center">No archived days available.</p>
    );
  }

  return (
    <div>
      {archives.map((archive) => (
        <div key={archive.id} className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12px] text-text truncate">{archive.date}</p>
            <p className="text-[11px] text-muted tracking-[0.08em] uppercase">
              {archive.data?.summary?.totalTrackers || 0} trackers
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportAndDelete(archive)}
            className="flex items-center gap-1 text-muted hover:text-text transition-colors flex-shrink-0"
            title="Download and remove"
          >
            <Download size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
