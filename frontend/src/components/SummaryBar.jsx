import React from 'react';
import { Bell, Layers, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { formatPercent } from '../utils/formatters';

export function SummaryBar({
  totalCount,
  attentionCount,
  topMover,
  lastCheckedAt,
  onMarkAsChecked
}) {
  const hasBaseline = Boolean(lastCheckedAt);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-5 shadow-2xs">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Since your last check
        </h2>
        <span className="text-3xs font-medium text-slate-400">
          {totalCount} {totalCount === 1 ? 'stock' : 'stocks'} tracked
        </span>
      </div>

      {!hasBaseline ? (
        /* No Baseline State */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-slate-900">
              Your first check creates the baseline.
            </p>
            <p className="text-slate-500 mt-0.5">
              Future visits will show what changed since that point.
            </p>
          </div>
          <button
            onClick={onMarkAsChecked}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Set Baseline Now</span>
          </button>
        </div>
      ) : (
        /* Baseline Exists State */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Item 1: Attention Summary */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${attentionCount > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">
                {attentionCount === 0 ? 'No stocks' : `${attentionCount} ${attentionCount === 1 ? 'stock' : 'stocks'}`}
              </p>
              <p className="text-slate-500 font-medium">
                {attentionCount === 0 ? 'need immediate attention' : 'need your attention'}
              </p>
            </div>
          </div>

          {/* Item 2: Top Mover */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
              {topMover && topMover.deltaPercent < 0 ? (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              ) : (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              {topMover && topMover.deltaPercent !== null ? (
                <>
                  <p className="font-bold text-slate-900 text-sm">
                    {topMover.symbol} <span className={topMover.deltaPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatPercent(topMover.deltaPercent)}</span>
                  </p>
                  <p className="text-slate-500 font-medium">moved the most since check</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-slate-900 text-sm">—</p>
                  <p className="text-slate-500 font-medium">No movement detected</p>
                </>
              )}
            </div>
          </div>

          {/* Item 3: Watchlist Size */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{totalCount} active</p>
              <p className="text-slate-500 font-medium">monitored in watchlist</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
