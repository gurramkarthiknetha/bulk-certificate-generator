import React from 'react';
import { Award, CheckCircle, ShieldCheck } from 'lucide-react';

interface CertificatePreviewProps {
  templateId: 'classic_gold' | 'modern_minimal' | 'academic' | string;
  recipientName?: string;
  courseName?: string;
  organizationName?: string;
  issueDate?: string;
  certificateId?: string;
  signerName?: string;
  signerTitle?: string;
  compact?: boolean;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  templateId = 'classic_gold',
  recipientName = 'Jane Doe',
  courseName = 'Advanced Full-Stack Engineering Program',
  organizationName = 'Global Tech Academy',
  issueDate = new Date().toISOString().split('T')[0],
  certificateId = 'CERT-2025-A8F90B',
  signerName = 'Dr. Alexander Vance',
  signerTitle = 'Director of Academic Affairs',
  compact = false,
}) => {
  const containerClasses = compact
    ? 'w-full aspect-[1.414/1] rounded-lg overflow-hidden text-[9px] select-none shadow-md'
    : 'w-full aspect-[1.414/1] max-w-3xl mx-auto rounded-2xl overflow-hidden select-none transition-transform duration-300 shadow-2xl';

  if (templateId === 'modern_minimal') {
    return (
      <div
        className={`${containerClasses} bg-white text-slate-900 border border-slate-200 flex flex-col justify-between p-6 sm:p-10 relative`}
      >
        {/* Top Minimal Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />

        {/* Header */}
        <div className="flex justify-between items-start mt-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold">
              {organizationName}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Certificate of Completion
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="my-auto text-center py-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">This is proudly awarded to</p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 my-2 tracking-tight">
            {recipientName || 'Recipient Name'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            for successfully completing the rigorous requirements and final examination for
          </p>
          <p className="text-sm sm:text-lg font-bold text-indigo-700 mt-1">
            {courseName || 'Course Title'}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 flex justify-between items-end text-slate-600 text-[11px]">
          <div>
            <p className="font-mono text-[10px] text-slate-400">ID: {certificateId}</p>
            <p className="text-slate-500 mt-0.5">Issued: {issueDate}</p>
          </div>
          <div className="text-center">
            <div className="w-24 sm:w-32 border-b border-slate-400 pb-1 mb-1 font-serif italic text-xs text-slate-800">
              {signerName}
            </div>
            <p className="text-[10px] font-medium text-slate-500">{signerTitle}</p>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'academic') {
    return (
      <div
        className={`${containerClasses} bg-[#fdfbf7] text-[#1c1917] border-8 border-double border-[#3730a3] p-6 sm:p-10 flex flex-col justify-between relative`}
      >
        {/* Subtle Watermark Crest */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <Award className="w-80 h-80 text-indigo-900" />
        </div>

        {/* Header */}
        <div className="text-center">
          <p className="font-serif tracking-widest text-xs uppercase text-indigo-950 font-semibold">
            {organizationName}
          </p>
          <div className="w-12 h-0.5 bg-indigo-900 mx-auto my-1.5" />
          <h2 className="font-serif text-xl sm:text-3xl font-bold tracking-wide text-indigo-950">
            DIPLOMA OF EXCELLENCE
          </h2>
        </div>

        {/* Body */}
        <div className="text-center my-auto py-2">
          <p className="font-serif italic text-xs sm:text-sm text-stone-600">
            Be it known that upon official recommendation of the faculty,
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 my-2 tracking-normal underline decoration-indigo-300 decoration-1 underline-offset-8">
            {recipientName || 'Recipient Name'}
          </h1>
          <p className="font-serif text-xs sm:text-sm text-stone-700 max-w-lg mx-auto leading-relaxed">
            has successfully fulfilled all academic criteria, practical modules, and honors curriculum of
          </p>
          <p className="font-serif text-base sm:text-xl font-bold text-indigo-900 mt-1.5">
            {courseName || 'Course Title'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end border-t border-indigo-200/60 pt-4 text-[11px]">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-950 font-serif font-semibold">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Conferred with Distinction</span>
            </div>
            <p className="font-mono text-[9px] text-stone-400 mt-1">UUID: {certificateId}</p>
          </div>
          <div className="text-center">
            <div className="w-28 sm:w-36 border-b border-stone-800 pb-1 mb-1 font-serif italic text-xs text-stone-900">
              {signerName}
            </div>
            <p className="font-serif text-[10px] text-stone-600">{signerTitle}</p>
          </div>
        </div>
      </div>
    );
  }

  // Classic Gold (Default)
  return (
    <div
      className={`${containerClasses} bg-[#fffef7] text-[#1c1917] p-5 sm:p-9 flex flex-col justify-between relative border-[6px] border-[#c5a55a] shadow-2xl`}
    >
      {/* Inner Gold Frame */}
      <div className="absolute inset-2 border-2 border-[#d4af37] pointer-events-none rounded-sm" />
      {/* Corner Ornaments */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#c5a55a] pointer-events-none" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#c5a55a] pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#c5a55a] pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#c5a55a] pointer-events-none" />

      {/* Header */}
      <div className="text-center relative z-10 pt-2">
        <p className="text-[11px] sm:text-xs tracking-[0.25em] uppercase font-bold text-[#b48a3c]">
          {organizationName}
        </p>
        <h2 className="text-xl sm:text-3xl font-serif font-extrabold text-[#1a2238] tracking-wider mt-1">
          CERTIFICATE OF ACHIEVEMENT
        </h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#c5a55a] to-transparent mx-auto mt-1" />
      </div>

      {/* Main Body */}
      <div className="text-center my-auto py-2 relative z-10">
        <p className="italic font-serif text-xs sm:text-sm text-[#555] mb-1">
          This is proudly presented to
        </p>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#111827] tracking-tight my-2">
          {recipientName || 'Recipient Name'}
        </h1>
        <p className="text-xs sm:text-sm text-[#4b5563] max-w-md mx-auto leading-relaxed">
          in formal recognition of outstanding accomplishment, active participation, and completion of
        </p>
        <p className="text-sm sm:text-lg font-serif font-bold text-[#1a2238] mt-1.5">
          {courseName || 'Course Title'}
        </p>
      </div>

      {/* Footer / Signatures */}
      <div className="flex justify-between items-end relative z-10 pt-2 border-t border-[#e5d5a6] text-[11px]">
        <div>
          <p className="font-mono text-[9px] text-stone-400">Certificate ID: {certificateId}</p>
          <p className="text-[#6b7280] text-[10px] mt-0.5">Date: {issueDate}</p>
        </div>

        {/* Gold Seal Graphic */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#c5a55a] bg-gradient-to-br from-[#f9f5e8] to-[#eedc9b] flex items-center justify-center shadow-md">
            <CheckCircle className="w-5 h-5 text-[#b48a3c]" />
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider text-[#996515] mt-0.5">
            Official Seal
          </span>
        </div>

        <div className="text-center">
          <div className="w-28 sm:w-36 border-b border-[#1f2937] pb-1 mb-1 font-serif italic text-xs text-[#111827]">
            {signerName}
          </div>
          <p className="text-[10px] font-medium text-[#4b5563]">{signerTitle}</p>
        </div>
      </div>
    </div>
  );
};
