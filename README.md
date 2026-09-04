# Smart Watchlist
> **Know what changed.**

A personal market watchlist application built for the **Code by Groww 2026** challenge. Instead of displaying static daily price movements, Smart Watchlist establishes a personal baseline timestamp and tracks exact percentage changes ($\Delta\%$) since the user last checked their watchlist.

---

## Problem
Traditional market watchlists display standard 24-hour daily price movements ($+1.20\%$). However, when an investor returns to their screen after several hours or days, daily percentage changes fail to answer two fundamental questions:
1. **"What has changed in my watchlist since I last looked?"**
2. **"What deserves my immediate attention right now and why?"**

---

## Solution
Smart Watchlist allows users to set an explicit **Personal Price Checkpoint** ("Mark as checked"). Fresh market data is compared directly against this baseline to calculate exact price deltas ($\Delta\%$). Transparent, rule-based attention triggers categorize stocks into clear status levels so users can instantly focus on meaningful movements.

### Core User Flow
$$\text{Add Stocks} \longrightarrow \text{Set Baseline Checkpoint} \longrightarrow \text{Return Later} \longrightarrow \text{See Delta Since Check} \longrightarrow \text{Review Attention Flags}$$

---

## Key Features

- **Change Since Last Check**: Primary metric highlighting price movement ($\Delta\%$) relative to the user's saved baseline timestamp.
- **Explicit Checkpoint Baseline**: User-controlled "Mark as checked" action that updates baseline prices without automatic overwriting on quote refresh.
- **Transparent Attention Engine**: Rule-based attention triggers classifying movements into *Major Move*, *Moderate Gain*, *Moderate Dip*, and *Steady*.
- **Attention-First Presentation Sorting**: Displays stocks requiring attention at the top of the table without corrupting saved watchlist order.
- **Stock Detail Drawer**: Interactive right-side panel with Recharts `1D` / `5D` / `1M` performance graphs and stock details.
- **"Why am I seeing this?" Explainability Layer**: Clear, human-readable breakdown explaining why a stock triggered watchlist attention logic based on baseline threshold rules.
- **Instant Stock Search**: Auto-complete search across top Indian NSE equities with duplicate prevention.
- **Offline & Stale Data Resilience**: Gracefully displays saved watchlist structures and stale data indicators if the backend is offline.
- **LocalStorage Persistence**: Browser storage retains watchlist symbols, baseline prices, and timestamp without needing database setup.
- **Polished Financial UX**: Clean, light Groww-inspired interface with strong typography hierarchy, emerald green accents, and zero visual clutter.

---

## Attention Engine Logic

The `deltaEngine` utility compares current live prices against the saved baseline snapshot:

$$\Delta\% = \left( \frac{\text{Current Price} - \text{Baseline Price}}{\text{Baseline Price}} \right) \times 100$$

| Attention Level | Delta Threshold | Badge Styling | Human Explanation |
| :--- | :--- | :--- | :--- |
| 🚀 **Major Move** | $|\Delta\%| \ge 2.0\%$ | Amber / Gold | *"Up 2.4% since your last check"* / *"Down 2.4% since your last check"* |
| 📈 **Moderate Gain** | $+0.75\% \le \Delta\% < +2.0\%$ | Emerald Green | *"Up 1.2% since your last check"* |
| 📉 **Moderate Dip** | $-2.0\% < \Delta\% \le -0.75\%$ | Rose Red | *"Down 1.1% since your last check"* |
| 🟢 **Steady** | $-0.75\% < \Delta\% < +0.75\%$ | Slate Gray | *"No meaningful change since your last check"* |
| ⚪ **Initial Tracking** | No prior snapshot price | Muted Gray | *"Initial tracking started (no prior check price)"* |

*Note: The baseline price snapshot is updated **only** when the user explicitly clicks "Mark as checked".*

---

## Architecture

```
React 19 + Vite 8 + Tailwind CSS v4
              │
      Axios API Service
              │
       FastAPI Backend
              │
       yfinance Library
              │
    Real-time NSE Market Data
```

### LocalStorage Schema (`smart_watchlist_state`)
```json
{
  "watchlist": ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAPOWER"],
  "lastCheckedAt": "2026-09-04T11:40:00.000Z",
  "snapshot": {
    "RELIANCE": { "price": 1329.70, "timestamp": "2026-09-04T11:40:00.000Z" },
    "TCS": { "price": 2320.10, "timestamp": "2026-09-04T11:40:00.000Z" }
  }
}
```

### Why LocalStorage?
For a personal watchlist and checkpoint tracker, browser-native `localStorage` provides instant persistence, zero authentication latency, and offline support without the unnecessary overhead of a database service.

---

## Project Structure

