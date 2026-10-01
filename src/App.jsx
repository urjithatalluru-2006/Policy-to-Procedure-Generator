import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UploadView from './components/UploadView';
import LoadingRagView from './components/LoadingRagView';
import ResultsSplitView from './components/ResultsSplitView';
import { PRESET_POLICIES } from './data/mockData';
import { extractTextFromFile } from './services/fileExtractor';
import { generateSOPWithGemini } from './services/geminiService';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // App views: 'upload' | 'loading' | 'results'
  const [viewState, setViewState] = useState('upload');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Policy & Configuration state
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetAudience, setTargetAudience] = useState('Technical Support');
  const [procedureFormat, setProcedureFormat] = useState('Step-by-Step');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Active Policy & Procedure Data
  const [activePolicy, setActivePolicy] = useState(null);
  const [activeProcedure, setActiveProcedure] = useState(null);
  const [activeCitation, setActiveCitation] = useState(null);

  // Recent conversions list
  const [recentPolicies, setRecentPolicies] = useState(PRESET_POLICIES);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Preset Selection
  const handleLoadPreset = (preset) => {
    setSelectedFile({
      name: preset.fileName,
      size: preset.fileSize,
      type: preset.fileName.endsWith('.pdf') ? 'PDF' : 'DOCX',
      presetId: preset.id,
      extractedText: preset.sourceContent?.sections?.map(s => `${s.number} ${s.title}\n${s.content}`).join('\n\n') || '',
      extractedSections: preset.sourceContent?.sections || [],
      pages: preset.pages || 1,
      isCustom: false
    });
    setTargetAudience(preset.audience);
    setProcedureFormat(preset.format);
    setActivePolicy(preset);
    setActiveProcedure(preset.generatedProcedure);
    showToast(`Loaded preset template: ${preset.title}`, 'info');
  };

  // Start Generation
  const handleStartGeneration = async () => {
    if (!selectedFile) return;

    setGenerationError(null);
    setIsGenerating(true);
    setViewState('loading');

    try {
      let policyText = '';
      let extractedSections = [];
      let fileName = selectedFile.name;

      // Extract real text if custom file
      if (selectedFile.isCustom) {
        if (selectedFile.extractedText && selectedFile.extractedText.trim()) {
          policyText = selectedFile.extractedText;
          extractedSections = selectedFile.extractedSections || [];
        } else if (selectedFile.rawFile) {
          const extracted = await extractTextFromFile(selectedFile.rawFile);
          policyText = extracted.rawText;
          extractedSections = extracted.sections;
        }
      } else if (selectedFile.presetId) {
        const preset = PRESET_POLICIES.find(p => p.id === selectedFile.presetId);
        if (preset) {
          policyText = preset.sourceContent?.sections?.map(s => `${s.number} ${s.title}\n${s.content}`).join('\n\n') || '';
          extractedSections = preset.sourceContent?.sections || [];
          fileName = preset.fileName;
        }
      } else if (activePolicy?.sourceContent?.rawText) {
        policyText = activePolicy.sourceContent.rawText;
        extractedSections = activePolicy.sourceContent.sections || [];
        fileName = activePolicy.fileName;
      }

      if (!policyText || !policyText.trim()) {
        throw new Error('No readable text found in document. Please check the uploaded file.');
      }

      // Invoke Gemini API
      const result = await generateSOPWithGemini({
        policyText,
        targetAudience,
        procedureFormat,
        fileName,
        extractedSections
      });

      setActivePolicy(result.policy);
      setActiveProcedure(result.procedure);
      setRecentPolicies(prev => [result.policy, ...prev.filter(p => p.id !== result.policy.id)]);
    } catch (err) {
      console.error('Error in handleStartGeneration:', err);
      setGenerationError(err.message || 'Generation failed');
      showToast(err.message || 'Failed to generate procedure', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // RAG Pipeline Simulation / Loading Complete
  const handleRagComplete = () => {
    if (!activeProcedure) {
      console.warn('handleRagComplete called but no procedure generated yet.');
      return;
    }

    setViewState('results');
    // Default active citation to the first highlighted clause
    if (activePolicy?.sourceContent?.sections) {
      const firstHighlighted = activePolicy.sourceContent.sections.find(s => s.isHighlighted);
      if (firstHighlighted) {
        setActiveCitation(firstHighlighted.citationKey);
      }
    }

    // Celebration Confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback
    }

    showToast('SOP successfully generated with Gemini & verified citations!');
  };

  // Reset to Upload State
  const handleReset = () => {
    setViewState('upload');
    setActiveCitation(null);
    setGenerationError(null);
  };

  // Sidebar selection
  const handleSelectRecent = (policyId) => {
    const found = recentPolicies.find(p => p.id === policyId);
    if (found) {
      setActivePolicy(found);
      setActiveProcedure(found.generatedProcedure);
      setSelectedFile({
        name: found.fileName,
        size: found.fileSize,
        type: found.fileName.endsWith('.pdf') ? 'PDF' : 'DOCX',
        presetId: found.id,
        extractedText: found.sourceContent?.rawText || found.sourceContent?.sections?.map(s => `${s.number} ${s.title}\n${s.content}`).join('\n\n') || '',
        extractedSections: found.sourceContent?.sections || []
      });
      setTargetAudience(found.audience || 'Technical Support');
      setProcedureFormat(found.format || 'Step-by-Step');
      
      const firstHighlighted = found.sourceContent?.sections?.find(s => s.isHighlighted);
      setActiveCitation(firstHighlighted ? firstHighlighted.citationKey : null);
      
      setViewState('results');
      showToast(`Switched to: ${found.title}`, 'info');
    }
  };

  // Export handlers
  const handleExport = (format) => {
    if (!activeProcedure) return;

    if (format === 'clipboard') {
      handleCopyClipboard();
    } else if (format === 'markdown') {
      downloadMarkdownFile();
    } else if (format === 'pdf') {
      window.print();
      showToast('Preparing document print/PDF dialog...');
    }
  };

  const handleCopyClipboard = () => {
    if (!activeProcedure) return;

    const markdownText = formatProcedureAsMarkdown(activeProcedure, activePolicy, targetAudience);
    navigator.clipboard.writeText(markdownText);
    showToast('Procedure markdown copied to clipboard!');
  };

  const downloadMarkdownFile = () => {
    const markdownText = formatProcedureAsMarkdown(activeProcedure, activePolicy, targetAudience);
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(activeProcedure.meta?.title || 'SOP').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Markdown file downloaded successfully!');
  };

  const formatProcedureAsMarkdown = (proc, policy, audience) => {
    let md = `# ${proc.meta?.title || 'Standard Operating Procedure'}\n\n`;
    md += `**Document ID:** ${proc.meta?.docId} | **Audience:** ${audience} | **Effective:** ${proc.meta?.effectiveDate}\n\n`;
    md += `## 1. Purpose & Objective\n${proc.objective}\n\n`;
    md += `## 2. Prerequisites\n`;
    proc.prerequisites?.forEach((p, i) => {
      md += `${i + 1}. ${p}\n`;
    });
    md += `\n## 3. Operational Steps\n`;
    proc.steps?.forEach((s) => {
      md += `### Step ${s.stepNumber}: ${s.title} ${s.citationBadge || ''}\n`;
      md += `**Role:** ${s.role}\n\n`;
      md += `${s.description}\n\n`;
      if (s.substeps) {
        s.substeps.forEach(sub => md += `- ${sub}\n`);
        md += `\n`;
      }
      if (s.warning) md += `> **Warning:** ${s.warning}\n\n`;
      if (s.tip) md += `> **Tip:** ${s.tip}\n\n`;
    });
    md += `\n## 4. Governance Notes\n`;
    proc.governanceNotes?.forEach(n => md += `- ${n}\n`);
    return md;
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        hasGeneratedProcedure={viewState === 'results'}
        onReset={handleReset}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onExport={handleExport}
        activePolicyTitle={activePolicy?.title}
        activeFormat={procedureFormat}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          recentPolicies={recentPolicies}
          activePolicyId={activePolicy?.id}
          onSelectPolicy={handleSelectRecent}
          onNewConversion={handleReset}
        />

        {/* Content View Switcher */}
        <main className="flex-1 h-full overflow-hidden flex flex-col bg-slate-950">
          {viewState === 'upload' && (
            <div className="flex-1 overflow-y-auto">
              <UploadView
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                targetAudience={targetAudience}
                setTargetAudience={setTargetAudience}
                procedureFormat={procedureFormat}
                setProcedureFormat={setProcedureFormat}
                onGenerate={handleStartGeneration}
                onLoadPreset={handleLoadPreset}
              />
            </div>
          )}

          {viewState === 'loading' && (
            <div className="flex-1 overflow-y-auto flex items-center justify-center">
              <LoadingRagView
                fileName={selectedFile?.name}
                onComplete={handleRagComplete}
                isGenerating={isGenerating}
                error={generationError}
                onCancel={() => setViewState('upload')}
                onRetry={handleStartGeneration}
              />
            </div>
          )}

          {viewState === 'results' && (
            <ResultsSplitView
              policy={activePolicy}
              procedure={activeProcedure}
              targetAudience={targetAudience}
              procedureFormat={procedureFormat}
              setProcedureFormat={setProcedureFormat}
              onRegenerate={handleStartGeneration}
              onDownloadPdf={() => handleExport('pdf')}
              onCopyClipboard={handleCopyClipboard}
              activeCitation={activeCitation}
              setActiveCitation={setActiveCitation}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs text-white shadow-2xl backdrop-blur-md">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span className="font-medium">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-0.5 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
