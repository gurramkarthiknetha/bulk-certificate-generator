import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
  status?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  showLabel = true,
  animate = true,
  status = 'PROCESSING',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getGradient = () => {
    const s = status.toUpperCase();
    if (s === 'FAILED') return 'from-rose-500 to-red-600';
    if (s === 'COMPLETED_WITH_ERRORS') return 'from-orange-500 to-amber-600';
    if (s === 'COMPLETED' || clamped === 100) return 'from-emerald-400 to-teal-500';
    return 'from-indigo-500 via-purple-500 to-pink-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="font-medium text-slate-300">
            {clamped === 100 ? 'Completed' : 'Batch Progress'}
          </span>
          <span className="font-mono font-semibold text-slate-200">
            {clamped.toFixed(1)}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40 shadow-inner ${heightClasses[size]}`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-500 ease-out relative ${
            animate && clamped < 100 ? 'overflow-hidden' : ''
          }`}
          style={{ width: `${clamped}%` }}
        >
          {animate && clamped < 100 && (
            <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-[shimmer_2s_infinite] w-full" />
          )}
        </div>
      </div>
    </div>
  );
};