```
groww-hackathon/
├── backend/
│   ├── main.py              # FastAPI application endpoints & market hours logic
│   ├── requirements.txt     # Python dependencies (UTF-8 encoded)
│   └── .env                 # Local environment configuration (ignored)
├── frontend/
│   ├── src/
│   │   ├── components/      # Header, SummaryBar, SearchBar, WatchlistTable, StockDetailDrawer, EmptyState, ErrorBanner
│   │   ├── services/        # api.js (Axios backend interface)
│   │   ├── utils/           # storage.js, deltaEngine.js, formatters.js
│   │   ├── App.jsx          # Main application container
│   │   ├── main.jsx         # React application entry point
│   │   └── index.css        # Tailwind CSS styles
│   ├── package.json         # Frontend dependencies & build scripts
│   └── vite.config.js       # Vite configuration
├── README.md                # Project documentation
└── .gitignore               # Ignored files & build artifacts
```

---

## Setup & Running (Windows)

### 1. Backend Setup
Open a terminal in the root directory:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*The FastAPI backend will start running at `http://localhost:8000`.*

### 2. Frontend Setup
Open a second terminal in the root directory:

```bash
cd frontend
npm install
npm run dev
```
*The React + Vite application will open at `http://localhost:5173`.*

> **Important**: Ensure the backend server is running on port 8000 before interacting with the frontend.

---

## API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Returns backend health status, ISO timestamp, and Indian market status (`market_open` boolean for 09:15–15:30 IST weekdays). |
| `/api/stocks/quotes?symbols=RELIANCE,TCS` | `GET` | Fetches live quote data (`price`, `previousClose`, `change`, `changePercent`, `high`, `low`, `volume`, `fiftyTwoWeekHigh`, `fiftyTwoWeekLow`, `isStale`). |
| `/api/stocks/search?q={query}` | `GET` | Instant autocomplete search against top Indian NSE equities. |
| `/api/stocks/{symbol}/history?period=1d` | `GET` | Returns historical price arrays for Recharts line graph (`1d`, `5d`, `1m`). |

---

## Design Decisions

1. **Change-Since-Last-Check as Primary Metric**: Traditional daily change reset at midnight does not reflect an individual user's review schedule. Measuring movement from the user's last check provides direct personal utility.
2. **Explicit User Baseline Control**: Baseline snapshots update **only** when the user clicks "Mark as checked", preventing market refreshes from erasing historical comparison context.
3. **Transparent Rule-Based Attention Engine**: Deterministic percentage rules provide explainable attention triggers without relying on black-box predictions.
4. **No AI Jargon / No Fake Explanations**: The platform explicitly clarifies that attention flags stem from watchlist threshold rules, avoiding speculative AI narrative generation.

---

## Edge Case Handling

- **Backend Offline**: Shows non-destructive notification banner while preserving saved watchlist symbols and previous baseline snapshots.
- **Missing / Delisted Ticker Data**: Displays `"Data unavailable"` pill for affected symbols with `isStale: true` flag without crashing the dashboard.
- **Empty Watchlist**: Displays warm empty state with quick-add chips for popular NSE equities.
- **Corrupted LocalStorage**: Automatically recovers by initializing default state with valid fallback structures.
- **Duplicate Stocks**: Search dropdown disables or prevents re-adding stocks already present in the watchlist.

---

## Verification & QA Summary

- **Backend Quote Accuracy**: Tested 15/15 curated NSE symbols (`RELIANCE`, `TCS`, `INFY`, `HDFCBANK`, `ICICIBANK`, `TATAPOWER`, `SBIN`, `BHARTIARTL`, `ITC`, `LT`, `WIPRO`, `AXISBANK`, `HINDUNILVR`, `MARUTI`, `KOTAKBANK`) against live API; **100% returned valid live quotes**.
- **Frontend Code Quality**: `npm run lint` passed with **0 warnings and 0 errors**.
- **Production Build**: `npm run build` compiled successfully in **770ms**.
- **Persistence & Sorting**: Verified `localStorage` baseline persistence and attention-first presentation sorting.

---

## Demonstration Walkthrough

To demonstrate the application during evaluation:

1. **Open Application**: Navigate to `http://localhost:5173`.
2. **Review Default Watchlist**: View live quotes for default stocks (`RELIANCE`, `TCS`, `INFY`, `HDFCBANK`, `TATAPOWER`).
3. **Establish Baseline**: Click **"Mark as checked"** in the top header. Observe the toast notification: *"Baseline updated. Future changes will be measured from this point."*
4. **Observe Baseline Persistence**: Refresh market data or return later. Note that the **"Change Since Last Check"** column calculates exact movement relative to your checkpoint.
5. **Inspect Summary**: Read the **"Since your last check"** card highlighting stocks requiring attention.
6. **Open Stock Drawer**: Click any stock row (e.g. `RELIANCE`). View the Recharts `1D` / `5D` / `1M` performance chart and the **"Why am I seeing this?"** explainability section.
7. **Search & Add Stock**: Use the search bar to add stocks like `SBIN` or `ITC`.