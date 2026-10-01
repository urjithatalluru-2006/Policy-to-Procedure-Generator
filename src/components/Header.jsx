import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck2, 
  Download, 
  ChevronDown, 
  FileText, 
  FileCode, 
  Copy, 
  Printer, 
  Sparkles, 
  PlusCircle, 
  Check, 
  Layers,
  Menu,
  ShieldAlert
} from 'lucide-react';

export default function Header({
  hasGeneratedProcedure,
  onReset,
  sidebarOpen,
  setSidebarOpen,
  onExport,
  activePolicyTitle,
  activeFormat
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportSelect = (format) => {
    setCopiedFormat(format);
    onExport(format);
    setTimeout(() => {
      setCopiedFormat(null);
      setExportOpen(false);
    }, 1200);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 select-none">
      {/* Left side: Brand + Mobile Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-white flex items-center gap-1.5">
                Policy-to-Procedure
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  RAG v2.4
                </span>
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Enterprise Policy Grounding Engine
            </span>
          </div>
        </div>

        {activePolicyTitle && hasGeneratedProcedure && (
          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-xs">
            <span className="text-slate-400">Current SOP:</span>
            <span className="font-medium text-slate-200 max-w-[220px] truncate" title={activePolicyTitle}>
              {activePolicyTitle}
            </span>
            <span className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 text-slate-300 border border-slate-700">
              {activeFormat}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2.5">
        {hasGeneratedProcedure && (
          <button
            onClick={onReset}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Conversion</span>
          </button>
        )}

        {/* Export Button & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            disabled={!hasGeneratedProcedure}
            onClick={() => setExportOpen(!exportOpen)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm ${
              hasGeneratedProcedure
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:shadow-md cursor-pointer'
                : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
            }`}
            title={hasGeneratedProcedure ? "Export generated procedure" : "Generate a procedure first to enable export"}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
          </button>

          {exportOpen && hasGeneratedProcedure && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-1.5 z-50 animate-slide-up">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Export Options
              </div>

              <button
                onClick={() => handleExportSelect('pdf')}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-medium">Print / PDF Document</div>
                    <div className="text-[10px] text-slate-400">Standard SOP print layout</div>
                  </div>
                </div>
                {copiedFormat === 'pdf' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => handleExportSelect('markdown')}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-medium">Markdown (.md)</div>
                    <div className="text-[10px] text-slate-400">For GitHub / Notion wiki</div>
                  </div>
                </div>
                {copiedFormat === 'markdown' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => handleExportSelect('clipboard')}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-medium">Copy Plain Text</div>
                    <div className="text-[10px] text-slate-400">Formatted with citations</div>
                  </div>
                </div>
                {copiedFormat === 'clipboard' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
