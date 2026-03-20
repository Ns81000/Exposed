import { useEffect, useMemo, useState } from 'react';
import ConnectPrompt from './ConnectPrompt';
import DailyArchive from './DailyArchive';
import ExportButton from './ExportButton';
import MobileGate from './MobileGate';
import NodeGraph from './NodeGraph';
import SettingsPanel from './SettingsPanel';
import Sidebar from './Sidebar';
import TrackerDetailPanel from './TrackerDetailPanel';
import VisitTimeline from './VisitTimeline';
import { useLiveUpdates } from '../hooks/useLiveUpdates';
import { useTrackerStore } from '../hooks/useTrackerStore';
import { cleanExpiredSessions, runDailyArchive } from '../utils/archiver';
import { clearAllTrackingData } from '../db/schema';

function isMobileView() {
  const mobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  return mobileAgent || window.innerWidth < 1024;
}

export default function Dashboard() {
  const [deletingAll, setDeletingAll] = useState(false);
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
    } finally {
      setDeletingAll(false);
    }
  }

  if (isMobile) return <MobileGate />;
  if (!connected) return <ConnectPrompt />;

  return (
    <div className="min-h-screen bg-bg text-secondary md:flex">
      <Sidebar
        sites={sites}
        selectedDomain={selectedDomain}
        onSelect={(domain) => {
          setSelectedDomain(domain);
          setSelectedTracker(null);
        }}
      />

      <main className="flex-1 p-4 md:p-6 space-y-4">
        <header className="border border-border bg-surface px-4 py-3 flex items-center justify-between">
          <div>
            <p className="section-label">Active Site</p>
            <h1 className="text-[24px] font-normal text-text mt-2">{selectedDomain || 'Waiting for data'}</h1>
          </div>
          <ExportButton site={site} visits={visitsForSite} events={eventsForSite} />
        </header>

        <NodeGraph events={eventsForSite} onNodeClick={setSelectedTracker} />

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 items-start">
          <VisitTimeline events={eventsForSite} onSelectTracker={setSelectedTracker} />
          <div className="space-y-4 self-start">
            <TrackerDetailPanel tracker={selectedTracker} onClose={() => setSelectedTracker(null)} />
            <SettingsPanel
              ttl={sessionTTL}
              onChange={onTTLChange}
              onDeleteAll={onDeleteAllData}
              deletingAll={deletingAll}
            />
            <DailyArchive archives={archives} onRefresh={hydrate} />
          </div>
        </div>
      </main>
    </div>
  );
}
