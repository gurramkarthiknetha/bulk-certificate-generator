import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  PlusCircle,
  Eye,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { CertificatePreview } from '@/components/certificates/CertificatePreview';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { RecipientInput } from '@/types';

const SAMPLE_CSV = `name,email
Alice Johnson,alice.johnson@example.com
Bob Smith,bob.smith@example.com
Clara Rodriguez,clara.rodriguez@example.com
David Chen,david.chen@example.com
Emma Watson,emma.watson@example.com
Fiona Gallagher,fiona.g@example.com
George Miller,george.miller@example.com
Hannah Abbott,hannah.abbott@example.com
Ian Malcolm,ian.malcolm@example.com
Julia Roberts,julia.roberts@example.com`;

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [courseName, setCourseName] = useState('Executive Cloud Architecture & DevOps Masterclass');
  const [organizationName, setOrganizationName] = useState('Global Institute of Technology');
  const [templateName, setTemplateName] = useState<'classic_gold' | 'modern_minimal' | 'academic'>(
    'classic_gold'
  );
  const [signerName, setSignerName] = useState('Dr. Marcus Sterling');
  const [signerTitle, setSignerTitle] = useState('Dean of Engineering');

  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState(SAMPLE_CSV);
  const [recipients, setRecipients] = useState<RecipientInput[]>([
    { name: 'Alice Johnson', email: 'alice.johnson@example.com' },
    { name: 'Bob Smith', email: 'bob.smith@example.com' },
    { name: 'Clara Rodriguez', email: 'clara.rodriguez@example.com' },
    { name: 'David Chen', email: 'david.chen@example.com' },
    { name: 'Emma Watson', email: 'emma.watson@example.com' },
    { name: 'Fiona Gallagher', email: 'fiona.g@example.com' },
    { name: 'George Miller', email: 'george.miller@example.com' },
    { name: 'Hannah Abbott', email: 'hannah.abbott@example.com' },
    { name: 'Ian Malcolm', email: 'ian.malcolm@example.com' },
    { name: 'Julia Roberts', email: 'julia.roberts@example.com' },
  ]);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(
    () => `batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );

  // Parse CSV text into recipients list
  const parseCSV = (content: string) => {
    const lines = content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setRecipients([]);
      setValidationErrors(['CSV content is empty']);
      return;
    }

    const header = lines[0].toLowerCase();
    const isHeader = header.includes('name') || header.includes('email');
    const dataRows = isHeader ? lines.slice(1) : lines;

    const parsed: RecipientInput[] = [];
    const errors: string[] = [];

    dataRows.forEach((row, idx) => {
      // Split by comma while supporting quotes
      const parts = row.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      const name = parts[0] || '';
      const email = parts[1] || '';

      if (!name) {
        errors.push(`Row ${idx + 1}: Missing recipient name`);
      }
      if (!email || !email.includes('@')) {
        errors.push(`Row ${idx + 1}: Invalid email address "${email}"`);
      }

      parsed.push({ name, email });
    });

    setRecipients(parsed);
    setValidationErrors(errors);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      parseCSV(content);
      success('CSV File Imported', `Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleApplyRawText = () => {
    parseCSV(rawText);
    success('Recipients Parsed', `Parsed ${recipients.length} recipients`);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'recipients_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadPreset = (count: number) => {
    const sampleNames = [
      'Alexander Vance', 'Sophia Turner', 'Liam Nguyen', 'Olivia Martinez',
      'Noah Williams', 'Emma Davis', 'James Wilson', 'Mia Anderson',
      'Ethan Thomas', 'Charlotte White', 'Lucas Harris', 'Amelia Martin',
      'Benjamin Thompson', 'Harper Garcia', 'Henry Martinez', 'Evelyn Robinson',
      'Oliver Clark', 'Abigail Rodriguez', 'Elijah Lewis', 'Emily Lee'
    ];
    const generated: RecipientInput[] = [];
    for (let i = 1; i <= count; i++) {
      const baseName = sampleNames[(i - 1) % sampleNames.length];
      const name = `${baseName} ${i > 20 ? `#${i}` : ''}`.trim();
      const email = `recipient.${i}@example.com`;
      generated.push({ name, email });
    }
    setRecipients(generated);
    setRawText(`name,email\n` + generated.map((r) => `${r.name},${r.email}`).join('\n'));
    setValidationErrors([]);
    success('Sample Data Loaded', `Generated ${count} test recipients`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseName.trim()) {
      error('Course name required', 'Please provide a valid program or course title');
      return;
    }
    if (!organizationName.trim()) {
      error('Organization name required', 'Please provide your organization name');
      return;
    }
    if (recipients.length === 0) {
      error('No recipients provided', 'Please add at least one recipient');
      return;
    }
    if (validationErrors.length > 0) {
      error('Validation errors present', 'Please fix the highlighted recipient errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createJob(
        {
          course_name: courseName.trim(),
          organization_name: organizationName.trim(),
          template_name: templateName,
          recipients: recipients.map((r) => ({
            name: r.name.trim(),
            email: r.email.trim(),
          })),
        },
        idempotencyKey.trim()
      );

      success('Generation Batch Enqueued!', `Job ID: ${response.job_id}`);
      navigate(`/jobs/${response.job_id}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to submit job';
      error('Submission Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
          Create Bulk Certificate Batch
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure certificate styling, upload or paste recipients, and trigger parallel background issuance.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form */}
        <div className="xl:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Certificate Metadata Card */}
            <Card>
              <CardHeader
                title="1. Credential Program Information"
                subtitle="Organization and achievement details printed on every certificate"
              />
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Course / Program Name *
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    required
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                    placeholder="e.g. Master in Artificial Intelligence & Deep Learning"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Issuing Organization *
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      required
                      className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                      placeholder="e.g. Global Tech Institute"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Authorized Signer Name
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                      placeholder="e.g. Dr. Alexander Vance"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Signer Title / Role
                  </label>
                  <input
                    type="text"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                    placeholder="e.g. Vice Chancellor / Academic Director"
                  />
                </div>
              </div>
            </Card>

            {/* Template Selection Card */}
            <Card>
              <CardHeader
                title="2. Choose Certificate Template"
                subtitle="Select from ReportLab compiled vector templates"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    id: 'classic_gold',
                    title: 'Classic Gold',
                    desc: 'Gold double ornamental border, official seal, serif fonts',
                  },
                  {
                    id: 'modern_minimal',
                    title: 'Modern Minimal',
                    desc: 'Crisp contemporary styling, navy accent banner, sans-serif',
                  },
                  {
                    id: 'academic',
                    title: 'Academic',
                    desc: 'Traditional university double-crest border with distinction seal',
                  },
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setTemplateName(tmpl.id as any)}
                    className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                      templateName === tmpl.id
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-100">{tmpl.title}</span>
                        {templateName === tmpl.id && (
                          <CheckCircle className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tmpl.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Recipients Data Input Card */}
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 tracking-tight">
                    3. Recipient Data List
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ingest {recipients.length} recipients for bulk processing
                  </p>
                </div>
                {/* Presets and sample download */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSample}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Sample CSV
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleLoadPreset(50)}
                  >
                    +50 Demo
                  </Button>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="flex border-b border-slate-800 mb-4">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`pb-2.5 px-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors ${
                    inputMode === 'upload'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  File Upload (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`pb-2.5 px-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors ${
                    inputMode === 'paste'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Paste Raw CSV / Text
                </button>
              </div>

              {inputMode === 'upload' ? (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-2xl cursor-pointer bg-slate-900/30 hover:bg-slate-900/50 transition-all group">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">
                      Click to upload or drag & drop CSV
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Expected columns: <span className="font-mono text-indigo-300">name, email</span>
                    </p>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="name,email&#10;Alice,alice@example.com&#10;Bob,bob@example.com"
                    className="glass-input w-full p-3.5 rounded-xl font-mono text-xs leading-relaxed resize-y"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleApplyRawText}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Parse & Validate Text
                    </Button>
                  </div>
                </div>
              )}

              {/* Validation Feedback */}
              {validationErrors.length > 0 && (
                <div className="mt-4 p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>{validationErrors.length} validation errors detected:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 opacity-90 pl-1 max-h-24 overflow-y-auto">
                    {validationErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li>...and {validationErrors.length - 5} more issues</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Recipient preview snippet */}
              {recipients.length > 0 && (
                <div className="mt-4 border border-slate-800/80 rounded-xl overflow-hidden">
                  <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-300 flex justify-between">
                    <span>Recipient Preview ({recipients.length} total)</span>
                    <span className="text-emerald-400">Ready for batch queue</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                    {recipients.slice(0, 10).map((r, i) => (
                      <div key={i} className="px-4 py-2 flex items-center justify-between hover:bg-slate-900/30">
                        <span className="font-medium text-slate-200">{r.name}</span>
                        <span className="font-mono text-slate-400">{r.email}</span>
                      </div>
                    ))}
                  </div>
                  {recipients.length > 10 && (
                    <div className="bg-slate-900/40 px-4 py-1.5 text-center text-[11px] text-slate-500">
                      Showing first 10 of {recipients.length} recipients
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Idempotency & Submit Card */}
            <Card className="border-indigo-500/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Idempotency Key:</span>
                    <input
                      type="text"
                      value={idempotencyKey}
                      onChange={(e) => setIdempotencyKey(e.target.value)}
                      className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 w-56"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Guarantees exactly-once batch creation even if network re-tries.
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={recipients.length === 0 || validationErrors.length > 0}
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Launch Generation ({recipients.length} Certs)
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {/* Right: Real-time Live Certificate Preview */}
        <div className="xl:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Live Output Preview
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Vector PDF Emulation
            </span>
          </div>

          <div className="p-3 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <CertificatePreview
              templateId={templateName}
              recipientName={recipients[0]?.name || 'Jane Doe'}
              courseName={courseName}
              organizationName={organizationName}
              signerName={signerName}
              signerTitle={signerTitle}
            />
          </div>

          <p className="text-xs text-center text-slate-500 leading-relaxed px-4">
            Changes to program title, organization, signer, and template reflect live above before issuing.
          </p>
        </div>
      </div>
    </div>
  );
};
