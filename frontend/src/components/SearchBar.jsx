import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { searchStocks } from '../services/api';

export function SearchBar({ currentWatchlist, onAddStock, onMarkAsChecked }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timer = setTimeout(async () => {
      const data = await searchStocks(trimmed);
      setResults(data);
      setIsLoading(false);
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (symbol) => {
    onAddStock(symbol);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setIsLoading(true);
    } else {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
      
      {/* Wide Search Input */}
      <div className="relative flex-1 w-full" ref={dropdownRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder="Search Indian stocks to add (e.g. RELIANCE, TCS, INFY, HDFCBANK)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs transition-all"
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto divide-y divide-slate-100">
            {results.length > 0 ? (
              results.map((stock) => {
                const isAlreadyAdded = currentWatchlist.includes(stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{stock.name}</span>
                        <span className="text-xs font-bold text-slate-600">({stock.symbol})</span>
                        <span className="text-3xs font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {stock.exchange || 'NSE'}
                        </span>
                      </div>
                    </div>

                    {isAlreadyAdded ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" /> Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAdd(stock.symbol)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-md border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-4 text-center text-xs text-slate-500">
                No matching stocks found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compact Action Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        <button
          onClick={onMarkAsChecked}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mark as checked</span>
        </button>
      </div>

    </div>
  );
}
