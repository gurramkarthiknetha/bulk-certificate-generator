import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Layers,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { api } from '@/services/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DashboardStats, Job } from '@/types';

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, isError, refetch, isFetching } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 5000, // Poll every 5s for live job updates
  });

  const totalCerts = stats?.total_certificates || 0;
  const successCerts = stats?.successful_certificates || 0;
  const successRate = totalCerts > 0 ? ((successCerts / totalCerts) * 100).toFixed(1) : '100';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production-Grade Bulk Issuance Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-heading">
              Scale Your Certificate Generation
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Process hundreds or thousands of high-resolution PDF credentials simultaneously.
              Backed by asynchronous queue workers, automated fault isolation, and full idempotency safety.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/create">
              <Button
                variant="glow"
                size="lg"
                leftIcon={<PlusCircle className="w-5 h-5" />}
              >
                New Bulk Batch
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => refetch()}
              isLoading={isFetching}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Batches"
          value={stats?.total_jobs ?? 0}
          description="Generation requests processed"
          icon={Layers}
          variant="indigo"
          trend="All-time jobs"
        />
        <StatCard
          title="Certificates Issued"
          value={stats?.total_certificates ?? 0}
          description="Credentials rendered"
          icon={Award}
          variant="purple"
          trend="PDF units generated"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          description={`${successCerts} successful prints`}
          icon={CheckCircle2}
          variant="emerald"
          trend="High fidelity guarantee"
        />
        <StatCard
          title="Active Processing"
          value={(stats?.processing_jobs ?? 0) + (stats?.pending_jobs ?? 0)}
          description={`${stats?.processing_certificates ?? 0} queued certs`}
          icon={Clock}
          variant="amber"
          trend="Live worker throughput"
        />
      </div>

      {/* Quick Launch & Recent Jobs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Launch Card */}
        <div className="lg:col-span-1 space-y-5">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader
                title="Issuance Workflow"
                subtitle="Fast paths to create and manage credentials"
              />
              <div className="space-y-3.5">
                <Link
                  to="/create"
                  className="group flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 hover:bg-slate-900 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Import CSV Batch</h4>
                      <p className="text-xs text-slate-400">Upload or paste list of recipients</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/templates"
                  className="group flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 hover:bg-slate-900 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Design Gallery</h4>
                      <p className="text-xs text-slate-400">Classic Gold, Modern, Academic</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/certificates"
                  className="group flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 hover:bg-slate-900 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">All Certificates</h4>
                      <p className="text-xs text-slate-400">Search and download issued PDFs</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Worker Concurrency:</span>
                <span className="font-mono text-slate-200 font-semibold">10 Parallel Tasks</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                <span>Batch Chunking:</span>
                <span className="font-mono text-slate-200 font-semibold">50 per Transaction</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Jobs Table Card */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader
              title="Recent Generation Batches"
              subtitle="Real-time status and throughput of certificate requests"
              action={
                <Link to="/jobs">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View All
                  </Button>
                </Link>
              }
            />

            {isLoading ? (
              <div className="py-16 text-center text-slate-500 animate-pulse">
                Loading recent generation batches...
              </div>
            ) : !stats?.recent_jobs || stats.recent_jobs.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-200">No batches generated yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Kick off your first batch certificate generation job with a few sample recipients.
                  </p>
                </div>
                <Link to="/create">
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Create First Batch
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/30">
                      <th className="py-3 px-6">Program / Course</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Progress</th>
                      <th className="py-3 px-4 text-center">Counts</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.recent_jobs.slice(0, 5).map((job: Job) => (
                      <tr
                        key={job.job_id}
                        className="hover:bg-slate-900/40 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <Link
                            to={`/jobs/${job.job_id}`}
                            className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors block"
                          >
                            {job.course_name}
                          </Link>
                          <span className="text-xs text-slate-500">
                            {job.organization_name} •{' '}
                            <span className="font-mono">{job.template_name}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <Badge status={job.status} size="sm" />
                        </td>
                        <td className="py-4 px-4 w-44">
                          <ProgressBar
                            progress={job.progress_percentage}
                            status={job.status}
                            size="sm"
                            showLabel={false}
                          />
                          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                            {job.processed_count} / {job.total_count} ({job.progress_percentage.toFixed(0)}%)
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span className="text-xs text-emerald-400 font-semibold font-mono">
                            {job.success_count}
                          </span>
                          {job.failure_count > 0 && (
                            <span className="text-xs text-rose-400 font-semibold font-mono ml-2">
                              / {job.failure_count} err
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <Link to={`/jobs/${job.job_id}`}>
                            <Button variant="outline" size="sm">
                              Inspect
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
