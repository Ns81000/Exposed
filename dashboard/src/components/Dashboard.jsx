import { useEffect, useMemo, useState } from 'react';
import ConnectPrompt from './ConnectPrompt';
import ExportButton from './ExportButton';
import MobileGate from './MobileGate';
import NodeGraph from './NodeGraph';
import SettingsModal from './SettingsModal';
import Sidebar from './Sidebar';
import SummaryStats from './SummaryStats';
import TrackerDetailPanel from './TrackerDetailPanel';
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

  const connected = useTrackerStore((state) => state.connected);
  const sessionTTL = useTrackerStore((state) => state.sessionTTL);
  const selectedDomain = useTrackerStore((state) => state.selectedDomain);
  const sites = useTrackerStore((state) => state.sites);
  const visits = useTrackerStore((state) => state.visits);
  const trackerEvents = useTrackerStore((state) => state.trackerEvents);
  const archives = useTrackerStore((state) => state.archives);
  const selectedTracker = useTrackerStore((state) => state.selectedTracker);

  const hydrate = useTrackerStore((state) => state.hydrate);
  const setSelectedDomain = useTrackerStore((state) => state.setSelectedDomain);
  const setSelectedTracker = useTrackerStore((state) => state.setSelectedTracker);
  const setSessionTTL = useTrackerStore((state) => state.setSessionTTL);
  const setResetAt = useTrackerStore((state) => state.setResetAt);

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

  async function onTTLChange(nextTTL) {
    setSessionTTL(nextTTL);
    if (window.chrome?.storage?.local) {
      await window.chrome.storage.local.set({ sessionTTL: nextTTL });
    }
    addToast(`Retention set to ${nextTTL === 0 ? 'never expire' : `${nextTTL} days`}`, 'success');
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
        <SummaryStats events={eventsForSite} />

        {/* Node Graph */}
        <NodeGraph events={eventsForSite} onNodeClick={setSelectedTracker} />

        {/* Timeline + Tracker Detail */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 items-start">
          <VisitTimeline events={eventsForSite} onSelectTracker={setSelectedTracker} />
          <TrackerDetailPanel tracker={selectedTracker} onClose={() => setSelectedTracker(null)} />
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
      />
    </div>
  );
}
