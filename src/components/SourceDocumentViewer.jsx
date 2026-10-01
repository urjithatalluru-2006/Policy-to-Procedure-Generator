import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Highlighter, 
  Sparkles,
  AlignLeft,
  Layers
} from 'lucide-react';

export default function SourceDocumentViewer({
  policy,
  activeCitation,
  onCitationClick
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('clauses'); // 'clauses' | 'rawText'
  const containerRef = useRef(null);

  // Auto-scroll to highlighted section when activeCitation changes
  useEffect(() => {
    if (activeCitation && viewMode === 'clauses') {
      const el = document.getElementById(`doc-clause-${activeCitation}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeCitation, viewMode]);

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(130, Math.max(80, prev + delta)));
  };

  const sections = policy?.sourceContent?.sections || [];
  const highlightedClauses = sections.filter(s => s.isHighlighted);
  const rawText = policy?.sourceContent?.rawText || sections.map(s => `${s.number} ${s.title}\n${s.content}`).join('\n\n');

  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-800 select-text overflow-hidden">
      {/* Top Toolbar of Source Document Viewer */}
      <div className="h-12 border-b border-slate-800 bg-slate-950/80 px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Document info & mode switcher */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-200 block truncate" title={policy?.fileName}>
              {policy?.fileName || 'Source_Document.pdf'}
            </span>
          </div>
          
          {/* Mode Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => setViewMode('clauses')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                viewMode === 'clauses'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Grounded Clauses</span>
            </button>
            <button
              onClick={() => setViewMode('rawText')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                viewMode === 'rawText'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignLeft className="w-3 h-3" />
              <span>Raw Text</span>
            </button>
          </div>
        </div>

        {/* Center: Pagination & Quick Navigator */}
        <div className="flex items-center gap-2">
          {/* Document Clause Quick Navigator */}
          {viewMode === 'clauses' && (
            <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400">
              <Highlighter className="w-3 h-3 text-indigo-400" />
              <span className="text-slate-500">Clauses:</span>
              {highlightedClauses.slice(0, 5).map((clause) => {
                const isSelected = activeCitation === clause.citationKey;
                return (
                  <button
                    key={clause.id}
                    onClick={() => onCitationClick(clause.citationKey)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold ring-1 ring-indigo-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={clause.highlightLabel}
                  >
                    {clause.badgeText}
                  </button>
                );
              })}
            </div>
          )}

          <div className="h-4 w-px bg-slate-800 hidden xl:block" />

          {/* Page indicator */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-400">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="font-mono text-slate-200 px-1">{currentPage}</span>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-slate-400 px-1">{policy?.pages || 1}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(policy?.pages || 1, p + 1))}
              disabled={currentPage >= (policy?.pages || 1)}
              className="hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Zoom controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
            <button
              onClick={() => handleZoom(-10)}
              className="p-1 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-300 min-w-[34px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => handleZoom(10)}
              className="p-1 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notice Banner showing Highlight Sync status */}
      <div className="bg-indigo-950/40 border-b border-indigo-900/40 px-4 py-1.5 flex items-center justify-between text-[11px] text-indigo-300">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>{highlightedClauses.length} RAG-retrieved policy clauses highlighted in source document</span>
        </span>
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          Click badges in procedure to jump
        </span>
      </div>

      {/* Main Document Content Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/70"
      >
        <div 
          className="mx-auto transition-transform duration-200 origin-top"
          style={{ 
            maxWidth: '720px', 
            transform: `scale(${zoomLevel / 100})` 
          }}
        >
          {/* Document Page Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-10 relative text-slate-300 text-xs leading-relaxed space-y-6">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <span className="text-5xl font-black rotate-45 uppercase tracking-widest text-white text-center">
                {policy?.sourceContent?.documentHeader?.classification || 'CONFIDENTIAL'}
              </span>
            </div>

            {/* Document Formal Header */}
            <div className="border-b border-slate-800 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-semibold">
                    {policy?.sourceContent?.documentHeader?.org || 'Enterprise Policy Operations'}
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                    {policy?.title}
                  </h1>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                  <div>{policy?.sourceContent?.documentHeader?.docRef || 'DOC-REF-01'}</div>
                  <div className="text-amber-400/90 font-medium">
                    {policy?.sourceContent?.documentHeader?.classification || 'Confidential'}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400">
                <div>
                  <span className="text-slate-500 block">Version:</span>
                  <span className="font-mono text-slate-300 font-medium">{policy?.version || 'v1.0'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Effective:</span>
                  <span className="text-slate-300">{policy?.sourceContent?.documentHeader?.effectiveDate || 'Current'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Standard:</span>
                  <span className="text-slate-300">{policy?.compliance || 'Policy Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Source Format:</span>
                  <span className="text-slate-300 uppercase">{policy?.fileName?.split('.').pop() || 'PDF'}</span>
                </div>
              </div>
            </div>

            {/* Raw Text View Mode */}
            {viewMode === 'rawText' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-300">Extracted Document Text</span>
                  <span className="font-mono text-[10px]">{rawText.length.toLocaleString()} characters</span>
                </div>
                <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 overflow-x-auto max-h-[600px] overflow-y-auto">
                  {rawText}
                </div>
              </div>
            ) : (
              /* Structured Sections & Highlighted Clauses Mode */
              <div className="space-y-6">
                {sections.map((section) => {
                  const isSelected = activeCitation === section.citationKey;
                  return (
                    <div
                      key={section.id}
                      id={`doc-clause-${section.citationKey || section.id}`}
                      className={`rounded-xl transition-all duration-300 ${
                        section.isHighlighted
                          ? isSelected
                            ? 'p-4 bg-indigo-950/40 border-l-4 border-indigo-400 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500/30'
                            : 'p-4 bg-indigo-950/20 border-l-4 border-indigo-500/70 hover:bg-indigo-950/30 hover:border-indigo-400'
                          : 'p-2'
                      }`}
                    >
                      {/* Section Number & Title */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100 text-xs">
                            {section.number}
                          </span>
                          <h2 className="font-semibold text-slate-100 text-xs tracking-tight">
                            {section.title}
                          </h2>
                        </div>

                        {section.isHighlighted && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-medium">
                              {section.badgeText}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium animate-pulse">
                                Active Reference
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Section Body */}
                      <p className={`leading-relaxed whitespace-pre-wrap ${section.isHighlighted ? 'text-slate-200' : 'text-slate-400'}`}>
                        {section.content}
                      </p>

                      {/* RAG Context Callout / Annotation note */}
                      {section.isHighlighted && section.note && (
                        <div className="mt-2.5 pt-2 border-t border-indigo-900/40 flex items-start gap-2 text-[11px] text-indigo-300/90 font-mono">
                          <span className="text-indigo-400 font-bold">RAG Grounding Note:</span>
                          <span>{section.note}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Document Page Footer */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{policy?.sourceContent?.documentHeader?.org || 'Enterprise Policy Operations'}</span>
              <span>Page {currentPage} of {policy?.pages || 1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
