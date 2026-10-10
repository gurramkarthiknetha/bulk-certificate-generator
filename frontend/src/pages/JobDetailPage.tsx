import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  Clock,
  Eye,
  X,
} from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CertificatePreview } from '@/components/certificates/CertificatePreview';
import { Certificate } from '@/types';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [certPage, setCertPage] = useState(1);
  const [certStatus, setCertStatus] = useState<string>('');
  const [certSearch, setCertSearch] = useState('');
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const hasTriggeredConfetti = useRef(false);

  // Fetch Job details
  const {
    data: job,
    isLoading: isJobLoading,
    refetch: refetchJob,
    isFetching: isJobFetching,
  } = useQuery({
    queryKey: ['job', id],
    queryFn: () => (id ? api.getJob(id) : Promise.reject('No ID')),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Auto-poll every 2.5s if active, or stop polling if terminal
      return status === 'PENDING' || status === 'PROCESSING' ? 2500 : false;
    },
  });

  // Fetch Certificates list for this job
  const {
    data: certsData,
    isLoading: isCertsLoading,
    refetch: refetchCerts,
  } = useQuery({
    queryKey: ['job-certificates', id, certPage, certStatus, certSearch],
    queryFn: () =>
      id
        ? api.listJobCertificates(id, {
            page: certPage,
            page_size: 20,
            status: certStatus || undefined,
            search: certSearch.trim() || undefined,
          })
        : Promise.reject('No ID'),
    enabled: !!id,
    refetchInterval: (query) => {
      return job?.status === 'PENDING' || job?.status === 'PROCESSING' ? 3000 : false;
    },
  });

  // Fire celebratory confetti when job completes successfully
  useEffect(() => {
    if (
      job &&
      (job.status === 'COMPLETED' || job.status === 'COMPLETED_WITH_ERRORS') &&
      !hasTriggeredConfetti.current
    ) {
      hasTriggeredConfetti.current = true;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981'],
      });
    }
  }, [job?.status]);

  if (isJobLoading) {
    return (
      <div className="py-24 text-center text-slate-500 animate-pulse space-y-3">
        <Layers className="w-8 h-8 text-indigo-400 mx-auto animate-bounce" />
        <p>Loading generation batch metrics...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Job Not Found</h2>
        <p className="text-sm text-slate-400">The requested certificate batch could not be found.</p>
        <Link to="/jobs">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const isFinished = job.status === 'COMPLETED' || job.status === 'COMPLETED_WITH_ERRORS';
  const certs = certsData?.items || [];
  const certsTotal = certsData?.total || 0;
  const certTotalPages = Math.ceil(certsTotal / 20) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Jobs</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              {job.course_name}
            </h1>
            <Badge status={job.status} size="lg" />
          </div>
          <p className="text-xs text-slate-400">
            {job.organization_name} • Template: <span className="font-mono text-slate-300">{job.template_name}</span> • Job ID: <span className="font-mono text-slate-400">{job.job_id}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchJob();
              refetchCerts();
            }}
            isLoading={isJobFetching}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isJobFetching ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          {job.success_count > 0 && (
            <a
              href={api.getZipDownloadUrl(job.job_id)}
              download={`certificates_${job.job_id}.zip`}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download All ({job.success_count} PDFs in ZIP)
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Progress & Live Counters Card */}
      <Card glow={job.status === 'PROCESSING'}>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">
                  {job.status === 'PROCESSING' ? 'Generating Credentials Live...' : 'Batch Processing Status'}
                </span>
                {job.status === 'PROCESSING' && (
                  <span className="animate-pulse text-xs text-indigo-400 font-mono">
                    (Background worker active)
                  </span>
                )}
              </div>
              <span className="text-sm font-mono font-bold text-slate-100">
                {job.progress_percentage.toFixed(1)}%
              </span>
            </div>
            <ProgressBar
              progress={job.progress_percentage}
              status={job.status}
              size="lg"
              showLabel={false}
            />
          </div>

          {/* Counts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Total Recipients</span>
              <p className="text-2xl font-extrabold text-slate-100 mt-1 font-mono">
                {job.total_count}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Processed</span>
              <p className="text-2xl font-extrabold text-indigo-400 mt-1 font-mono">
                {job.processed_count}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-xs text-emerald-400 font-medium">Successful PDFs</span>
              <p className="text-2xl font-extrabold text-emerald-300 mt-1 font-mono">
                {job.success_count}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
              <span className="text-xs text-rose-400 font-medium">Failed Items</span>
              <p className="text-2xl font-extrabold text-rose-300 mt-1 font-mono">
                {job.failure_count}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Failure Inspector Notice if any failures */}
      {job.failure_count > 0 && (
        <div className="p-4 rounded-2xl border border-orange-500/30 bg-orange-950/20 text-orange-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-orange-300">
              Fault Isolation Active ({job.failure_count} failed recipient records)
            </h4>
            <p className="opacity-90 leading-relaxed">
              The batch generator continued printing the rest of the batch without stopping. You can inspect the individual error message for each recipient in the table below.
            </p>
          </div>
        </div>
      )}

      {/* Certificates Explorer for this job */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Generated Certificates ({certsTotal})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant PDF downloads and individual verification previews
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by status */}
            <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
              {['', 'COMPLETED', 'FAILED', 'PENDING'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setCertStatus(st);
                    setCertPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    certStatus === st
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === '' ? 'All' : st}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => {
                  setCertSearch(e.target.value);
                  setCertPage(1);
                }}
                placeholder="Search recipient..."
                className="glass-input pl-8 pr-3 py-1 rounded-lg text-xs w-44"
              />
            </div>
          </div>
        </div>

        {isCertsLoading ? (
          <div className="py-16 text-center text-slate-500 animate-pulse">
            Loading certificates...
          </div>
        ) : certs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No certificates match current filters.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/30">
                  <th className="py-3 px-6">Recipient Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Result / Error Details</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {certs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-200">
                      {c.recipient_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {c.recipient_email}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">
                      {c.error_message ? (
                        <span className="text-rose-400 font-mono text-[11px]">
                          {c.error_message}
                        </span>
                      ) : c.completed_at ? (
                        <span className="text-slate-500">
                          {new Date(c.completed_at).toLocaleTimeString()}
                        </span>
                      ) : (
                        <span className="text-slate-600">Pending queue</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewCert(c)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Preview
                      </Button>
                      {c.status === 'COMPLETED' && (
                        <a
                          href={api.getDownloadUrl(job.job_id, c.id)}
                          download={`certificate_${c.recipient_name.replace(/\s+/g, '_')}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Download className="w-3.5 h-3.5 text-indigo-400" />}
                          >
                            PDF
                          </Button>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {certsTotal > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {(certPage - 1) * 20 + 1} to {Math.min(certPage * 20, certsTotal)} of{' '}
              {certsTotal} certificates
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCertPage((p) => Math.max(1, p - 1))}
                disabled={certPage <= 1}
              >
                Previous
              </Button>
              <span className="font-mono text-slate-300">
                {certPage} / {certTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCertPage((p) => Math.min(certTotalPages, p + 1))}
                disabled={certPage >= certTotalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Individual Certificate Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel-card rounded-3xl max-w-4xl w-full p-6 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Certificate Preview: {previewCert.recipient_name}
                </h3>
                <p className="text-xs text-slate-400">
                  Recipient ID: <span className="font-mono">{previewCert.id}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {previewCert.status === 'COMPLETED' && (
                  <a
                    href={api.getDownloadUrl(job.job_id, previewCert.id)}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="glow"
                      size="sm"
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                    >
                      Download PDF
                    </Button>
                  </a>
                )}
                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-2 sm:p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80">
              <CertificatePreview
                templateId={job.template_name}
                recipientName={previewCert.recipient_name}
                courseName={job.course_name}
                organizationName={job.organization_name}
                certificateId={previewCert.id.substring(0, 13).toUpperCase()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
