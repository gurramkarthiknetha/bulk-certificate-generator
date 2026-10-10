import React from 'react';
import { JobStatus, CertificateStatus } from '@/types';

interface BadgeProps {
  status: JobStatus | CertificateStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md', className = '' }) => {
  const normalized = status.toUpperCase();

  const getVariant = () => {
    switch (normalized) {
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          ping: false,
          label: 'Completed',
        };
      case 'PROCESSING':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          dot: 'bg-indigo-400',
          ping: true,
          label: 'Processing',
        };
      case 'PENDING':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          ping: true,
          label: 'Pending',
        };
      case 'COMPLETED_WITH_ERRORS':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          dot: 'bg-orange-400',
          ping: false,
          label: 'Completed with Errors',
        };
      case 'FAILED':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          ping: false,
          label: 'Failed',
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
          dot: 'bg-slate-400',
          ping: false,
          label: status,
        };
    }
  };

  const v = getVariant();
  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1.5'
      : size === 'lg'
      ? 'text-sm px-3.5 py-1.5 gap-2.5 font-medium'
      : 'text-xs px-2.5 py-1 gap-2 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all duration-200 ${v.bg} ${sizeClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {v.ping && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${v.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${v.dot}`} />
      </span>
      <span>{v.label}</span>
    </span>
  );
};
