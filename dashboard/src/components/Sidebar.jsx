import { useState, useMemo } from 'react';
import { Search, Settings, Sun, Moon, ChevronDown, ChevronRight, Archive, Eye } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import DailyArchive from './DailyArchive';

function formatRelative(isoTime) {
  const value = new Date(isoTime).toLocaleString();
  return Number.isNaN(new Date(isoTime).valueOf()) ? '-' : value;
}

function riskDot(events) {
  if (!events) return null;
  const hasHigh = events > 10;
  const color = hasHigh ? 'var(--color-risk-high)' : 'var(--color-risk-medium)';
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

export default function Sidebar({
  sites,
  selectedDomain,
  onSelect,
  archives,
  onRefresh,
  onOpenSettings
}) {
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return sites;
    const q = search.toLowerCase();
    return sites.filter((site) => site.domain.toLowerCase().includes(q));
  }, [sites, search]);

  return (
    <aside className="w-full md:w-[300px] border-r border-border bg-surface flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-border flex items-center gap-2.5">
        <Eye size={20} className="text-accent flex-shrink-0" />
        <h1 className="text-[16px] font-semibold text-text tracking-tight">Exposed</h1>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 bg-raised border border-border px-2.5 py-1.5">
          <Search size={14} className="text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-text placeholder:text-muted outline-none border-none"
          />
        </div>
      </div>

      {/* Sites Label */}
      <div className="px-4 py-2.5 border-b border-border">
        <p className="section-label">Tracked Sites</p>
      </div>

      {/* Sites List */}
      <div className="flex-1 overflow-y-auto scrollbar">
        {filtered.length === 0 ? (
          <div className="p-4 text-muted text-[13px]">
            {search ? 'No sites match your search.' : 'No tracked sites yet.'}
          </div>
        ) : (
          filtered.map((site) => {
            const isActive = selectedDomain === site.domain;
            return (
              <button
                key={site.domain}
                type="button"
                onClick={() => onSelect(site.domain)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-all duration-150 ${
                  isActive
                    ? 'bg-raised text-text font-medium'
                    : 'text-secondary font-normal hover:bg-raised'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px]">{site.domain}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {riskDot(site.totalTrackers)}
                    <span className="text-muted text-[12px] tabular-nums">{site.totalTrackers}</span>
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-muted tracking-[0.08em] uppercase truncate">
                  {formatRelative(site.lastSeen)}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Archives (collapsible) */}
      <div className="border-t border-border">
        <button
          type="button"
          onClick={() => setArchiveOpen(!archiveOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-secondary hover:text-text transition-colors"
        >
          <div className="flex items-center gap-2">
            <Archive size={14} className="text-muted" />
            <span className="section-label">Daily Archive</span>
          </div>
          {archiveOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {archiveOpen && (
          <div className="max-h-[200px] overflow-y-auto scrollbar border-t border-border">
            <DailyArchive archives={archives} onRefresh={onRefresh} />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-muted hover:text-text transition-colors duration-150"
        >
          <Settings size={16} />
          <span className="text-[12px]">Settings</span>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 text-muted hover:text-text transition-colors duration-150"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span className="text-[12px]">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </aside>
  );
}
