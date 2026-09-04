import math
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI(title="Smart Market Watchlist API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CURATED_STOCKS = [
    {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "exchange": "NSE"},
    {"symbol": "TCS", "name": "Tata Consultancy Services Ltd", "exchange": "NSE"},
    {"symbol": "INFY", "name": "Infosys Ltd", "exchange": "NSE"},
    {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "exchange": "NSE"},
    {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd", "exchange": "NSE"},
    {"symbol": "TATAPOWER", "name": "Tata Power Company Ltd", "exchange": "NSE"},
    {"symbol": "SBIN", "name": "State Bank of India", "exchange": "NSE"},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd", "exchange": "NSE"},
    {"symbol": "ITC", "name": "ITC Ltd", "exchange": "NSE"},
    {"symbol": "LT", "name": "Larsen & Toubro Ltd", "exchange": "NSE"},
    {"symbol": "WIPRO", "name": "Wipro Ltd", "exchange": "NSE"},
    {"symbol": "AXISBANK", "name": "Axis Bank Ltd", "exchange": "NSE"},
    {"symbol": "HINDUNILVR", "name": "Hindustan Unilever Ltd", "exchange": "NSE"},
    {"symbol": "MARUTI", "name": "Maruti Suzuki India Ltd", "exchange": "NSE"},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank Ltd", "exchange": "NSE"},
]

CURATED_MAP = {s["symbol"].upper(): s for s in CURATED_STOCKS}

def get_ist_now() -> datetime:
    ist_tz = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist_tz)

def is_market_open() -> bool:
    now = get_ist_now()
    if now.weekday() >= 5:
        return False
    start_time = now.replace(hour=9, minute=15, second=0, microsecond=0)
    end_time = now.replace(hour=15, minute=30, second=0, microsecond=0)
    return start_time <= now <= end_time

@app.get("/")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "market_open": is_market_open(),
        "timestamp": get_ist_now().isoformat()
    }

@app.get("/api/stocks/search")
def search_stocks(q: Optional[str] = Query(default="")):
    query = (q or "").strip().upper()
    if not query:
        return CURATED_STOCKS
    
    results = []
    for stock in CURATED_STOCKS:
        if query in stock["symbol"].upper() or query in stock["name"].upper():
            results.append(stock)
    return results

def sanitize_symbol(raw_symbol: str) -> str:
    cleaned = raw_symbol.strip().upper()
    if cleaned.endswith(".NS") or cleaned.endswith(".BO"):
        return cleaned.split(".")[0]
    return cleaned

def fetch_single_quote(raw_symbol: str) -> Dict[str, Any]:
    clean_sym = sanitize_symbol(raw_symbol)
    curated_info = CURATED_MAP.get(clean_sym, {})
    yf_symbol = f"{clean_sym}.NS" if not raw_symbol.endswith((".NS", ".BO")) else raw_symbol
    
    price = None
    prev_close = None
    day_high = None
    day_low = None
    volume = None
    fifty_two_high = None
    fifty_two_low = None
    name = curated_info.get("name", clean_sym)
    is_stale = False

    try:
        ticker = yf.Ticker(yf_symbol)
        try:
            fi = ticker.fast_info
            price = getattr(fi, "last_price", None)
            prev_close = getattr(fi, "previous_close", None)
            day_high = getattr(fi, "day_high", None)
            day_low = getattr(fi, "day_low", None)
            volume = getattr(fi, "last_volume", None)
            fifty_two_high = getattr(fi, "year_high", None)
            fifty_two_low = getattr(fi, "year_low", None)
        except Exception:
            pass

        if price is None or prev_close is None or name == clean_sym:
            try:
                info = ticker.info or {}
                if price is None:
                    price = info.get("regularMarketPrice") or info.get("currentPrice") or info.get("previousClose")
                if prev_close is None:
                    prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
                if day_high is None:
                    day_high = info.get("dayHigh") or info.get("regularMarketDayHigh")
                if day_low is None:
                    day_low = info.get("dayLow") or info.get("regularMarketDayLow")
                if volume is None:
                    volume = info.get("volume") or info.get("regularMarketVolume")
                if fifty_two_high is None:
                    fifty_two_high = info.get("fiftyTwoWeekHigh")
                if fifty_two_low is None:
                    fifty_two_low = info.get("fiftyTwoWeekLow")
                if name == clean_sym:
                    name = info.get("longName") or info.get("shortName") or clean_sym
            except Exception:
                pass
    except Exception:
        is_stale = True

    def safe_round(val: Optional[float]) -> Optional[float]:
        if val is None or math.isnan(val) or math.isinf(val):
            return None
        return round(float(val), 2)

    def safe_int(val: Optional[float]) -> Optional[int]:
        if val is None or math.isnan(val) or math.isinf(val):
            return None
        return int(val)

    p = safe_round(price)
    pc = safe_round(prev_close)
    dh = safe_round(day_high)
    dl = safe_round(day_low)
    vol = safe_int(volume)
    ft_high = safe_round(fifty_two_high)
    ft_low = safe_round(fifty_two_low)

    change = None
    change_pct = None
    if p is not None and pc is not None and pc != 0:
        change = round(p - pc, 2)
        change_pct = round(((p - pc) / pc) * 100, 2)
    elif p is None:
        is_stale = True

    return {
        "symbol": clean_sym,
        "name": name,
        "price": p,
        "previousClose": pc,
        "change": change,
        "changePercent": change_pct,
        "high": dh,
        "low": dl,
        "volume": vol,
        "fiftyTwoWeekHigh": ft_high,
        "fiftyTwoWeekLow": ft_low,
        "timestamp": get_ist_now().isoformat(),
        "isStale": is_stale
    }

@app.get("/api/stocks/quotes")
def get_quotes(symbols: str = Query(default="", description="Comma-separated list of symbols")):
    if not symbols or not symbols.strip():
        return {"quotes": {}}
    
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
    unique_symbols = list(dict.fromkeys(symbol_list))
    
    quotes = {}
    for sym in unique_symbols:
        clean_sym = sanitize_symbol(sym)
        quotes[clean_sym] = fetch_single_quote(sym)
        
    return {"quotes": quotes}

@app.get("/api/stocks/{symbol}/history")
def get_stock_history(symbol: str, period: str = Query(default="1d")):
    clean_sym = sanitize_symbol(symbol)
    yf_symbol = f"{clean_sym}.NS" if not symbol.endswith((".NS", ".BO")) else symbol

    period_lower = period.lower()
    if period_lower == "1d":
        yf_period = "1d"
        interval = "5m"
    elif period_lower == "5d":
        yf_period = "5d"
        interval = "15m"
    elif period_lower in ["1m", "1mo"]:
        yf_period = "1mo"
        interval = "1d"
    else:
        yf_period = "1d"
        interval = "5m"

    history_points = []
    try:
        ticker = yf.Ticker(yf_symbol)
        df = ticker.history(period=yf_period, interval=interval)
        if not df.empty:
            for idx, row in df.iterrows():
                close_price = row.get("Close")
                if close_price is not None and not math.isnan(close_price):
                    if isinstance(idx, datetime):
                        dt = idx
                    else:
                        dt = idx.to_pydatetime()
                    
                    if period_lower == "1d":
                        time_str = dt.strftime("%H:%M")
                    elif period_lower == "5d":
                        time_str = dt.strftime("%b %d %H:%M")
                    else:
                        time_str = dt.strftime("%d %b")

                    history_points.append({
                        "time": time_str,
                        "price": round(float(close_price), 2)
                    })
    except Exception:
        pass

    return {
        "symbol": clean_sym,
        "period": period_lower,
        "history": history_points
    }