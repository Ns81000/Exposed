import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
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
import ThreatAnalytics from './ThreatAnalytics';
import ProfileMap from './ProfileMap';
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
  const [activeView, setActiveView] = useState('console');

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
    <div className="min-h-screen bg-bg text-secondary flex font-sans">
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
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {activeView === 'console' ? (
        <main className="flex-1 p-5 md:p-6 space-y-5 overflow-y-auto scrollbar">
          {/* Header */}
          <header className="acrylic-panel px-6 py-5 flex items-center justify-between animate-fade-in">
            <div>
              <p className="section-label tracking-wider">Active Site</p>
              <h1 className="text-[22px] font-display font-bold text-text mt-1 tracking-tight">{selectedDomain || 'Waiting for data'}</h1>
            </div>
            <ExportButton site={site} visits={visitsForSite} events={eventsForSite} fingerprints={fingerprintsForSite} />
          </header>

          {/* Summary Stats */}
          <SummaryStats events={eventsForSite} fingerprints={fingerprintsForSite} />

          {/* Node Graph */}
          <NodeGraph events={eventsForSite} onNodeClick={setSelectedTracker} />

          {/* Timeline + Tracker Detail */}
          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5 items-start">
            <div className="space-y-5">
              <VisitTimeline
                events={eventsForSite}
                selectedTracker={selectedTracker}
                onSelectTracker={(tracker) => {
                  setSelectedTracker(tracker);
                  setSelectedFingerprint(null);
                }}
              />

              {/* Fingerprint alerts */}
              {fingerprintsForSite.length > 0 && (
                <section className="acrylic-panel self-start h-fit overflow-hidden animate-fade-in" style={{ animationDelay: '250ms' }}>
                  <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-riskHigh animate-pulse inline-block" />
                      <p className="section-label text-text">Active Fingerprint Detections</p>
                    </div>
                    <p className="text-[11px] text-muted tracking-wider uppercase">
                      {fingerprintsForSite.length} Alerts
                    </p>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto scrollbar">
                    {fingerprintsForSite.map((fp, idx) => {
                      const isSelected = selectedFingerprint && (
                        selectedFingerprint.id !== undefined && fp.id !== undefined
                          ? selectedFingerprint.id === fp.id
                          : (selectedFingerprint.timestamp === fp.timestamp && selectedFingerprint.api === fp.api)
                      );
                      return (
                        <button
                          key={`${fp.timestamp}-${fp.api}-${idx}`}
                          type="button"
                          className={`w-full text-left px-5 py-3 border-b border-border last:border-b-0 transition-all duration-150 flex items-center justify-between ${
                            isSelected ? 'bg-accent-soft text-text' : 'hover:bg-surface-2'
                          }`}
                          style={{ borderLeft: '3px solid var(--color-risk-high)' }}
                          onClick={() => {
                            setSelectedFingerprint(fp);
                            setSelectedTracker(null);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className={`font-mono text-[12px] ${isSelected ? 'text-accent font-semibold' : 'text-text font-medium'}`}>{fp.api}</span>
                            <span className="text-muted text-[10px] mt-0.5">{new Date(fp.timestamp).toLocaleString()}</span>
                          </div>
                          <span className="text-[10px] border border-riskHigh/30 bg-riskHigh/10 text-riskHigh px-2 py-0.5 rounded font-medium tracking-wide">
                            Triggered
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            <div className="sticky top-5">
              {!selectedTracker && !selectedFingerprint ? (
                <div className="acrylic-panel p-6 flex flex-col items-center text-center justify-center min-h-[320px] animate-fade-in">
                  <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center mb-5 text-accent">
                    <Eye size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-[15px] text-text mb-2">Privacy Inspector</h3>
                  <p className="text-[12px] text-secondary leading-relaxed max-w-xs mb-6 font-normal">
                    Select a tracker node from the graph or click a visit event to audit company profiles and payloads.
                  </p>
                  <div className="w-full border-t border-border pt-5 text-left space-y-3">
                    <p className="section-label text-[10px] tracking-wider mb-1">Guide</p>
                    <div className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--color-risk-high)' }} />
                      <p className="text-[11px] text-secondary leading-normal font-normal">
                        <strong className="text-text font-medium">Device Fingerprinting:</strong> Queries system APIs to build a hardware fingerprint.
                      </p>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--color-risk-medium)' }} />
                      <p className="text-[11px] text-secondary leading-normal font-normal">
                        <strong className="text-text font-medium">Cross-Site Trackers:</strong> Tracks navigation across sites to build behavior dossiers.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {selectedTracker && (
                    <TrackerDetailPanel tracker={selectedTracker} onClose={() => setSelectedTracker(null)} />
                  )}
                  {selectedFingerprint && (
                    <FingerprintPanel event={selectedFingerprint} onClose={() => setSelectedFingerprint(null)} />
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      ) : activeView === 'analytics' ? (
        <ThreatAnalytics
          sites={sites}
          visits={visits}
          events={trackerEvents}
          fingerprints={fingerprintEvents}
        />
      ) : (
        <ProfileMap
          sites={sites}
          visits={visits}
          events={trackerEvents}
          fingerprints={fingerprintEvents}
        />
      )}

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
