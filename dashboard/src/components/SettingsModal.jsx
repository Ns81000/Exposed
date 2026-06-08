import { useEffect } from 'react';
import { X, Clock, Trash2, Info, ShieldAlert } from 'lucide-react';

export default function SettingsModal({ open, onClose, ttl, onTTLChange, onDeleteAll, deletingAll, blockingEnabled, onBlockingToggle }) {

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
        className="w-full max-w-lg acrylic-panel bg-surface-1 animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <p className="text-[16px] font-display font-semibold text-text">Settings</p>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:bg-surface-2 text-muted hover:text-text transition-all"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Retention */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-accent" />
              <p className="section-label text-text">Session Retention</p>
            </div>
            <p className="text-[12px] text-secondary leading-relaxed">
              Controls how long tracker data is kept before automatic cleanup. Applies to all sites.
            </p>
            <select
              value={String(ttl)}
              onChange={(e) => onTTLChange(Number(e.target.value))}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-[13px] text-text focus:outline-none focus:border-accent/50 font-sans transition-colors cursor-pointer"
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
              <div className="space-y-1 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-accent" />
                  <p className="section-label text-text">Tracker Blocking Shield</p>
                </div>
                <p className="text-[12px] text-secondary leading-relaxed">
                  Actively block identified surveillance networks in real-time. Telemetry will still log blocked attempts.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={blockingEnabled}
                onClick={() => onBlockingToggle(!blockingEnabled)}
                className={`w-10 h-[22px] rounded-full p-[2px] transition-all duration-200 focus:outline-none border flex items-center ${
                  blockingEnabled
                    ? 'bg-accent border-accent'
                    : 'bg-surface-3 border-border'
                }`}
                title={blockingEnabled ? 'Disable Blocker' : 'Enable Blocker'}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                    blockingEnabled ? 'translate-x-[18px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-border pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 size={14} className="text-danger" />
              <p className="section-label text-danger">Danger Zone</p>
            </div>
            <p className="text-[12px] text-secondary leading-relaxed">
              Permanently removes all current sessions and archived history from this browser. This cannot be undone.
            </p>
            <button
              type="button"
              onClick={onDeleteAll}
              disabled={deletingAll}
              className="btn btn-danger w-full justify-center py-2.5 rounded-lg"
            >
              <Trash2 size={14} className="mr-1" />
              {deletingAll ? 'Deleting...' : 'Delete All Tracking Data'}
            </button>
          </div>

          {/* About */}
          <div className="border-t border-border pt-5 space-y-2 text-[11px] text-secondary">
            <div className="flex items-center gap-2 mb-1.5">
              <Info size={13} className="text-muted" />
              <p className="section-label text-text">About</p>
            </div>
            <p className="leading-relaxed">
              Exposed v1.0.0 — Local-first surveillance intelligence. All data stays in your browser.
            </p>
            <div className="flex items-center justify-between text-muted mt-2 text-[10px]">
              <span>Storage: <span className="text-secondary font-medium">Local IndexedDB</span></span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
