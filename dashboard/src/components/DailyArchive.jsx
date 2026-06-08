import { Trash2 } from 'lucide-react';
import { db } from '../db/schema';
import { useToast } from './Toast';

export default function DailyArchive({ archives, onRefresh }) {
  const { addToast } = useToast();

  async function handleDelete(archive) {
    const confirmed = window.confirm(`Delete archive for ${archive.date}?`);
    if (!confirmed) return;
    await db.archives.delete(archive.id);
    await onRefresh();
    addToast(`Archive for ${archive.date} deleted`, 'info');
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
            <p className="text-[12px] text-text truncate font-medium">{archive.date}</p>
            <p className="text-[10px] text-muted">
              {archive.data?.summary?.totalTrackers || 0} trackers
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(archive)}
            className="flex items-center gap-1 text-muted hover:text-riskHigh transition-colors flex-shrink-0"
            title="Delete archive"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
