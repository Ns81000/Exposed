import { exportSiteReport } from '../utils/exportHtml';

export default function ExportButton({ site, visits, events }) {
  return (
    <button
      type="button"
      onClick={() => exportSiteReport(site, visits, events)}
      className="border border-border px-3 py-2 text-[13px] text-secondary hover:border-muted hover:text-text transition-all duration-150"
      disabled={!site || !events.length}
    >
      Export Site Report
    </button>
  );
}
