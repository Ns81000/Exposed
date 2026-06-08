import { useMemo } from 'react';
import { Shield, AlertTriangle, Tag, ShieldAlert } from 'lucide-react';

export default function SummaryStats({ events = [], fingerprints = [] }) {
  const stats = useMemo(() => {
    const total = events.length;
    const blocked = events.filter((e) => e.blocked).length;
    const blockedPct = total > 0 ? Math.round((blocked / total) * 100) : 0;
    
    let score = 100;
    let bytesExfiltrated = 0;
    let bytesSaved = 0;

    events.forEach((e) => {
      const size = e.size || 0;
      if (e.blocked) {
        if (e.risk === 'high') score -= 3;
        else if (e.risk === 'medium') score -= 1;
        bytesSaved += 12 * 1024;
      } else {
        if (e.risk === 'high') score -= 15;
        else if (e.risk === 'medium') score -= 5;
        else score -= 2;
        bytesExfiltrated += size > 0 ? size : (8 * 1024);
      }
    });

    if (fingerprints.length > 0) {
      score -= 25;
    }

    score = Math.max(0, Math.min(100, score));

    let grade = 'A';
    let gradeColor = 'var(--color-success)';
    if (score < 55) {
      grade = 'F';
      gradeColor = 'var(--color-risk-high)';
    } else if (score < 70) {
      grade = 'D';
      gradeColor = 'var(--color-risk-medium)';
    } else if (score < 80) {
      grade = 'C';
      gradeColor = 'var(--color-risk-medium)';
    } else if (score < 90) {
      grade = 'B';
      gradeColor = 'var(--color-accent)';
    }

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 KB';
      const kb = bytes / 1024;
      if (kb < 1024) return `${kb.toFixed(1)} KB`;
      const mb = kb / 1024;
      return `${mb.toFixed(1)} MB`;
    };

    return {
      total,
      blocked,
      blockedPct,
      fingerprintsCount: fingerprints.length,
      score,
      grade,
      gradeColor,
      exfiltratedStr: formatBytes(bytesExfiltrated),
      savedStr: formatBytes(bytesSaved)
    };
  }, [events, fingerprints]);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Privacy Grade — hero card */}
      <div
        className="stat-card animate-fade-in flex flex-col justify-between"
        style={{ animationDelay: '0ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} style={{ color: stats.gradeColor }} />
          <p className="section-label text-[10px] tracking-wider">Privacy Grade</p>
        </div>
        <div className="flex items-baseline gap-2">
          <p
            className="text-[40px] font-sans font-bold leading-none tracking-tight"
            style={{ color: stats.gradeColor }}
          >
            {stats.grade}
          </p>
          <span className="text-[13px] text-muted font-medium tabular-nums">{stats.score}/100</span>
        </div>
      </div>

      {/* Total Trackers */}
      <div
        className="stat-card animate-fade-in flex flex-col justify-between"
        style={{ animationDelay: '60ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Tag size={14} className="text-accent" />
          <p className="section-label text-[10px] tracking-wider">Total Trackers</p>
        </div>
        <div>
          <p className="text-[28px] font-sans font-bold text-text leading-none tracking-tight tabular-nums">{stats.total}</p>
          <p className="text-[11px] text-muted mt-2">{stats.total - stats.blocked} allowed · {stats.exfiltratedStr} load</p>
        </div>
      </div>

      {/* Blocked Shield */}
      <div
        className="stat-card animate-fade-in flex flex-col justify-between"
        style={{ animationDelay: '120ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={14} style={{ color: stats.blocked > 0 ? 'var(--color-success)' : 'var(--color-muted)' }} />
          <p className="section-label text-[10px] tracking-wider">Blocked Shield</p>
        </div>
        <div>
          <p className="text-[28px] font-sans font-bold text-text leading-none tracking-tight tabular-nums">{stats.blockedPct}%</p>
          <p className="text-[11px] text-muted mt-2">{stats.blocked} blocked · {stats.savedStr} saved</p>
        </div>
      </div>

      {/* Fingerprints */}
      <div
        className="stat-card animate-fade-in flex flex-col justify-between"
        style={{ animationDelay: '180ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} style={{ color: stats.fingerprintsCount > 0 ? 'var(--color-risk-high)' : 'var(--color-muted)' }} />
          <p className="section-label text-[10px] tracking-wider">Fingerprints</p>
        </div>
        <div>
          <p className="text-[28px] font-sans font-bold text-text leading-none tracking-tight tabular-nums">{stats.fingerprintsCount}</p>
          <p className="text-[11px] text-muted mt-2">{stats.fingerprintsCount > 0 ? 'Active profiling detected' : 'No profiling detected'}</p>
        </div>
      </div>
    </div>
  );
}
