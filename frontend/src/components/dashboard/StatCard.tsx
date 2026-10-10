import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  variant?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'indigo',
  trend,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      glow: 'from-indigo-600/10 to-transparent',
      text: 'text-indigo-400',
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      glow: 'from-emerald-600/10 to-transparent',
      text: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      glow: 'from-amber-600/10 to-transparent',
      text: 'text-amber-400',
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      glow: 'from-purple-600/10 to-transparent',
      text: 'text-purple-400',
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      glow: 'from-rose-600/10 to-transparent',
      text: 'text-rose-400',
    },
  };

  const c = colorMap[variant];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-700 hover:translate-y-[-2px]">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${c.glow} pointer-events-none opacity-60`}
      />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight mt-2 font-heading">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {description && (
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
              {description}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${c.bg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
          <span>Performance Metric</span>
          <span className={`font-semibold ${c.text}`}>{trend}</span>
        </div>
      )}
    </div>
  );
};
