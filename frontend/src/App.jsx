import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SummaryBar } from './components/SummaryBar';
import { SearchBar } from './components/SearchBar';
import { WatchlistTable } from './components/WatchlistTable';
import { StockDetailDrawer } from './components/StockDetailDrawer';
import { EmptyState } from './components/EmptyState';
import { ErrorBanner } from './components/ErrorBanner';
import { loadState, addSymbol, removeSymbol, markAllAsChecked } from './utils/storage';
import { analyzeWatchlistDeltas } from './utils/deltaEngine';
import { fetchHealth, fetchQuotes } from './services/api';
import { CheckCircle2, X } from 'lucide-react';
import './App.css';

export default function App() {
  const [storageState, setStorageState] = useState(() => loadState());
  const [quotes, setQuotes] = useState({});
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    const currentStorage = loadState();
    setStorageState(currentStorage);

    const [healthData, quotesData] = await Promise.all([
      fetchHealth(),
      fetchQuotes(currentStorage.watchlist)
    ]);

    setIsMarketOpen(Boolean(healthData?.market_open));

    if (quotesData === null) {
      setIsError(true);
    } else {
      setIsError(false);
      setQuotes(quotesData);
    }

    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      setIsRefreshing(true);
      const currentStorage = loadState();
      if (!ignore) setStorageState(currentStorage);

      const [healthData, quotesData] = await Promise.all([
        fetchHealth(),
        fetchQuotes(currentStorage.watchlist)
      ]);

      if (!ignore) {
        setIsMarketOpen(Boolean(healthData?.market_open));
        if (quotesData === null) {
          setIsError(true);
        } else {
          setIsError(false);
          setQuotes(quotesData);
        }
        setIsRefreshing(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleMarkAsChecked = () => {
    const updatedState = markAllAsChecked(quotes);
    setStorageState(updatedState);
    setToastMessage('Baseline updated. Future changes will be measured from this point.');
  };

  const handleAddStock = async (symbol) => {
    const updatedState = addSymbol(symbol);
    setStorageState(updatedState);
    
    const newQuotes = await fetchQuotes(updatedState.watchlist);
    if (newQuotes !== null) {
      setQuotes(newQuotes);
    }
    setToastMessage(`Added ${symbol} to your watchlist.`);
  };

  const handleRemoveStock = (symbol) => {
    const updatedState = removeSymbol(symbol);
    setStorageState(updatedState);
    
    const updatedQuotes = { ...quotes };
    delete updatedQuotes[symbol];
    setQuotes(updatedQuotes);
    
    if (selectedSymbol === symbol) {
      setSelectedSymbol(null);
    }
    
    setToastMessage(`Removed ${symbol} from watchlist.`);
  };

  const analysis = analyzeWatchlistDeltas(
    storageState.watchlist,
    quotes,
    storageState.snapshot
  );

  const selectedStockItem = selectedSymbol
    ? analysis.items.find(item => item.symbol === selectedSymbol)
    : null;

  const hasBaseline = Boolean(storageState.lastCheckedAt);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      <Header
        lastCheckedAt={storageState.lastCheckedAt}
        isMarketOpen={isMarketOpen}
        isRefreshing={isRefreshing}
        onMarkAsChecked={handleMarkAsChecked}
        onRefresh={loadData}
      />

      {toastMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 w-full">
          <div className="bg-slate-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full">
        
        {isError && <ErrorBanner onRetry={loadData} />}

        <SummaryBar
          totalCount={analysis.totalCount}
          attentionCount={analysis.attentionCount}
          topMover={analysis.topMover}
          lastCheckedAt={storageState.lastCheckedAt}
          onMarkAsChecked={handleMarkAsChecked}
        />

        <SearchBar
          currentWatchlist={storageState.watchlist}
          onAddStock={handleAddStock}
        />

        {storageState.watchlist.length > 0 ? (
          <WatchlistTable
            items={analysis.items}
            hasBaseline={hasBaseline}
            onRemoveStock={handleRemoveStock}
            onSelectStock={(item) => setSelectedSymbol(item.symbol)}
          />
        ) : (
          <EmptyState onAddStock={handleAddStock} />
        )}

      </main>

      {selectedStockItem && (
        <StockDetailDrawer
          stockItem={selectedStockItem}
          lastCheckedAt={storageState.lastCheckedAt}
          onClose={() => setSelectedSymbol(null)}
          onRemoveStock={handleRemoveStock}
        />
      )}

      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          SMART WATCHLIST &bull; Code by Groww 2026 Challenge &bull; Real-time NSE Market Data
        </div>
      </footer>

    </div>
  );
}
