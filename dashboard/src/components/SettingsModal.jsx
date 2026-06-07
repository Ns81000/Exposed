import { useEffect } from 'react';
import { X, Clock, Trash2, Info, ShieldAlert } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function SettingsModal({ open, onClose, ttl, onTTLChange, onDeleteAll, deletingAll, blockingEnabled, onBlockingToggle }) {
  const { theme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-lg border border-border bg-surface animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="text-[15px] font-medium text-text">Settings</p>
          <button type="button" className="text-muted hover:text-text transition-colors" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Session Retention */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-muted" />
              <p className="section-label">Session Retention</p>
            </div>
            <p className="text-[12px] text-muted">
              Controls how long tracker data is kept before automatic cleanup. Applies to all sites.
            </p>
            <select
              value={String(ttl)}
              onChange={(e) => onTTLChange(Number(e.target.value))}
              className="w-full bg-raised border border-border px-3 py-2 text-[13px] text-secondary focus:outline-none focus:border-muted rounded-none"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days (default)</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="0">Never expire</option>
            </select>
          </div>

          {/* Tracker Blocker Shield */}
          <div className="border-t border-border pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-muted" />
                  <p className="section-label">Tracker Blocking Shield</p>
                </div>
                <p className="text-[12px] text-muted">
                  Actively block identified surveillance networks in real-time. Telemetry will still log blocked attempts.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={blockingEnabled}
                onClick={() => onBlockingToggle(!blockingEnabled)}
                className={`w-9 h-5 rounded-full p-[2px] transition-colors duration-150 focus:outline-none border border-border flex items-center ${blockingEnabled ? 'bg-accent border-accent' : 'bg-raised border-border'}`}
                title={blockingEnabled ? 'Disable Blocker' : 'Enable Blocker'}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-text transition-transform duration-150 ${blockingEnabled ? 'translate-x-4 bg-bg' : 'translate-x-0 bg-muted'}`} />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-border pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 size={14} className="text-danger" />
              <p className="section-label" style={{ color: 'var(--color-danger)' }}>Danger Zone</p>
            </div>
            <p className="text-[12px] text-muted">
              Permanently removes all current sessions and archived history from this browser. This cannot be undone.
            </p>
            <button
              type="button"
              onClick={onDeleteAll}
              disabled={deletingAll}
              className="btn btn-danger w-full justify-center"
            >
              <Trash2 size={14} />
              {deletingAll ? 'Deleting...' : 'Delete All Tracking Data'}
            </button>
          </div>

          {/* About */}
          <div className="border-t border-border pt-5 space-y-2">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-muted" />
              <p className="section-label">About</p>
            </div>
            <p className="text-[12px] text-muted">
              Exposed v1.0.0 — Local-first surveillance intelligence. All data stays in your browser.
            </p>
            <p className="text-[12px] text-muted">
              Current theme: <span className="text-secondary capitalize">{theme}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

