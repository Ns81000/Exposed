import { useMemo } from 'react';
import { Shield, Building2, AlertTriangle, Tag } from 'lucide-react';

export default function SummaryStats({ events }) {
  const stats = useMemo(() => {
    if (!events.length) return null;

    const companies = new Set(events.map((e) => e.company));
    const highRisk = events.filter((e) => e.risk === 'high').length;
    const highPct = Math.round((highRisk / events.length) * 100);

    const catCounts = {};
    events.forEach((e) => {
      catCounts[e.category] = (catCounts[e.category] || 0) + 1;
    });
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      total: events.length,
      companies: companies.size,
      highPct,
      topCategory
    };
  }, [events]);

  if (!stats) return null;

  const cards = [
    { label: 'Total Trackers', value: stats.total, icon: Shield, color: 'var(--color-accent)' },
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'var(--color-risk-medium)' },
    { label: 'High Risk', value: `${stats.highPct}%`, icon: AlertTriangle, color: 'var(--color-risk-high)' },
    { label: 'Top Category', value: stats.topCategory, icon: Tag, color: 'var(--color-risk-low)' }
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="border border-border bg-surface px-4 py-3 animate-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon size={14} style={{ color: card.color }} strokeWidth={2} />
            <p className="section-label">{card.label}</p>
          </div>
          <p className="text-[20px] font-medium text-text leading-none">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
