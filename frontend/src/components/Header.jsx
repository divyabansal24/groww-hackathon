import React from 'react';
import { CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

export function Header({
  lastCheckedAt,
  lastUpdatedSeconds,
  isMarketOpen,
  isRefreshing,
  onMarkAsChecked,
  onRefresh
}) {
  const getUpdatedText = () => {
    if (lastUpdatedSeconds === null || lastUpdatedSeconds === undefined) return 'Updating...';
    if (lastUpdatedSeconds < 5) return 'Updated: Just now';
    if (lastUpdatedSeconds < 60) return `Updated: ${lastUpdatedSeconds}s ago`;
    const mins = Math.floor(lastUpdatedSeconds / 60);
    return `Updated: ${mins}m ago`;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <svg className="w-9 h-9 shrink-0 shadow-2xs rounded-full overflow-hidden" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#growwLogoClip)">
                <rect width="36" height="36" fill="#5367FF" />
                <path d="M -2 18 C 8 24, 26 12, 38 18 L 38 38 L -2 38 Z" fill="#00D09C" />
              </g>
              <defs>
                <clipPath id="growwLogoClip">
                  <circle cx="18" cy="18" r="18" />
                </clipPath>
              </defs>
            </svg>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  SMART WATCHLIST
                </span>
                <span className="hidden sm:inline-block text-3xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                  NSE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Know what changed.
              </p>
            </div>
          </div>

          {/* Controls & Market Status */}
          <div className="flex items-center gap-2.5">
            
            {/* Live Auto-Refresh Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{getUpdatedText()}</span>
            </div>

            {/* Market Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600">
              <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isMarketOpen ? 'Market Open' : 'Market Closed'}</span>
            </div>

            {/* Baseline Timestamp Pill - Emerald Green Styling */}
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-200/80 px-2.5 py-1 rounded-md text-xs text-emerald-800 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lastCheckedAt ? `Baseline: ${formatRelativeTime(lastCheckedAt)}` : 'No Checkpoint Yet'}</span>
            </div>

            {/* Refresh Live Quotes */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh market quotes manually"
              className="p-1.5 border border-slate-200 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Primary Checkpoint Action */}
            <button
              onClick={onMarkAsChecked}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as checked</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
