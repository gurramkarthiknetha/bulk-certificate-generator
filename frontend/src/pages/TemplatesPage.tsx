import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Award,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { CertificatePreview } from '@/components/certificates/CertificatePreview';

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic_gold');
  const [demoName, setDemoName] = useState('Eleanor Vance');
  const [demoCourse, setDemoCourse] = useState('Enterprise Cloud Engineering & Distributed Systems');
  const [demoOrg, setDemoOrg] = useState('Apex Technology Institute');

  const TEMPLATES = [
    {
      id: 'classic_gold',
      name: 'Classic Gold',
      badge: 'Most Popular',
      description:
        'An elegant design featuring high-resolution gold ornamental double borders, official certification seal, and traditional serif typography.',
      features: ['24k Gold Hue Accents', 'Official Gold Foil Seal', 'Double Ornate Border', 'Signer Line'],
    },
    {
      id: 'modern_minimal',
      name: 'Modern Minimal',
      badge: 'High-Tech',
      description:
        'A clean contemporary layout with bold indigo and cobalt geometric banner accents, modern sans-serif typography, and verification badge.',
      features: ['Gradient Top Banner', 'Verification Shield', 'Crisp Geometry', 'Modern Typography'],
    },
    {
      id: 'academic',
      name: 'Academic Diploma',
      badge: 'Collegiate',
      description:
        'Traditional collegiate diploma aesthetic with formal double-rule border, university crest watermark, and honors distinction notations.',
      features: ['Watermark Crest', 'Double Rule Border', 'Honors Distinction', 'Diploma Layout'],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Certificate Design Gallery
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Production ReportLab vector templates compiled into print-ready A4 landscape PDFs.
          </p>
        </div>
        <Button
          variant="glow"
          size="sm"
          onClick={() => navigate('/create')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Use Template in Batch
        </Button>
      </div>

      {/* Template Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => setSelectedTemplate(tmpl.id)}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              selectedTemplate === tmpl.id
                ? 'border-indigo-500 bg-indigo-950/30 shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {tmpl.badge}
                </span>
                {selectedTemplate === tmpl.id && (
                  <CheckCircle className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mt-1">{tmpl.name}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tmpl.description}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-1.5">
              {tmpl.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Live Studio Card */}
      <Card>
        <CardHeader
          title="Interactive Preview Studio"
          subtitle="Customize sample fields to test typography fitting and visual alignment"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sample Recipient
            </label>
            <input
              type="text"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Program Name
            </label>
            <input
              type="text"
              value={demoCourse}
              onChange={(e) => setDemoCourse(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Organization
            </label>
            <input
              type="text"
              value={demoOrg}
              onChange={(e) => setDemoOrg(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Live Vector Emulation Preview */}
        <div className="p-4 sm:p-10 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl flex items-center justify-center">
          <CertificatePreview
            templateId={selectedTemplate}
            recipientName={demoName}
            courseName={demoCourse}
            organizationName={demoOrg}
          />
        </div>
      </Card>
    </div>
  );
};
