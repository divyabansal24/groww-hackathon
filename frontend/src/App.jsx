import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CheckpointHero } from './components/CheckpointHero';
import { SearchBar } from './components/SearchBar';
import { WatchlistTable } from './components/WatchlistTable';
import { StockDetailDrawer } from './components/StockDetailDrawer';
import { HowItWorks } from './components/HowItWorks';
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
  const [lastUpdatedTime, setLastUpdatedTime] = useState(null);
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState(0);

  // Auto-dismiss toast notification after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Update seconds ago timer live every second
  useEffect(() => {
    if (!lastUpdatedTime) return;
    const interval = setInterval(() => {
      const past = new Date(lastUpdatedTime).getTime();
      const now = Date.now();
      const secs = Math.max(0, Math.floor((now - past) / 1000));
      setLastUpdatedSeconds(secs);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdatedTime]);

  // Manual / Initial Load Data fetch
  const loadData = useCallback(async (showSpinner = true) => {
    if (showSpinner) setIsRefreshing(true);
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
      const nowISO = new Date().toISOString();
      setLastUpdatedTime(nowISO);
      setLastUpdatedSeconds(0);
    }

    if (showSpinner) setIsRefreshing(false);
  }, []);

  // Silent Background Auto-Refresh every 60 seconds
  useEffect(() => {
    const autoRefreshInterval = setInterval(async () => {
      const currentStorage = loadState();
      if (!currentStorage.watchlist || currentStorage.watchlist.length === 0) return;
      
      const newQuotes = await fetchQuotes(currentStorage.watchlist);
      if (newQuotes !== null) {
        setQuotes(newQuotes);
        const nowISO = new Date().toISOString();
        setLastUpdatedTime(nowISO);
        setLastUpdatedSeconds(0);
        setIsError(false);
      }
    }, 60000);

    return () => clearInterval(autoRefreshInterval);
  }, []);

  // Initial load on mount
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
          const nowISO = new Date().toISOString();
          setLastUpdatedTime(nowISO);
          setLastUpdatedSeconds(0);
        }
        setIsRefreshing(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Handler: Mark all as checked (Update baseline & history)
  const handleMarkAsChecked = () => {
    const updatedState = markAllAsChecked(quotes);
    setStorageState(updatedState);
    setToastMessage('Baseline updated. Future changes will be measured from this point.');
  };

  // Handler: Add stock to watchlist
  const handleAddStock = async (symbol) => {
    const updatedState = addSymbol(symbol);
    setStorageState(updatedState);
    
    const newQuotes = await fetchQuotes(updatedState.watchlist);
    if (newQuotes !== null) {
      setQuotes(newQuotes);
      setLastUpdatedTime(new Date().toISOString());
      setLastUpdatedSeconds(0);
    }
    setToastMessage(`Added ${symbol} to your watchlist.`);
  };

  // Handler: Remove stock from watchlist
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
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 1. TOP NAVIGATION */}
      <Header
        lastCheckedAt={storageState.lastCheckedAt}
        lastUpdatedSeconds={lastUpdatedSeconds}
        isMarketOpen={isMarketOpen}
        isRefreshing={isRefreshing}
        onMarkAsChecked={handleMarkAsChecked}
        onRefresh={() => loadData(true)}
      />

      {/* Toast Notification Banner */}
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

      {/* Centered Main Page Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        
        {/* Error Banner if API Offline */}
        {isError && <ErrorBanner onRetry={() => loadData(true)} />}

        {/* 2. MAIN INTRO / CHECKPOINT HERO AREA WITH HISTORY */}
        <CheckpointHero
          lastCheckedAt={storageState.lastCheckedAt}
          attentionCount={analysis.attentionCount}
          items={analysis.items}
          history={storageState.history}
          onMarkAsChecked={handleMarkAsChecked}
        />

        {/* 3. WATCHLIST CONTROLS */}
        <SearchBar
          currentWatchlist={storageState.watchlist}
          onAddStock={handleAddStock}
          onMarkAsChecked={handleMarkAsChecked}
        />

        {/* 4 & 5. MAIN WATCHLIST TABLE */}
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

        {/* 8. HOW IT WORKS HORIZONTAL PROCESS */}
        <HowItWorks />

      </main>

      {/* Stock Detail Drawer Modal */}
      {selectedStockItem && (
        <StockDetailDrawer
          stockItem={selectedStockItem}
          lastCheckedAt={storageState.lastCheckedAt}
          onClose={() => setSelectedSymbol(null)}
          onRemoveStock={handleRemoveStock}
        />
      )}

      {/* 9. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SMART WATCHLIST</span>
            <span>&bull;</span>
            <span className="text-slate-500 font-medium">Know what changed.</span>
          </div>
          <div className="text-slate-400">
            Code by Groww 2026 Challenge &bull; Real-time NSE Data
          </div>
        </div>
      </footer>

    </div>
  );
}
