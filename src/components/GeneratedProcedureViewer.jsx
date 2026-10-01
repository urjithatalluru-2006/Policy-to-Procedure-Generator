import React, { useState } from 'react';
import { 
  Copy, 
  Download, 
  RotateCw, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  ListOrdered, 
  CheckSquare, 
  Edit3, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Users, 
  HelpCircle,
  FileCheck
} from 'lucide-react';

export default function GeneratedProcedureViewer({
  procedure,
  activeCitation,
  onCitationClick,
  onRegenerate,
  onDownloadPdf,
  onCopyClipboard,
  targetAudience,
  procedureFormat,
  setProcedureFormat
}) {
  const [completedSteps, setCompletedSteps] = useState({});
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableNotes, setEditableNotes] = useState('');

  const toggleStepCheck = (id) => {
    setCompletedSteps(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = () => {
    onCopyClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = procedure?.steps || [];
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const isChecklistMode = procedureFormat === 'Checklist';

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden select-text">
      {/* Top Toolbar of Right Column */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Format switcher tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setProcedureFormat('Step-by-Step')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              procedureFormat === 'Step-by-Step'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Step-by-Step</span>
          </button>

          <button
            onClick={() => setProcedureFormat('Checklist')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              procedureFormat === 'Checklist'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklist</span>
            {completedCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {completedCount}/{steps.length}
              </span>
            )}
          </button>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Copy to Clipboard */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700/60 text-xs font-medium transition-all shadow-sm"
            title="Copy procedure markdown to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Copy SOP</span>
              </>
            )}
          </button>

          {/* Download PDF */}
          <button
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700/60 text-xs font-medium transition-all shadow-sm"
            title="Download formatted SOP PDF"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-sm shadow-indigo-600/20"
            title="Re-run RAG generation with current parameters"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* Checklist Progress Bar (if in Checklist mode) */}
      {isChecklistMode && (
        <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Checklist Progress:</span>
            <span className="font-mono text-indigo-400 font-semibold">
              {completedCount} of {steps.length} tasks completed
            </span>
          </div>
          <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main SOP Content Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {/* Document Header & Metadata Badge */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {procedure?.meta?.docId || 'SOP-2025-01'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Grounded with Citations
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  {targetAudience}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {procedure?.meta?.title || 'Standard Operating Procedure'}
              </h1>
            </div>

            <div className="text-left sm:text-right text-[11px] text-slate-400 space-y-0.5 font-mono">
              <div>Effective: <span className="text-slate-200">{procedure?.meta?.effectiveDate}</span></div>
              <div>Est. Duration: <span className="text-slate-200">{procedure?.meta?.estimatedDuration}</span></div>
              <div>Risk Level: <span className="text-amber-400 font-semibold">{procedure?.meta?.riskLevel}</span></div>
            </div>
          </div>

          {/* Objective Box */}
          <div className="pt-4 border-t border-slate-800">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>1. Purpose & Objective</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {procedure?.objective}
            </p>
          </div>

          {/* Prerequisites Box */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>2. Prerequisites & Compliance Readiness</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {procedure?.prerequisites?.map((prereq, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-slate-300"
                >
                  <div className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-mono">
                    {idx + 1}
                  </div>
                  <span className="leading-snug">{prereq}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Numbered, Actionable Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
              <span>3. Step-by-Step Action Procedure</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              Click citation badge to view source clause
            </span>
          </div>

          {steps.map((step) => {
            const isStepActiveCitation = activeCitation === step.citation;
            const isChecked = completedSteps[step.id];

            return (
              <div
                key={step.id}
                className={`rounded-2xl border transition-all duration-300 ${
                  isChecked
                    ? 'bg-slate-900/40 border-emerald-900/40 opacity-75'
                    : isStepActiveCitation
                    ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Step Top Bar */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {isChecklistMode ? (
                      <button
                        onClick={() => toggleStepCheck(step.id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-emerald-600 text-white border border-emerald-500 shadow-sm'
                            : 'border-2 border-slate-600 hover:border-indigo-400 bg-slate-950 text-transparent'
                        }`}
                        title="Toggle task completion"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    ) : (
                      <div className="w-7 h-7 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {step.stepNumber}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Role: {step.role}
                        </span>
                      </div>
                      <h3 className={`text-sm font-semibold tracking-tight ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Inline Citation Badge */}
                  {step.citationBadge && (
                    <button
                      onClick={() => onCitationClick(step.citation)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all group shrink-0 ${
                        isStepActiveCitation
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                          : 'bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-indigo-500/40 hover:border-indigo-500'
                      }`}
                      title={`Inspect grounded clause ${step.citationBadge} in source document`}
                    >
                      <span>{step.citationBadge}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>

                {/* Step Action Description & Substeps */}
                <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3 border-t border-slate-800/60">
                  <p className="text-xs text-slate-300 leading-relaxed mt-3">
                    {step.description}
                  </p>

                  {/* Substeps checklist */}
                  {step.substeps && step.substeps.length > 0 && (
                    <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        Action Items:
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {step.substeps.map((sub, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <span className="leading-snug">{sub}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warning Callout */}
                  {step.warning && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-amber-200">Compliance Warning:</span>
                        <span>{step.warning}</span>
                      </div>
                    </div>
                  )}

                  {/* Pro-Tip Callout */}
                  {step.tip && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs">
                      <Lightbulb className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-indigo-200">Operational Best Practice:</span>
                        <span>{step.tip}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 4: Governance & Audit Sign-Off */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Governance & Audit Trail</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">ISO 27001 Annex A.9</span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            {procedure?.governanceNotes?.map((note, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Generated via Policy-to-Procedure Engine</span>
            <span>RAG Model: gemini-3.8-flash-rag-v2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
