import { useState, useMemo } from 'react';
import { Search, Settings, ChevronDown, ChevronRight, Archive, Eye, Network, User } from 'lucide-react';
import DailyArchive from './DailyArchive';
import BrandIcon from './BrandIcon';
import BrandLogo from './BrandLogo';

function formatRelative(isoTime) {
  const date = new Date(isoTime);
  if (Number.isNaN(date.valueOf())) return '-';
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function riskDot(events) {
  if (!events) return null;
  const color = events > 10
    ? 'var(--color-risk-high)'
    : events > 3
      ? 'var(--color-risk-medium)'
      : 'var(--color-risk-low)';
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
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
  onOpenSettings,
  activeView = 'console',
  onViewChange
}) {
  const [search, setSearch] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return sites;
    const q = search.toLowerCase();
    return sites.filter((site) => site.domain.toLowerCase().includes(q));
  }, [sites, search]);

  return (
    <aside className="w-full md:w-[272px] border-r border-border bg-surface-1 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header — taller, more breathing room */}
      <div className="px-5 py-5 border-b border-border flex items-center gap-3">
        <BrandIcon size={34} showBackground={true} bgFill="rgba(94, 106, 210, 0.08)" />
        <div className="min-w-0">
          <h1 className="text-[17px] text-text tracking-tight leading-tight">
            <BrandLogo />
          </h1>
          <span className="text-[10px] text-muted font-medium tracking-wide">v1.0.0</span>
        </div>
      </div>

      {/* Navigation Views */}
      <div className="px-4 py-3 border-b border-border flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => onViewChange && onViewChange('console')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
            activeView === 'console'
              ? 'bg-accent-soft text-accent'
              : 'text-secondary hover:bg-surface-2 hover:text-text'
          }`}
        >
          <Eye size={15} />
          Site Console
        </button>
        <button
          type="button"
          onClick={() => onViewChange && onViewChange('analytics')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
            activeView === 'analytics'
              ? 'bg-accent-soft text-accent'
              : 'text-secondary hover:bg-surface-2 hover:text-text'
          }`}
        >
          <Network size={15} />
          Threat Analytics
        </button>
        <button
          type="button"
          onClick={() => onViewChange && onViewChange('profile-map')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
            activeView === 'profile-map'
              ? 'bg-accent-soft text-accent'
              : 'text-secondary hover:bg-surface-2 hover:text-text'
          }`}
        >
          <User size={15} />
          Shadow Profile
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 transition-colors duration-150 focus-within:border-accent-solid">
          <Search size={14} className="text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-text placeholder:text-muted outline-none border-none font-sans"
          />
        </div>
      </div>

      {/* Sites Label */}
      <div className="px-5 py-2.5 border-b border-border">
        <p className="section-label tracking-wider">Tracked Sites</p>
      </div>

      {/* Sites List */}
      <div className="flex-1 overflow-y-auto scrollbar">
        {filtered.length === 0 ? (
          <div className="p-5 text-muted text-[13px] font-normal">
            {search ? 'No sites match your search.' : 'No tracked sites yet.'}
          </div>
        ) : (
          filtered.map((site) => {
            const isActive = selectedDomain === site.domain;
            return (
              <button
                key={site.domain}
                type="button"
                onClick={() => {
                  onSelect(site.domain);
                  if (onViewChange) onViewChange('console');
                }}
                className={`w-full text-left px-5 py-3 border-b border-border transition-all duration-150 relative ${
                  isActive
                    ? 'bg-accent-soft text-text'
                    : 'text-secondary hover:bg-surface-2'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent shadow-[0_0_8px_var(--color-accent)] rounded-r" />
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-[13px] font-sans ${isActive ? 'font-semibold text-accent' : ''}`}>{site.domain}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {riskDot(site.totalTrackers)}
                    <span className="text-muted text-[11px] tabular-nums">{site.totalTrackers}</span>
                  </div>
                </div>
                <div className="mt-0.5 text-[10px] text-muted truncate">
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
          className="w-full px-5 py-3 flex items-center justify-between text-secondary hover:text-text transition-colors"
        >
          <div className="flex items-center gap-2">
            <Archive size={14} className="text-muted" />
            <span className="section-label text-text">Daily Archive</span>
          </div>
          {archiveOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {archiveOpen && (
          <div className="max-h-[200px] overflow-y-auto scrollbar border-t border-border bg-surface-2">
            <DailyArchive archives={archives} onRefresh={onRefresh} />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border px-5 py-3.5 flex items-center">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-muted hover:text-text transition-colors duration-150 font-medium"
        >
          <Settings size={15} />
          <span className="text-[12px] font-sans">Settings</span>
        </button>
      </div>
    </aside>
  );
}
