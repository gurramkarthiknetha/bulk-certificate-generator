import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, PlusCircle, Activity, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';

export const Navbar: React.FC = () => {
  const [health, setHealth] = useState<{ status: string; service?: string }>({
    status: 'checking',
  });
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await api.checkHealth();
        if (mounted) setHealth(res);
      } catch {
        if (mounted) setHealth({ status: 'offline' });
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const isHealthy = health.status === 'healthy';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  CertifyFlow
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Bulk
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Async Certificate Issuance Engine
              </p>
            </div>
          </Link>
        </div>

        {/* Right side stats & CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Health status badge */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              isHealthy
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="text-[11px] font-mono">
              {isHealthy ? 'FastAPI API: Healthy' : 'API: Connecting...'}
            </span>
          </div>

          {/* New Batch Generation Button */}
          {location.pathname !== '/create' && (
            <Link to="/create">
              <Button
                variant="glow"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create New Batch
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
