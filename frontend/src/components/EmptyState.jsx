import React from 'react';
import { Plus, Layers } from 'lucide-react';

const SUGGESTED_STOCKS = [
  { symbol: 'RELIANCE' },
  { symbol: 'TCS' },
  { symbol: 'INFY' },
  { symbol: 'HDFCBANK' },
  { symbol: 'TATAPOWER' },
  { symbol: 'SBIN' }
];

export function EmptyState({ onAddStock }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-12 text-center shadow-2xs mb-8">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
        <Layers className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">Your Watchlist is Empty</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
        Search for Indian NSE stocks above or pick from popular choices below to start tracking meaningful market changes.
      </p>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Quick Add Popular Stocks
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
          {SUGGESTED_STOCKS.map(({ symbol }) => (
            <button
              key={symbol}
              onClick={() => onAddStock(symbol)}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{symbol}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
