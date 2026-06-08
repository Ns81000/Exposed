import { FileDown } from 'lucide-react';
import { exportSiteReport } from '../utils/exportHtml';
import { useToast } from './Toast';

export default function ExportButton({ site, visits, events, fingerprints }) {
  const { addToast } = useToast();

  function handleExport() {
    exportSiteReport(site, visits, events, fingerprints);
    addToast(`Report exported for ${site.domain}`, 'success');
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="btn border-accent/30 text-accent hover:bg-accent-soft hover:border-accent/50"
      disabled={!site || !events.length}
      title={!site || !events.length ? 'Select a site with tracker data to export' : 'Export site report'}
    >
      <FileDown size={14} />
      Export Report
    </button>
  );
}
