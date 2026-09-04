import React, { useState, useEffect } from 'react';
import { X, Trash2, TrendingUp, TrendingDown, Info, HelpCircle, Loader2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { fetchStockHistory } from '../services/api';
import { formatINR, formatPercent, formatRelativeTime } from '../utils/formatters';
import { ATTENTION_CONFIG } from '../utils/deltaEngine';

export function StockDetailDrawer({ stockItem, lastCheckedAt, onClose, onRemoveStock }) {
  const [period, setPeriod] = useState('1d');
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const symbol = stockItem?.symbol;
  const name = stockItem?.name || symbol;
  const quote = stockItem?.quote || {};
  const delta = stockItem?.delta || {};
  const attentionConfig = ATTENTION_CONFIG[delta.attentionLevel] || ATTENTION_CONFIG.STEADY;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!symbol) return;
    let isCancelled = false;

    async function loadHistory() {
      setIsLoadingHistory(true);
      const data = await fetchStockHistory(symbol, period);
      if (!isCancelled) {
        setHistoryData(data);
        setIsLoadingHistory(false);
      }
    }

    loadHistory();
    return () => {
      isCancelled = true;
    };
  }, [symbol, period]);

  if (!stockItem) return null;

  const isPositive = quote.change !== null && quote.change >= 0;
  const isStale = quote.isStale || quote.price === null;
  const deltaIsPositive = delta.deltaPercent !== null && delta.deltaPercent >= 0;

  // Detailed human explanation generated strictly from deltaEngine
  const getDetailedExplanation = () => {
    if (delta.deltaPercent === null) {
      return `Change tracking starts after you record your first baseline check for ${symbol}.`;
    }
    const absPct = Math.abs(delta.deltaPercent).toFixed(2);
    const isUp = delta.deltaPercent >= 0;

    if (delta.attentionLevel === 'MAJOR_MOVE') {
      return `${symbol} is ${isUp ? 'up' : 'down'} ${absPct}% since your last check. This exceeds your 2.0% attention threshold.`;
    }
    if (delta.attentionLevel === 'MODERATE_GAIN') {
      return `${symbol} is up ${absPct}% since your last check. This represents a moderate upward price movement.`;
    }
    if (delta.attentionLevel === 'MODERATE_DIP') {
      return `${symbol} is down ${absPct}% since your last check. This represents a moderate price dip.`;
    }
    return `${symbol} has moved only ${absPct}% since your last check, so there is no significant change requiring immediate attention.`;
  };

  const strokeColor = isPositive ? '#059669' : '#e11d48';

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* Semi-transparent overlay backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-xl flex flex-col justify-between overflow-y-auto">
          
          {/* Main Drawer Body */}
          <div className="p-5 space-y-5">
            
            {/* 1. Symbol & Company Name Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{symbol}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    NSE
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{name}</p>
              </div>

              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2 & 3 & 4. Current Price, Today's Change, and Change Since Last Check */}
            <div className="grid grid-cols-2 gap-3">
              {/* Current Price & Today's Move */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <p className="text-3xs font-semibold uppercase text-slate-400 tracking-wider">
                  Live Price
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {isStale ? '—' : formatINR(quote.price)}
                </p>
                {!isStale && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-medium mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {formatPercent(quote.changePercent)} today
                  </span>
                )}
              </div>

              {/* Change Since Last Check */}
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-lg p-3.5">
                <p className="text-3xs font-semibold uppercase text-emerald-900 tracking-wider">
                  Since Last Check
                </p>
                <p className={`text-lg font-bold mt-1 ${deltaIsPositive ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {delta.deltaPercent !== null ? formatPercent(delta.deltaPercent) : '—'}
                </p>
                <p className="text-3xs text-slate-500 mt-0.5 font-medium truncate">
                  {delta.explanation || 'Initial tracking'}
                </p>
              </div>
            </div>

            {/* 6. Recent Price History (Recharts) */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Price Performance</span>
                
                <div className="inline-flex rounded-md bg-slate-100 p-0.5 text-xs font-medium">
                  {['1d', '5d', '1m'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-2 py-0.5 rounded uppercase text-3xs font-bold transition-all cursor-pointer ${
                        period === p
                          ? 'bg-white text-emerald-700 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-40 w-full pt-2">
                {isLoadingHistory ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Loading price history...</span>
                  </div>
                ) : historyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                      <Tooltip
                        formatter={(val) => [formatINR(val), 'Price']}
                        labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}
                        contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={strokeColor}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    Historical data unavailable
                  </div>
                )}
              </div>
            </div>

            {/* 5. "Why am I seeing this?" Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Why am I seeing this?</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${attentionConfig.badgeClass}`}>
                  <span>{attentionConfig.icon}</span>
                  <span>{attentionConfig.label}</span>
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-md border border-slate-200">
                {getDetailedExplanation()}
              </p>

              <div className="flex items-start gap-1.5 text-3xs text-slate-500 pt-0.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  This flag refers strictly to our Watchlist attention rules (baseline: {formatRelativeTime(lastCheckedAt)}), not external real-world market news.
                </span>
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => {
                onRemoveStock(symbol);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove from Watchlist</span>
            </button>

            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 bg-white border border-slate-200 rounded-md shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
