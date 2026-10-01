import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  Check, 
  ChevronDown, 
  Users, 
  ListOrdered, 
  AlertCircle, 
  FileUp, 
  Trash2,
  FileCheck,
  Zap,
  ArrowRight,
  Shield,
  Loader2
} from 'lucide-react';
import { AUDIENCE_OPTIONS, FORMAT_OPTIONS, PRESET_POLICIES } from '../data/mockData';
import { extractTextFromFile } from '../services/fileExtractor';

export default function UploadView({
  selectedFile,
  setSelectedFile,
  targetAudience,
  setTargetAudience,
  procedureFormat,
  setProcedureFormat,
  onGenerate,
  onLoadPreset
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setUploadError('Please upload a valid document (.PDF, .DOCX, .TXT, or .MD)');
      return;
    }

    setUploadError(null);

    const initialFileState = {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.name.toLowerCase().endsWith('.pdf') 
        ? 'PDF' 
        : file.name.toLowerCase().endsWith('.docx') 
        ? 'DOCX' 
        : 'TXT',
      rawFile: file,
      isCustom: true,
      isExtracting: true,
      extractedText: '',
      extractedSections: [],
      pages: 1
    };

    setSelectedFile(initialFileState);

    try {
      const extracted = await extractTextFromFile(file);
      setSelectedFile(prev => ({
        ...prev,
        isExtracting: false,
        extractedText: extracted.rawText,
        extractedSections: extracted.sections,
        pages: extracted.pages,
        wordCount: extracted.rawText.split(/\s+/).filter(Boolean).length
      }));
    } catch (err) {
      console.error('Failed to extract text from document:', err);
      setUploadError('Failed to parse document text: ' + (err.message || 'Unknown error'));
      setSelectedFile(prev => ({
        ...prev,
        isExtracting: false
      }));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Semantic Policy RAG Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Transform Enterprise Policies into Actionable SOPs
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Upload an existing compliance policy, code of conduct, or security manual. Our RAG engine extracts relevant clauses and synthesizes grounded, step-by-step procedures.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {!selectedFile ? (
          /* Drag and Drop Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-950/50 hover:bg-slate-950/80'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
            
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-indigo-400 animate-pulse-subtle" />
            </div>

            <h3 className="text-base font-semibold text-slate-200 mb-1">
              Drag & Drop your policy document here
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Supports <span className="text-slate-300 font-medium">PDF, DOCX, or TXT</span> up to 50MB
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Browse Local Files</span>
            </button>
          </div>
        ) : (
          /* Selected File Preview Card */
          <div className="p-5 rounded-xl bg-slate-950/80 border border-indigo-500/30 shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">{selectedFile.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {selectedFile.type || 'DOCUMENT'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{selectedFile.size || '2.4 MB'}</span>
                  <span>•</span>
                  {selectedFile.isExtracting ? (
                    <span className="text-indigo-400 flex items-center gap-1.5 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Extracting text from document...
                    </span>
                  ) : selectedFile.extractedText ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" />
                      Extracted {selectedFile.wordCount?.toLocaleString() || selectedFile.extractedText.length} words ({selectedFile.pages || 1} {selectedFile.pages === 1 ? 'page' : 'pages'}) • Ready for Gemini
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Check className="w-3 h-3 text-slate-500" /> Attached
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleRemoveFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all self-end sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Replace File</span>
            </button>
          </div>
        )}

        {uploadError && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Quick Sample Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Or test with standard enterprise policies:
            </span>
            <span className="text-[11px] text-slate-500">1-click simulation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PRESET_POLICIES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onLoadPreset(preset)}
                className="text-left p-3 rounded-xl bg-slate-950/40 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-mono text-[10px] text-indigo-400">{preset.version}</span>
                  <span className="text-[10px] text-slate-500">{preset.pages} pgs</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                  {preset.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {preset.compliance}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Dropdowns */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Audience</span>
            </label>
            <div className="relative">
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8 cursor-pointer shadow-sm hover:border-slate-700"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {AUDIENCE_OPTIONS.find(a => a.value === targetAudience)?.desc}
            </p>
          </div>

          {/* Procedure Format */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
              <span>Procedure Format</span>
            </label>
            <div className="relative">
              <select
                value={procedureFormat}
                onChange={(e) => setProcedureFormat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8 cursor-pointer shadow-sm hover:border-slate-700"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {FORMAT_OPTIONS.find(f => f.value === procedureFormat)?.desc}
            </p>
          </div>
        </div>

        {/* Generate SOP CTA */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strict grounding: all steps linked to specific section clauses</span>
          </div>

          <button
            onClick={onGenerate}
            disabled={!selectedFile || selectedFile.isExtracting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-lg ${
              selectedFile && !selectedFile.isExtracting
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
            }`}
          >
            {selectedFile?.isExtracting ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Zap className={`w-4 h-4 ${selectedFile ? 'text-amber-300' : ''}`} />
            )}
            <span>{selectedFile?.isExtracting ? 'Extracting File...' : 'Generate SOP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
