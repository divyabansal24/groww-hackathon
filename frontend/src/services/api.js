import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

export async function fetchHealth() {
  try {
    const res = await api.get('/api/health');
    return res.data;
  } catch (err) {
    console.warn('API Health check failed:', err.message);
    return { status: 'error', market_open: false, timestamp: new Date().toISOString(), isError: true };
  }
}

export async function fetchQuotes(symbolsArray) {
  if (!symbolsArray || symbolsArray.length === 0) {
    return {};
  }
  try {
    const symbolsQuery = symbolsArray.join(',');
    const res = await api.get(`/api/stocks/quotes?symbols=${encodeURIComponent(symbolsQuery)}`);
    return res.data?.quotes || {};
  } catch (err) {
    console.warn('API fetchQuotes failed:', err.message);
    return null;
  }
}

export async function searchStocks(query) {
  try {
    const res = await api.get(`/api/stocks/search?q=${encodeURIComponent(query || '')}`);
    return res.data || [];
  } catch (err) {
    console.warn('API searchStocks failed:', err.message);
    return [];
  }
}

export async function fetchStockHistory(symbol, period = '1d') {
  if (!symbol) return [];
  try {
    const res = await api.get(`/api/stocks/${encodeURIComponent(symbol)}/history?period=${encodeURIComponent(period)}`);
    return res.data?.history || [];
  } catch (err) {
    console.warn(`API fetchStockHistory failed for ${symbol}:`, err.message);
    return [];
  }
}
