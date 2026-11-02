import React from 'react';

/** Compact, data-driven overview shared by the study workspaces. */
export function SectorStats({ items, label }: {
  label: string;
  items: { label: string; value: string; hint: string; icon: React.ReactNode; tone: 'purple' | 'mint' | 'peach' | 'blue' }[];
}) {
  return <section className="sector-stats" aria-label={label}>
    {items.map(item => <div className="sector-stat" key={item.label}>
      <span className={`sector-stat-icon ${item.tone}`}>{item.icon}</span>
      <span className="sector-stat-content"><small>{item.label}</small><strong>{item.value}</strong><span>{item.hint}</span></span>
    </div>)}
  </section>;
}
