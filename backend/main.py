from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Groww Hackathon Backend Running"}

@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    ticker = yf.Ticker(f"{symbol}.NS")
    info = ticker.fast_info
    return {
        "symbol": symbol,
        "price": round(info.last_price, 2),
        "high": round(info.day_high, 2),
        "low": round(info.day_low, 2),
    }