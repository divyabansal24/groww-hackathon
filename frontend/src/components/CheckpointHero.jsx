import React, { useState } from 'react';
import { AlertCircle, History, ChevronDown, ChevronUp } from 'lucide-react';
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

  const recentCheckpoints = (history || []).slice(0, 3);

  return (
    <section className="mb-6 space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column: Compact Intro */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Personal market checkpoint
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Know what changed.
            </h1>

            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
              Track price changes since you last checked.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
            Tracks price changes since you last checked.
          </div>
        </div>

        {/* Right Column: Compact "Your Checkpoint" Panel */}
        <div className="lg:col-span-5 bg-white border border-gray-200 text-gray-900 rounded-lg p-5 flex flex-col justify-between shadow-2xs relative overflow-hidden">
          
          {/* Panel Header */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-2.5">
            <div>
              <span className="text-3xs font-medium text-[#059669]">
                Your checkpoint
              </span>
              <h2 className="text-sm font-bold text-gray-900 mt-0.5">
                {hasBaseline ? 'Your last check' : 'No checkpoint yet'}
              </h2>
            </div>
            
            <div className="text-right">
              <span className={`text-xs font-semibold block ${hasBaseline ? 'text-gray-500' : 'text-[#059669]'}`}>
                {hasBaseline ? formatTimestamp(lastCheckedAt) : 'Pending'}
              </span>
              {hasBaseline && (
                <span className="text-3xs text-[#059669] font-medium">
                  {formatRelativeTime(lastCheckedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Panel Body */}
          {hasBaseline ? (
            <div className="my-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Since then:</span>
                <span className="font-semibold text-gray-900">
                  {attentionCount > 0 ? (
                    <span className="text-amber-600 font-bold">{attentionCount} {attentionCount === 1 ? 'stock needs' : 'stocks need'} attention</span>
                  ) : (
                    <span className="text-[#059669] font-medium">No major alerts</span>
                  )}
                </span>
              </div>

              {topMovers.length > 0 ? (
                <div className="space-y-1">
                  {topMovers.map(({ symbol, delta }) => {
                    const isUp = delta.deltaPercent >= 0;
                    return (
                      <div
                        key={symbol}
                        className="bg-slate-50 border border-slate-200/80 rounded px-2.5 py-1 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-gray-900">{symbol}</span>
                        <span className={`font-mono font-bold ${isUp ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isUp ? '+' : ''}{formatPercent(delta.deltaPercent, false)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No price deltas calculated yet.</p>
              )}
            </div>
          ) : (
            <div className="my-3 text-xs text-gray-600 space-y-1.5">
              <div className="flex items-center gap-2 text-[#059669]">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#059669]" />
                <span className="font-semibold text-[#059669]">Baseline required for tracking</span>
              </div>
              <p className="text-gray-500 text-3xs leading-relaxed">
                Click "Mark as checked" to record current live prices as your starting baseline.
              </p>
            </div>
          )}

          {/* Panel Footer Action */}
          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-3xs text-gray-500">
              {hasBaseline ? 'Checkpoint active' : 'Set baseline'}
            </span>
            <button
              onClick={onMarkAsChecked}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              {hasBaseline ? 'Update checkpoint' : 'Mark as checked'}
            </button>
          </div>

        </div>

      </div>

      {/* Checkpoint History (Collapsible Section Below Hero) */}
      {recentCheckpoints.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full px-4 py-2.5 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Checkpoint history ({recentCheckpoints.length})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-3xs font-medium">
              <span>{isHistoryOpen ? 'Hide recent' : 'View recent'}</span>
              {isHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {isHistoryOpen && (
            <div className="p-3.5 border-t border-slate-200 bg-white divide-y divide-slate-100">
              {recentCheckpoints.map((cp, idx) => (
                <div key={cp.timestamp + idx} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-900">{formatCheckpointTime(cp.timestamp)}</span>
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
