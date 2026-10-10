import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CertificatePreview } from '@/components/certificates/CertificatePreview';
import { Certificate } from '@/types';

export const CertificatesListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['all-certificates', page, status, search],
    queryFn: () =>
      api.listAllCertificates({
        page,
        page_size: 20,
        status: status || undefined,
        search: search.trim() || undefined,
      }),
  });

  const certs = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Certificates Explorer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global repository of issued credentials with instant PDF retrieval and validation audits.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          isLoading={isFetching}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
        >
          Refresh Records
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {['', 'COMPLETED', 'FAILED', 'PENDING'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatus(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  status === st
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st === '' ? 'All Statuses' : st}
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search recipient name..."
              className="glass-input w-full pl-9 pr-4 py-1.5 rounded-xl text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card>
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 animate-pulse">
            Loading certificates...
          </div>
        ) : certs.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-200">No certificates found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Certificates appear here as background batch generation runs.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/40">
                  <th className="py-3.5 px-6">Recipient Name</th>
                  <th className="py-3.5 px-4">Recipient Email</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Batch Job ID</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {certs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-200">
                      {c.recipient_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {c.recipient_email}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      <Link
                        to={`/jobs/${c.job_id}`}
                        className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                      >
                        <span>{c.job_id.substring(0, 8)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString()}
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
                          href={api.getDownloadUrl(c.job_id, c.id)}
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
        {total > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} items
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
              <span className="font-mono text-slate-300">
                {page} / {totalPages}
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

      {/* Modal Preview */}
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
                    href={api.getDownloadUrl(previewCert.job_id, previewCert.id)}
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
                templateId="classic_gold"
                recipientName={previewCert.recipient_name}
                courseName="Accredited Certificate Program"
                organizationName="Certified Academy"
                certificateId={previewCert.id.substring(0, 13).toUpperCase()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
