import { useMemo } from 'react';
import { Shield, AlertTriangle, Tag, ShieldAlert } from 'lucide-react';

export default function SummaryStats({ events = [], fingerprints = [] }) {
  const stats = useMemo(() => {
    const total = events.length;
    const blocked = events.filter((e) => e.blocked).length;
    const blockedPct = total > 0 ? Math.round((blocked / total) * 100) : 0;
    
    // Score logic: starts at 100, drops for each tracker (less penalty if blocked), drops heavily for active fingerprinting
    let score = 100;
    let bytesExfiltrated = 0;
    let bytesSaved = 0;

    events.forEach((e) => {
      const size = e.size || 0;
      if (e.blocked) {
        if (e.risk === 'high') score -= 3;
        else if (e.risk === 'medium') score -= 1;
        bytesSaved += 12 * 1024; // Estimate 12KB saved per blocked request
      } else {
        if (e.risk === 'high') score -= 15;
        else if (e.risk === 'medium') score -= 5;
        else score -= 2;
        bytesExfiltrated += size > 0 ? size : (8 * 1024); // Estimate 8KB baseline if size is 0
      }
    });

    if (fingerprints.length > 0) {
      score -= 25;
    }

    score = Math.max(0, Math.min(100, score));

    let grade = 'A';
    let gradeColor = '#10b981'; // Green
    if (score < 55) {
      grade = 'F';
      gradeColor = '#ef4444'; // Red
    } else if (score < 70) {
      grade = 'D';
      gradeColor = '#f97316'; // Orange
    } else if (score < 80) {
      grade = 'C';
      gradeColor = '#f59e0b'; // Amber
    } else if (score < 90) {
      grade = 'B';
      gradeColor = '#3b82f6'; // Blue
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

  const cards = [
    { 
      label: 'Privacy Grade', 
      value: stats.grade, 
      icon: Shield, 
      color: stats.gradeColor, 
      subtext: `Safety Score: ${stats.score}/100` 
    },
    { 
      label: 'Total Trackers', 
      value: stats.total, 
      icon: Tag, 
      color: 'var(--color-accent)', 
      subtext: `${stats.total - stats.blocked} allowed · ${stats.exfiltratedStr} load` 
    },
    { 
      label: 'Blocked Shield', 
      value: `${stats.blockedPct}%`, 
      icon: ShieldAlert, 
      color: stats.blocked > 0 ? '#10b981' : 'var(--color-border)', 
      subtext: `${stats.blocked} blocked · ${stats.savedStr} saved` 
    },
    { 
      label: 'Fingerprints', 
      value: stats.fingerprintsCount, 
      icon: AlertTriangle, 
      color: stats.fingerprintsCount > 0 ? '#ef4444' : 'var(--color-border)', 
      subtext: stats.fingerprintsCount > 0 ? 'Active profiling detected' : 'No profiling detected' 
    }
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="border border-border bg-surface px-4 py-3 animate-fade-in flex flex-col justify-between"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={14} style={{ color: card.color }} strokeWidth={2} />
              <p className="section-label">{card.label}</p>
            </div>
            <p className="text-[26px] font-medium text-text leading-none">{card.value}</p>
          </div>
          <p className="text-[10px] text-muted mt-2 tracking-wide uppercase">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
}

