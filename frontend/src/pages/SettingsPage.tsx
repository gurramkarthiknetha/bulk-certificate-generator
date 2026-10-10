import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Settings,
  Building,
  Server,
  Database,
  CheckCircle2,
  Save,
  Cpu,
  Layers,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { useToast } from '@/context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { success, error } = useToast();

  const [orgName, setOrgName] = useState('Global Institute of Technology');
  const [defaultTemplate, setDefaultTemplate] = useState('classic_gold');
  const [signerName, setSignerName] = useState('Dr. Marcus Sterling');
  const [signerTitle, setSignerTitle] = useState('Dean of Engineering');
  const [isSaving, setIsSaving] = useState(false);

  // Health check query
  const { data: health, refetch: refetchHealth, isFetching: isHealthChecking } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.checkHealth(),
  });

  // Settings query
  const { data: orgSettings } = useQuery({
    queryKey: ['org-settings'],
    queryFn: () => api.getOrganizationSettings(),
  });

  useEffect(() => {
    if (orgSettings) {
      if (orgSettings.organization_name) setOrgName(orgSettings.organization_name);
      if (orgSettings.default_template) setDefaultTemplate(orgSettings.default_template);
      if (orgSettings.default_signer_name) setSignerName(orgSettings.default_signer_name);
      if (orgSettings.default_signer_title) setSignerTitle(orgSettings.default_signer_title);
    }
  }, [orgSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateOrganizationSettings({
        organization_name: orgName,
        default_template: defaultTemplate,
        default_signer_name: signerName,
        default_signer_title: signerTitle,
      });
      success('Settings Updated', 'Organization defaults saved successfully.');
    } catch (err: any) {
      error('Failed to update settings', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isHealthy = health?.status === 'healthy';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
          System & Organization Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure default credential issuing authorities and monitor backend service health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Organization Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader
                title="Default Organization Profile"
                subtitle="These values pre-populate new batch certificate generation requests"
              />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Default Signer Name
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Default Signer Role
                    </label>
                    <input
                      type="text"
                      value={signerTitle}
                      onChange={(e) => setSignerTitle(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Default Vector Template
                  </label>
                  <select
                    value={defaultTemplate}
                    onChange={(e) => setDefaultTemplate(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm bg-slate-900"
                  >
                    <option value="classic_gold">Classic Gold (Gold Ornate Borders & Seal)</option>
                    <option value="modern_minimal">Modern Minimal (Contemporary Indigo & Cobalt)</option>
                    <option value="academic">Academic Diploma (Formal Collegiate Double Rule)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex justify-end">
                  <Button
                    type="submit"
                    variant="glow"
                    size="md"
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Right: Architecture & Diagnostics */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-100">
                Service Diagnostics
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchHealth()}
                isLoading={isHealthChecking}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isHealthChecking ? 'animate-spin' : ''}`} />}
              >
                Ping
              </Button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span className="font-medium text-slate-200">FastAPI REST Core</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                    isHealthy
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isHealthy ? 'Online (200 OK)' : 'Connecting...'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-slate-200">PostgreSQL Relational DB</span>
                </div>
                <span className="text-slate-400 font-mono">Port 5432</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-pink-400" />
                  <span className="font-medium text-slate-200">ARQ Redis Task Queue</span>
                </div>
                <span className="text-slate-400 font-mono">Port 6379</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-slate-200">PDF Generator Engine</span>
                </div>
                <span className="text-slate-400 font-mono">ReportLab 4.2.4</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Execution Safeguards"
              subtitle="Built-in resilience and scalability limits"
            />
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Max Recipients per Batch:</span>
                <span className="font-mono text-slate-200 font-semibold">10,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Worker Batch Chunk Size:</span>
                <span className="font-mono text-slate-200 font-semibold">50 items</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Maximum Retries per Failure:</span>
                <span className="font-mono text-slate-200 font-semibold">3 attempts</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Storage Backend:</span>
                <span className="font-mono text-slate-200 font-semibold">Local & S3 Compatible</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
