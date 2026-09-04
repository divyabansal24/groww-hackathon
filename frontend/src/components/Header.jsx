import React from 'react';
import { CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

export function Header({
  lastCheckedAt,
  isMarketOpen,
  isRefreshing,
  onMarkAsChecked,
  onRefresh
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Brand & Identity */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                W
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                SMART WATCHLIST
              </h1>
              <span className="text-xs text-slate-400 font-normal border-l border-slate-200 pl-2 ml-0.5">
                Know what changed.
              </span>
            </div>
          </div>

          {/* Controls & Status Indicators */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Market Status */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600">
              <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{isMarketOpen ? 'Market Open' : 'Market Closed'}</span>
            </div>

            {/* Baseline Timestamp */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Baseline: {formatRelativeTime(lastCheckedAt)}</span>
            </div>

            {/* Refresh Quote Action */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh live prices"
              className="p-1.5 border border-slate-200 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Primary Action: Mark as Checked */}
            <button
              onClick={onMarkAsChecked}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as checked</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
