import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  FileCheck2,
  Palette,
  Settings,
  HelpCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    to: '/create',
    label: 'New Batch Job',
    icon: PlusCircle,
    badge: 'Fast',
  },
  {
    to: '/jobs',
    label: 'Generation Jobs',
    icon: Layers,
  },
  {
    to: '/certificates',
    label: 'Certificates Explorer',
    icon: FileCheck2,
  },
  {
    to: '/templates',
    label: 'Template Designs',
    icon: Palette,
  },
  {
    to: '/settings',
    label: 'Settings & Config',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Workspace
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-950/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-indigo-400'
                              : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Engine specs info card */}
        <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <span>Stack Architecture</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v1.0
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            FastAPI + ARQ worker queue backed by Redis & PostgreSQL with ReportLab PDF compilation.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between px-2">
        <span>Idempotency-Safe</span>
        <span className="font-mono text-slate-400">REST API v1</span>
      </div>
    </aside>
  );
};
