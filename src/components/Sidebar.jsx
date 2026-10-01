import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronLeft,
  X,
  FileCheck2,
  FolderGit2
} from 'lucide-react';

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  recentPolicies,
  activePolicyId,
  onSelectPolicy,
  onNewConversion
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = recentPolicies.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.compliance.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 flex flex-col bg-slate-900/95 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-80 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-r-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Recent Conversions
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            {recentPolicies.length}
          </span>
        </div>

        {/* Search within conversions */}
        <div className="p-3 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search recent policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500/80 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Recent Policies List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching conversions found.
            </div>
          ) : (
            filtered.map((policy) => {
              const isActive = activePolicyId === policy.id;
              return (
                <button
                  key={policy.id}
                  onClick={() => {
                    onSelectPolicy(policy.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all border group relative ${
                    isActive
                      ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm shadow-indigo-500/10'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded-md bg-slate-800 group-hover:bg-slate-700 text-indigo-400">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {policy.version}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      {policy.date}
                    </span>
                  </div>

                  <div className="font-medium text-xs text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                    {policy.title}
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-400 border border-slate-700/40">
                      {policy.audience}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      SOP Ready
                    </span>
                  </div>

                  {isActive && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-full" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* RAG Engine Status Info Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                RAG Pipeline Status
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-400 font-mono">
              <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800/50">
                <div className="text-slate-500 text-[9px] uppercase">Embeddings</div>
                <div className="text-slate-200 truncate font-semibold">text-emb-3</div>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800/50">
                <div className="text-slate-500 text-[9px] uppercase">Retrieval</div>
                <div className="text-slate-200 font-semibold">Top-K Dense (4)</div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
              <ShieldCheck className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>Zero-hallucination citation enforcement</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
