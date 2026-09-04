import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, History, ChevronDown, ChevronUp } from 'lucide-react';
import { formatTimestamp, formatRelativeTime, formatPercent, formatCheckpointTime } from '../utils/formatters';

export function CheckpointHero({
  lastCheckedAt,
  attentionCount,
  items,
  history = [],
  onMarkAsChecked
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const hasBaseline = Boolean(lastCheckedAt);

  const topMovers = items
    .filter(i => i.delta?.deltaPercent !== null && i.delta?.deltaPercent !== undefined)
    .sort((a, b) => Math.abs(b.delta.deltaPercent) - Math.abs(a.delta.deltaPercent))
    .slice(0, 3);

  // Take up to 3 recent checkpoints from history
  const recentCheckpoints = (history || []).slice(0, 3);

  return (
    <section className="mb-8 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Intro & Headline */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-3xs font-bold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Personal Market Checkpoint
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Know what changed.
            </h1>

            <p className="text-slate-600 text-sm mt-2 leading-relaxed max-w-xl">
              Track your favourite Indian NSE stocks and see what moved since you last checked. No static 24-hour daily resets—just personal, actionable delta insights.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Explicit user baselines</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Deterministic threshold rules</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Attention-first ordering</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visually Distinctive CHECKPOINT Panel */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
          
          {/* Panel Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-3xs font-bold uppercase tracking-wider text-emerald-400">
                Checkpoint Snapshot
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                {hasBaseline ? 'YOUR LAST CHECK' : 'NO CHECKPOINT YET'}
              </h2>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block">
                {hasBaseline ? formatTimestamp(lastCheckedAt) : 'Baseline Pending'}
              </span>
              {hasBaseline && (
                <span className="text-3xs text-emerald-400 font-medium">
                  {formatRelativeTime(lastCheckedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Panel Body */}
          {hasBaseline ? (
            <div className="my-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Since then:</span>
                <span className="font-semibold text-white">
                  {attentionCount > 0 ? (
                    <span className="text-amber-400 font-bold">{attentionCount} {attentionCount === 1 ? 'stock needs' : 'stocks need'} attention</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">No major alerts</span>
                  )}
                </span>
              </div>

              {/* Top 3 Delta Pills */}
              {topMovers.length > 0 ? (
                <div className="space-y-1.5">
                  {topMovers.map(({ symbol, delta }) => {
                    const isUp = delta.deltaPercent >= 0;
                    return (
                      <div
                        key={symbol}
                        className="bg-slate-800/80 border border-slate-700/60 rounded-md px-3 py-1.5 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-200">{symbol}</span>
                        <span className={`font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '+' : ''}{formatPercent(delta.deltaPercent, false)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No price deltas calculated yet.</p>
              )}
            </div>
          ) : (
            <div className="my-4 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">Baseline required for tracking</span>
              </div>
              <p className="text-slate-400 text-3xs leading-relaxed">
                Click "Mark as checked" below to record current live prices as your starting baseline.
              </p>
            </div>
          )}

          {/* Panel Footer Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-3xs text-slate-400">
              {hasBaseline ? 'Checkpoint active' : 'Click to establish baseline'}
            </span>
            <button
              onClick={onMarkAsChecked}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              {hasBaseline ? 'Update Checkpoint' : 'Mark as checked'}
            </button>
          </div>

        </div>

      </div>

      {/* CHECKPOINT HISTORY (Collapsible Section Below Hero) */}
      {recentCheckpoints.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full px-5 py-3 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Checkpoint History ({recentCheckpoints.length})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-3xs font-medium">
              <span>{isHistoryOpen ? 'Hide recent' : 'View recent'}</span>
              {isHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {isHistoryOpen && (
            <div className="p-4 border-t border-slate-200 bg-white divide-y divide-slate-100">
              {recentCheckpoints.map((cp, idx) => (
                <div key={cp.timestamp + idx} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-900">{formatCheckpointTime(cp.timestamp)}</span>
                  </div>
                  <span className="text-slate-500 font-medium">{cp.stockCount} {cp.stockCount === 1 ? 'stock' : 'stocks'} tracked</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </section>
  );
}
