import { FileDown } from 'lucide-react';
import { exportSiteReport } from '../utils/exportHtml';
import { useToast } from './Toast';

export default function ExportButton({ site, visits, events }) {
  const { addToast } = useToast();

  function handleExport() {
    exportSiteReport(site, visits, events);
    addToast(`Report exported for ${site.domain}`, 'success');
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="btn"
      disabled={!site || !events.length}
      title={!site || !events.length ? 'Select a site with tracker data to export' : 'Export site report'}
    >
      <FileDown size={14} />
      Export Report
    </button>
  );
}
