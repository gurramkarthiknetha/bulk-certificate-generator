import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
} from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export const JobsListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['jobs', page, statusFilter, search],
    queryFn: () =>
      api.listJobs({
        page,
        page_size: 15,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      }),
    refetchInterval: 4000, // Poll every 4 seconds for live worker updates
  });

  const jobs = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 15) || 1;

  const STATUS_TABS = [
    { label: 'All Jobs', value: '' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'With Errors', value: 'COMPLETED_WITH_ERRORS' },
    { label: 'Failed', value: 'FAILED' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Batch Generation Jobs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit history, live queue tracking, and progress metrics across all certificate requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Link to="/create">
            <Button variant="glow" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              New Batch
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  statusFilter === tab.value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search course or organization..."
              className="glass-input w-full pl-9 pr-4 py-1.5 rounded-xl text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Jobs Table Card */}
      <Card>
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 animate-pulse">
            Loading batch generation jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-200">No jobs match your criteria</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Try adjusting your search filters or start a new certificate batch.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/40">
                  <th className="py-3.5 px-6">Program & Organization</th>
                  <th className="py-3.5 px-4">Template</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Batch Progress</th>
                  <th className="py-3.5 px-4 text-center">Success / Error</th>
                  <th className="py-3.5 px-4">Initiated</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map((job) => (
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
                        {job.organization_name} • <span className="font-mono text-[10px] text-slate-400">{job.job_id.substring(0, 8)}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                        {job.template_name}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge status={job.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 w-48">
                      <ProgressBar
                        progress={job.progress_percentage}
                        status={job.status}
                        size="sm"
                        showLabel={false}
                      />
                      <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
                        <span>{job.processed_count} / {job.total_count}</span>
                        <span>{job.progress_percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap font-mono">
                      <span className="text-xs text-emerald-400 font-semibold">
                        {job.success_count}
                      </span>
                      {job.failure_count > 0 ? (
                        <span className="text-xs text-rose-400 font-semibold ml-2">
                          / {job.failure_count} err
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 ml-1">/ 0 err</span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(job.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Link to={`/jobs/${job.job_id}`}>
                        <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-200">{(page - 1) * 15 + 1}</span> to{' '}
              <span className="font-semibold text-slate-200">
                {Math.min(page * 15, total)}
              </span>{' '}
              of <span className="font-semibold text-slate-200">{total}</span> jobs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <span className="font-mono px-2 text-slate-300">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
