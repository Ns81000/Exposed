import { useEffect, useMemo, useState } from 'react';
import ConnectPrompt from './ConnectPrompt';
import ExportButton from './ExportButton';
import MobileGate from './MobileGate';
import NodeGraph from './NodeGraph';
import SettingsModal from './SettingsModal';
import Sidebar from './Sidebar';
import SummaryStats from './SummaryStats';
import TrackerDetailPanel from './TrackerDetailPanel';
import FingerprintPanel from './FingerprintPanel';
import VisitTimeline from './VisitTimeline';
import { useToast } from './Toast';
import { useLiveUpdates } from '../hooks/useLiveUpdates';
import { useTrackerStore } from '../hooks/useTrackerStore';
import { cleanExpiredSessions, runDailyArchive } from '../utils/archiver';
import { clearAllTrackingData } from '../db/schema';

function isMobileView() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export default function Dashboard() {
  const [deletingAll, setDeletingAll] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedFingerprint, setSelectedFingerprint] = useState(null);

  const connected = useTrackerStore((state) => state.connected);
  const sessionTTL = useTrackerStore((state) => state.sessionTTL);
  const selectedDomain = useTrackerStore((state) => state.selectedDomain);
  const sites = useTrackerStore((state) => state.sites);
  const visits = useTrackerStore((state) => state.visits);
  const trackerEvents = useTrackerStore((state) => state.trackerEvents);
  const fingerprintEvents = useTrackerStore((state) => state.fingerprintEvents || []);
  const archives = useTrackerStore((state) => state.archives);
  const selectedTracker = useTrackerStore((state) => state.selectedTracker);
  const blockingEnabled = useTrackerStore((state) => state.blockingEnabled);

  const hydrate = useTrackerStore((state) => state.hydrate);
  const setSelectedDomain = useTrackerStore((state) => state.setSelectedDomain);
  const setSelectedTracker = useTrackerStore((state) => state.setSelectedTracker);
  const setSessionTTL = useTrackerStore((state) => state.setSessionTTL);
  const setResetAt = useTrackerStore((state) => state.setResetAt);
  const setBlockingEnabled = useTrackerStore((state) => state.setBlockingEnabled);

  const { addToast } = useToast();

  useLiveUpdates();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    runDailyArchive().then(hydrate);
  }, [hydrate]);

  useEffect(() => {
    cleanExpiredSessions(sessionTTL).then(hydrate);
  }, [sessionTTL, hydrate]);

  const isMobile = isMobileView();
  const site = useMemo(() => sites.find((item) => item.domain === selectedDomain) || null, [sites, selectedDomain]);

  const eventsForSite = useMemo(
    () => trackerEvents.filter((event) => event.siteDomain === selectedDomain),
    [trackerEvents, selectedDomain]
  );

  const visitsForSite = useMemo(
    () => visits.filter((visit) => visit.siteDomain === selectedDomain),
    [visits, selectedDomain]
  );

  const fingerprintsForSite = useMemo(
    () => fingerprintEvents.filter((event) => event.siteDomain === selectedDomain),
    [fingerprintEvents, selectedDomain]
  );

  async function onTTLChange(nextTTL) {
    setSessionTTL(nextTTL);
    if (window.chrome?.storage?.local) {
      await window.chrome.storage.local.set({ sessionTTL: nextTTL });
    }
    addToast(`Retention set to ${nextTTL === 0 ? 'never expire' : `${nextTTL} days`}`, 'success');
  }

  async function onBlockingToggle(nextVal) {
    await setBlockingEnabled(nextVal);
    addToast(`Tracker Blocking Shield ${nextVal ? 'Activated' : 'Deactivated'}`, 'info');
  }

  async function onDeleteAllData() {
    const confirmed = window.confirm(
      'Delete all current and archived tracking data from this browser? This cannot be undone.'
    );

    if (!confirmed) return;

    setDeletingAll(true);
    try {
      const resetAt = new Date().toISOString();
      await clearAllTrackingData();

      await new Promise((resolve) => {
        const timeout = window.setTimeout(resolve, 1500);

        const handleMessage = (event) => {
          if (event.source !== window) return;
          const data = event.data || {};
          if (data.source !== 'EXPOSED_EXTENSION') return;

          if (data.type === 'CLEAR_ALL_DONE' || data.type === 'CLEAR_ALL_ERROR') {
            window.clearTimeout(timeout);
            window.removeEventListener('message', handleMessage);
            resolve();
          }
        };

        window.addEventListener('message', handleMessage);
        window.postMessage({ source: 'EXPOSED_DASHBOARD', type: 'CLEAR_ALL_DATA' }, '*');
      });

      setResetAt(resetAt);
      setSelectedTracker(null);
      setSelectedFingerprint(null);
      await hydrate();
      setSettingsOpen(false);
      addToast('All tracking data deleted', 'info');
    } finally {
      setDeletingAll(false);
    }
  }

  if (isMobile) return <MobileGate />;
  if (!connected) return <ConnectPrompt />;

  return (
    <div className="min-h-screen bg-bg text-secondary flex">
      <Sidebar
        sites={sites}
        selectedDomain={selectedDomain}
        onSelect={(domain) => {
          setSelectedDomain(domain);
          setSelectedTracker(null);
          setSelectedFingerprint(null);
        }}
        archives={archives}
        onRefresh={hydrate}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
        {/* Header */}
        <header className="border border-border bg-surface px-5 py-4 flex items-center justify-between animate-fade-in">
          <div>
            <p className="section-label">Active Site</p>
            <h1 className="text-[22px] font-medium text-text mt-1.5">{selectedDomain || 'Waiting for data'}</h1>
          </div>
          <ExportButton site={site} visits={visitsForSite} events={eventsForSite} />
        </header>

        {/* Summary Stats */}
        <SummaryStats events={eventsForSite} fingerprints={fingerprintsForSite} />

        {/* Node Graph */}
        <NodeGraph events={eventsForSite} onNodeClick={setSelectedTracker} />

        {/* Timeline + Tracker Detail */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 items-start">
          <div className="space-y-4">
            <VisitTimeline
              events={eventsForSite}
              onSelectTracker={(tracker) => {
                setSelectedTracker(tracker);
                setSelectedFingerprint(null);
              }}
            />

            {/* Fingerprint alerts timeline */}
            {fingerprintsForSite.length > 0 && (
              <section className="border border-border bg-surface self-start h-fit animate-fade-in" style={{ animationDelay: '250ms' }}>
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse inline-block" />
                    <p className="section-label">Active Fingerprint Detections</p>
                  </div>
                  <p className="text-[11px] text-muted tracking-[0.08em] uppercase tabular-nums">
                    {fingerprintsForSite.length} Alerts
                  </p>
                </div>
                <div className="max-h-[220px] overflow-y-auto scrollbar">
                  {fingerprintsForSite.map((fp, idx) => (
                    <button
                      key={`${fp.timestamp}-${fp.api}-${idx}`}
                      type="button"
                      className="w-full text-left px-4 py-2.5 border-b border-border last:border-b-0 bg-surface hover:bg-raised transition-all duration-150 flex items-center justify-between"
                      style={{ borderLeft: '3px solid #ef4444' }}
                      onClick={() => {
                        setSelectedFingerprint(fp);
                        setSelectedTracker(null);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-text font-mono text-[12px]">{fp.api}</span>
                        <span className="text-muted text-[10px] mt-0.5">{new Date(fp.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] px-1.5 py-0.5 uppercase tracking-wider font-semibold">
                        Heuristic Triggered
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            {selectedTracker && (
              <TrackerDetailPanel tracker={selectedTracker} onClose={() => setSelectedTracker(null)} />
            )}
            {selectedFingerprint && (
              <FingerprintPanel event={selectedFingerprint} onClose={() => setSelectedFingerprint(null)} />
            )}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        ttl={sessionTTL}
        onTTLChange={onTTLChange}
        onDeleteAll={onDeleteAllData}
        deletingAll={deletingAll}
        blockingEnabled={blockingEnabled}
        onBlockingToggle={onBlockingToggle}
      />
    </div>
  );
}

