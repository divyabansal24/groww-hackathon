const STORAGE_KEY = 'smart_watchlist_state';

const DEFAULT_WATCHLIST = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAPOWER'];

const DEFAULT_STATE = {
  watchlist: DEFAULT_WATCHLIST,
  lastCheckedAt: null,
  snapshot: {},
  history: []
};

/**
 * Safely load state from localStorage.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_STATE };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_STATE };
    }

    const watchlist = Array.isArray(parsed.watchlist) && parsed.watchlist.length > 0
      ? parsed.watchlist
      : [...DEFAULT_WATCHLIST];
      
    const snapshot = (parsed.snapshot && typeof parsed.snapshot === 'object')
      ? parsed.snapshot
      : {};

    const history = Array.isArray(parsed.history) ? parsed.history : [];
    const lastCheckedAt = parsed.lastCheckedAt || null;

    return {
      watchlist,
      lastCheckedAt,
      snapshot,
      history
    };
  } catch (err) {
    console.warn('Failed to parse watchlist state from localStorage:', err);
    return { ...DEFAULT_STATE };
  }
}

/**
 * Safely save state to localStorage.
 */
export function saveState(state) {
  try {
    const stateToSave = {
      watchlist: Array.isArray(state?.watchlist) ? state.watchlist : [...DEFAULT_WATCHLIST],
      lastCheckedAt: state?.lastCheckedAt || null,
      snapshot: state?.snapshot || {},
      history: Array.isArray(state?.history) ? state.history : []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    return true;
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
    return false;
  }
}

/**
 * Get stored watchlist symbols array.
 */
export function getWatchlist() {
  return loadState().watchlist;
}

/**
 * Set full watchlist symbols array.
 */
export function setWatchlist(symbols) {
  const currentState = loadState();
  const updatedState = {
    ...currentState,
    watchlist: Array.from(new Set(symbols.map(s => s.toUpperCase())))
  };
  saveState(updatedState);
  return updatedState;
}

/**
 * Add single symbol to watchlist if not present.
 */
export function addSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') return loadState();
  const cleanSymbol = symbol.trim().toUpperCase();
  const currentState = loadState();
  if (currentState.watchlist.includes(cleanSymbol)) {
    return currentState;
  }
  const updatedWatchlist = [...currentState.watchlist, cleanSymbol];
  const updatedState = {
    ...currentState,
    watchlist: updatedWatchlist
  };
  saveState(updatedState);
  return updatedState;
}

/**
 * Remove single symbol from watchlist.
 */
export function removeSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') return loadState();
  const cleanSymbol = symbol.trim().toUpperCase();
  const currentState = loadState();
  const updatedWatchlist = currentState.watchlist.filter(s => s !== cleanSymbol);
  
  const updatedSnapshot = { ...currentState.snapshot };
  delete updatedSnapshot[cleanSymbol];

  const updatedState = {
    ...currentState,
    watchlist: updatedWatchlist,
    snapshot: updatedSnapshot
  };
  saveState(updatedState);
  return updatedState;
}

/**
 * Snapshot current quote prices, record checkpoint history entry, and update lastCheckedAt timestamp to NOW.
 */
export function markAllAsChecked(currentQuotes = {}) {
  const currentState = loadState();
  const nowISO = new Date().toISOString();
  
  const newSnapshot = { ...currentState.snapshot };
  
  Object.keys(currentQuotes).forEach(sym => {
    const q = currentQuotes[sym];
    if (q && typeof q.price === 'number' && !isNaN(q.price)) {
      newSnapshot[sym] = {
        price: q.price,
        timestamp: nowISO
      };
    }
  });

  const historyEntry = {
    timestamp: nowISO,
    stockCount: currentState.watchlist.length,
    snapshot: newSnapshot
  };

  const existingHistory = Array.isArray(currentState.history) ? currentState.history : [];
  const updatedHistory = [historyEntry, ...existingHistory].slice(0, 5);

  const updatedState = {
    ...currentState,
    lastCheckedAt: nowISO,
    snapshot: newSnapshot,
    history: updatedHistory
  };
  saveState(updatedState);
  return updatedState;
}
