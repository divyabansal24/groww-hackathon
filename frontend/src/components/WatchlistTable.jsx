import React, { useMemo } from 'react';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR, formatPercent } from '../utils/formatters';
import { ATTENTION_CONFIG } from '../utils/deltaEngine';

export function WatchlistTable({ items, hasBaseline, onRemoveStock, onSelectStock }) {
  // Presentation-level sort: Attention stocks first, ordered by largest absolute delta %
  const sortedItems = useMemo(() => {
    if (!hasBaseline) return items;

    return [...items].sort((a, b) => {
      const aAttn = a.delta?.requiresAttention ? 1 : 0;
      const bAttn = b.delta?.requiresAttention ? 1 : 0;

      if (aAttn !== bAttn) {
        return bAttn - aAttn; // Attention stocks first
      }

      const aAbsDelta = Math.abs(a.delta?.deltaPercent ?? 0);
      const bAbsDelta = Math.abs(b.delta?.deltaPercent ?? 0);
      return bAbsDelta - aAbsDelta;
    });
  }, [items, hasBaseline]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Company / Symbol</th>
              <th className="py-3 px-4 text-right">Live Price</th>
              <th className="py-3 px-4 text-right">Today's Move</th>
              {/* Core Feature: Change Since Last Check (Visually Strongest Column) */}
              <th className="py-3 px-4 sm:px-6 text-right bg-emerald-50/70 text-emerald-950 font-bold border-x border-emerald-200/80">
                Change Since Last Check
              </th>
              <th className="py-3 px-4 text-center">Attention Reason</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedItems.map((item) => {
              const { symbol, name, quote, delta } = item;
              const isPositive = quote.change !== null && quote.change >= 0;
              const isStale = quote.isStale || quote.price === null;
              const attentionConfig = ATTENTION_CONFIG[delta.attentionLevel] || ATTENTION_CONFIG.STEADY;
              const deltaIsPositive = delta.deltaPercent !== null && delta.deltaPercent >= 0;

              return (
                <tr
                  key={symbol}
                  onClick={() => onSelectStock(item)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Company Name & Symbol */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase group-hover:border-emerald-400 transition-colors shrink-0">
                        {symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors max-w-[180px] sm:max-w-[260px] truncate">
                          {name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-semibold text-slate-600">{symbol}</span>
                          <span className="text-3xs font-semibold uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-500">
                            NSE
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Live Price */}
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                    {isStale ? (
                      <span className="text-slate-400 text-xs font-normal italic">Data unavailable</span>
                    ) : (
                      formatINR(quote.price)
                    )}
                  </td>

                  {/* Today's Move */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {isStale ? (
                      <span className="text-slate-400 text-xs">—</span>
                    ) : (
                      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {formatPercent(quote.changePercent)}
                      </span>
                    )}
                  </td>

                  {/* Core Feature Column: Change Since Last Check */}
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap bg-emerald-50/40 border-x border-emerald-100 font-medium">
                    {delta.deltaPercent !== null ? (
                      <div className="flex flex-col items-end">
                        <span className={`inline-flex items-center gap-1 font-bold text-sm px-2.5 py-0.5 rounded-md ${
                          deltaIsPositive
                            ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100/90 text-rose-900 border border-rose-300'
                        }`}>
                          {deltaIsPositive ? '+' : ''}{formatPercent(delta.deltaPercent, false)}
                        </span>
                        <span className="text-3xs text-slate-600 mt-0.5 font-medium">
                          {delta.explanation}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 font-normal">Initial Baseline</span>
                        <span className="text-3xs text-slate-400">{delta.explanation}</span>
                      </div>
                    )}
                  </td>

                  {/* Attention Reason Badge */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${attentionConfig.badgeClass}`}>
                      <span>{attentionConfig.icon}</span>
                      <span>{attentionConfig.label}</span>
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStock(symbol);
                      }}
                      title={`Remove ${symbol} from watchlist`}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
