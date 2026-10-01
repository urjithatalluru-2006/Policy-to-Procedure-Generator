import React, { useState } from 'react';
import SourceDocumentViewer from './SourceDocumentViewer';
import GeneratedProcedureViewer from './GeneratedProcedureViewer';
import { Columns, FileText, CheckSquare, Maximize2, Sparkles } from 'lucide-react';

export default function ResultsSplitView({
  policy,
  procedure,
  targetAudience,
  procedureFormat,
  setProcedureFormat,
  onRegenerate,
  onDownloadPdf,
  onCopyClipboard,
  activeCitation,
  setActiveCitation
}) {
  const [mobileTab, setMobileTab] = useState('procedure'); // 'document' or 'procedure'
  const [splitRatio, setSplitRatio] = useState(50); // 50% / 50%

  const handleCitationClick = (citationKey) => {
    setActiveCitation(citationKey);
    // On mobile, if user clicks citation badge, switch to document tab to inspect
    if (window.innerWidth < 1024) {
      setMobileTab('document');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center justify-around border-b border-slate-800 bg-slate-900 px-4 py-2 shrink-0">
        <button
          onClick={() => setMobileTab('document')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mobileTab === 'document'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Source Document</span>
          {activeCitation && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setMobileTab('procedure')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mobileTab === 'procedure'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Generated SOP</span>
        </button>
      </div>

      {/* Main Split Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Source Document Viewer */}
        <div 
          className={`h-full flex-col lg:flex ${
            mobileTab === 'document' ? 'flex w-full' : 'hidden'
          } lg:w-1/2`}
        >
          <SourceDocumentViewer
            policy={policy}
            activeCitation={activeCitation}
            onCitationClick={handleCitationClick}
          />
        </div>

        {/* Right Column: Generated Procedure Viewer */}
        <div 
          className={`h-full flex-col lg:flex ${
            mobileTab === 'procedure' ? 'flex w-full' : 'hidden'
          } lg:w-1/2`}
        >
          <GeneratedProcedureViewer
            procedure={procedure}
            activeCitation={activeCitation}
            onCitationClick={handleCitationClick}
            onRegenerate={onRegenerate}
            onDownloadPdf={onDownloadPdf}
            onCopyClipboard={onCopyClipboard}
            targetAudience={targetAudience}
            procedureFormat={procedureFormat}
            setProcedureFormat={setProcedureFormat}
          />
        </div>
      </div>
    </div>
  );
}
