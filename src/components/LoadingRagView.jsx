import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Terminal, 
  Cpu, 
  Sparkles, 
  FileSearch, 
  Layers, 
  Network, 
  FileText,
  AlertCircle,
  ArrowLeft,
  RotateCw
} from 'lucide-react';
import { RAG_SIMULATION_STEPS } from '../data/mockData';

export default function LoadingRagView({ 
  onComplete, 
  fileName, 
  isGenerating = false,
  error = null,
  onCancel,
  onRetry
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState(() => [
    `[INIT] Attached RAG pipeline for: ${fileName || 'Policy_Document.pdf'}`
  ]);
  const [progressPercent, setProgressPercent] = useState(15);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    // If there is an error, stop advancing pipeline steps
    if (error) return;

    let step = 0;
    const progressTargets = [32, 60, 85, 90];
    let intervalId = null;

    const advanceStep = () => {
      if (step < 3) {
        // Steps 1 to 3 run sequentially
        const currentData = RAG_SIMULATION_STEPS[step];
        setCurrentStepIndex(step);
        setProgressPercent(progressTargets[step]);
        setLogs(prev => [...prev, `[STEP ${step + 1}] ${currentData.logMessage}`]);
        step++;
      } else if (step === 3) {
        // Step 4: LLM generation
        setCurrentStepIndex(3);
        setProgressPercent(90);
        setLogs(prev => {
          if (!prev.some(l => l.includes('Gemini API'))) {
            return [...prev, `[STEP 4] Invoking Gemini API: Synthesizing grounded procedures & citations...`];
          }
          return prev;
        });

        // Only complete if NOT generating AND NO error
        if (!isGenerating && !error && !isFinishedRef.current) {
          isFinishedRef.current = true;
          setProgressPercent(100);
          setLogs(prev => [...prev, `[COMPLETE] Received grounded SOP from Gemini!`]);
          setTimeout(() => {
            onComplete();
          }, 600);
          clearInterval(intervalId);
        }
      }
    };

    intervalId = setInterval(advanceStep, 800);
    return () => clearInterval(intervalId);
  }, [fileName, isGenerating, error, onComplete]);

  // When isGenerating transitions from true -> false without error
  useEffect(() => {
    if (!isGenerating && !error && currentStepIndex >= 2 && !isFinishedRef.current) {
      isFinishedRef.current = true;
      setCurrentStepIndex(3);
      setProgressPercent(100);
      setLogs(prev => [
        ...prev,
        `[COMPLETE] Gemini returned verified grounded SOP with citations!`
      ]);
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, error, currentStepIndex, onComplete]);

  // Log error if it occurs
  useEffect(() => {
    if (error) {
      setLogs(prev => [...prev, `[ERROR] Pipeline paused: ${error}`]);
    }
  }, [error]);

  const stepIcons = [
    FileSearch,
    Layers,
    Network,
    FileText
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border mb-3.5 shadow-lg ${
            error 
              ? 'bg-rose-600/15 border-rose-500/30 text-rose-400 shadow-rose-600/20'
              : 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400 shadow-indigo-600/20'
          }`}>
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {error ? 'Generation Encountered an Issue' : 'Synthesizing Standard Operating Procedure'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Applying vector retrieval and contextual grounding to <span className="text-slate-200 font-medium">{fileName || 'Uploaded Policy'}</span>
          </p>
        </div>

        {/* Error Notice Box */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-300 block mb-0.5">Gemini API Service Notice:</span>
                <span className="leading-relaxed">{error}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-500/20">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Upload</span>
                </button>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Retrying...' : 'Retry Generation'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              RAG Pipeline Progress
            </span>
            <span className="font-mono text-indigo-400 font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-700 ease-out rounded-full shadow-sm ${
                error
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sequential Checklist */}
        <div className="space-y-3 mb-8">
          {RAG_SIMULATION_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || (currentStepIndex === RAG_SIMULATION_STEPS.length - 1 && progressPercent === 100);
            const isCurrent = idx === currentStepIndex && progressPercent < 100 && !error;
            const isStepFailed = error && idx === currentStepIndex;
            const Icon = stepIcons[idx];

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  isStepFailed
                    ? 'bg-rose-950/20 border-rose-500/50 text-rose-300 shadow-md'
                    : isCurrent
                    ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md shadow-indigo-600/10'
                    : isCompleted
                    ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                    : 'bg-slate-950/20 border-slate-800/40 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isStepFailed
                        ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                        : isCurrent
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : isCompleted
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                        : 'bg-slate-800/40 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold tracking-tight text-white flex items-center gap-2">
                      <span>{step.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-300 animate-pulse">
                          Processing
                        </span>
                      )}
                      {isStepFailed && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-rose-500/20 text-rose-300">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {idx === 3 && isCurrent ? 'Calling Gemini API & synthesizing grounded steps...' : step.subtitle}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                  {isStepFailed ? (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-fade-in" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Terminal / Execution Log */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-[11px] text-slate-400">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[10px] uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Live Pipeline Stream
            </span>
            <span className="text-slate-600">Model: Gemini Flash RAG</span>
          </div>

          <div className="space-y-1 max-h-28 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-indigo-400 select-none">&gt;</span>
                <span className="break-all">{log}</span>
              </div>
            ))}
            {!error && progressPercent < 100 && (
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="w-1.5 h-3 bg-indigo-400 animate-pulse" />
                <span className="text-[10px]">
                  {isGenerating ? 'Synthesizing with Gemini model...' : 'Awaiting node response...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
