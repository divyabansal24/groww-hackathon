import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function ErrorBanner({ onRetry }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <p className="font-semibold text-amber-900">
            Market Data Service Offline
          </p>
          <p className="text-amber-700 text-xs mt-0.5">
            Unable to connect to the backend server. Showing saved watchlist structure.
          </p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
      </button>
    </div>
  );
}
