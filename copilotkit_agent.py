#!/usr/bin/env python3
"""
CopilotKit agent with Yahoo Finance native tools using Pydantic AI.
Run: uvicorn copilotkit_agent:app --host 127.0.0.1 --port 8000
"""
import os
import math
import httpx
from pathlib import Path
from dotenv import load_dotenv
from pydantic_ai import Agent as PydanticAgent
from pydantic_ai.ui.ag_ui.app import AGUIApp

# Load OpenAI key from root .env
load_dotenv()

HERE = Path(__file__).resolve().parent

# Yahoo Finance API helpers
HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
}

def safe_float(x):
    try:
        if x is None:
            return None
        return float(x)
    except:
        return None

def last(arr):
    if not arr:
        return None
    v = arr[-1]
    return safe_float(v)

async def fetch(url, params=None):
    async with httpx.AsyncClient(headers=HEADERS, timeout=10) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        return r.json()

# Technical indicator helpers
def sma(values, period):
    if len(values) < period:
        return None
    return sum(values[-period:]) / period

def ema(values, period):
    if len(values) < period:
        return None
    k = 2 / (period + 1)
    ema_val = values[0]
    for v in values[1:]:
        ema_val = v * k + ema_val * (1 - k)
    return ema_val

def rsi(values, period=14):
    if len(values) < period + 1:
        return None

    gains = []
    losses = []

    for i in range(1, period + 1):
        delta = values[-i] - values[-i - 1]
        if delta >= 0:
            gains.append(delta)
        else:
            losses.append(abs(delta))

    avg_gain = sum(gains) / period if gains else 0
    avg_loss = sum(losses) / period if losses else 0

    if avg_loss == 0:
        return 100

    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

def bollinger(values, period=20, std_dev=2):
    if len(values) < period:
        return None

    window = values[-period:]
    mean = sum(window) / period
    variance = sum((x - mean) ** 2 for x in window) / period
    std = math.sqrt(variance)

    return {
        "middle": mean,
        "upper": mean + std_dev * std,
        "lower": mean - std_dev * std,
    }

def bollinger_bands_series(closes, timestamps, period=20, std_dev=2):
    """Calculate Bollinger Bands for all data points where possible."""
    if len(closes) < period:
        return []

    bands = []
    for i in range(period - 1, len(closes)):
        window = closes[i - period + 1:i + 1]
        mean = sum(window) / period
        variance = sum((x - mean) ** 2 for x in window) / period
        std = math.sqrt(variance)

        bands.append({
            "date": timestamps[i],
            "upper": mean + std_dev * std,
            "middle": mean,
            "lower": mean - std_dev * std,
            "close": closes[i],
        })

    return bands

# Create Pydantic AI agent with Yahoo Finance tools
pydantic_agent = PydanticAgent(
    'openai:gpt-4o',
    system_prompt="""
You are a financial data assistant that answers questions by calling Yahoo Finance tools.

You do NOT know stock prices yourself — you MUST use tools to get accurate data.

CRITICAL: VISUAL-ONLY TOOLS
The following tools have visual UI components that automatically display ALL data:
- get_stock_price: Shows a detailed card with all stock information
- get_price_history: Shows an interactive price chart with all OHLCV data
- get_technical_indicators: Shows an interactive chart with Bollinger Bands and technical indicators

MANDATORY: After calling get_stock_price, get_price_history, or get_technical_indicators:
- Output ONLY a brief acknowledgment (5 words max)
- Use phrases like: "Here you go", "Done", "Updated", "Check it out"
- DO NOT include any data, numbers, prices, or analysis

The visual component displays everything automatically — users can see all the data there.

FORBIDDEN after calling these tools:
- Summaries, analysis, or explanations
- Bullet points or lists
- Prices, dates, numbers, or any data values
- Phrases like "Here's a summary...", "The data shows..."
- Date ranges, time periods, or metrics
- Technical indicator values or interpretations
- Describing what the user can see

CORRECT EXAMPLES:
User: "show me apple stock"
You: [call get_stock_price with symbol="AAPL"]
Your response: "Here you go."

User: "show me bollinger bands for TSLA"
You: [call get_technical_indicators with symbol="TSLA"]
Your response: "Done, check it out."

User: "get apple price chart"
You: [call get_price_history with symbol="AAPL"]
Your response: "Updated."

INCORRECT EXAMPLES (DO NOT DO THIS):
❌ "Here's a summary of Apple's stock price..."
❌ "Key Prices: Opening Price: $280.15..."
❌ "The Bollinger Bands show that the stock is overbought..."
❌ "I've updated the chart with AAPL's price history from January to December showing a price range of..."
❌ Any text that includes data values, numbers, or describes what's in the visualization

For other tools like get_stock_news or search_stocks, you can provide normal text summaries.
""",
)

# Define tools
@pydantic_agent.tool_plain
async def get_stock_price(symbol: str) -> dict:
    """Get current stock price and basic information for a symbol."""
    symbol = symbol.upper().strip()

    data = await fetch(
        f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
        {"interval": "1d", "range": "1d"},
    )

    chart = data.get("chart", {})
    if "result" not in chart or not chart["result"]:
        return {"error": "Symbol not found"}

    result = chart["result"][0]
    meta = result["meta"]
    quote = result["indicators"]["quote"][0]

    previous_close = safe_float(meta.get("previousClose"))
    if previous_close is None:
        previous_close = safe_float(meta.get("chartPreviousClose"))
    if previous_close is None:
        previous_close = safe_float(meta.get("regularMarketPreviousClose"))

    return {
        "symbol": symbol,
        "price": safe_float(meta.get("regularMarketPrice")),
        "previous_close": previous_close,
        "currency": meta.get("currency"),
        "exchange": meta.get("exchangeName"),
        "open": last(quote.get("open")),
        "high": last(quote.get("high")),
        "low": last(quote.get("low")),
        "volume": last(quote.get("volume")),
    }

@pydantic_agent.tool_plain
async def get_price_history(symbol: str, period: str = "1mo", interval: str = "1d") -> list:
    """Fetch historical price data for a stock symbol. Returns only price data - UI component handles display."""
    symbol = symbol.upper().strip()

    data = await fetch(
        f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
        {"range": period, "interval": interval},
    )

    chart = data.get("chart", {})
    if "result" not in chart or not chart["result"]:
        return []

    result = chart["result"][0]
    ts = result["timestamp"]
    q = result["indicators"]["quote"][0]

    candles = []
    for i in range(len(ts)):
        candles.append(
            {
                "date": ts[i],
                "open": safe_float(q["open"][i]),
                "high": safe_float(q["high"][i]),
                "low": safe_float(q["low"][i]),
                "close": safe_float(q["close"][i]),
                "volume": safe_float(q["volume"][i]),
            }
        )

    return candles

@pydantic_agent.tool_plain
async def get_stock_news(symbol: str, count: int = 5) -> list:
    """Get recent news articles for a stock symbol."""
    data = await fetch(
        "https://query1.finance.yahoo.com/v1/finance/search",
        {"q": symbol, "newsCount": count, "quotesCount": 0},
    )

    return [
        {
            "title": n.get("title"),
            "publisher": n.get("publisher"),
            "link": n.get("link"),
            "published": n.get("providerPublishTime"),
        }
        for n in data.get("news", [])[:count]
    ]

@pydantic_agent.tool_plain
async def search_stocks(query: str, count: int = 5) -> list:
    """Search for stock symbols by company name or ticker."""
    data = await fetch(
        "https://query1.finance.yahoo.com/v1/finance/search",
        {"q": query, "quotesCount": count, "newsCount": 0},
    )

    return [
        {
            "symbol": q.get("symbol"),
            "name": q.get("longname") or q.get("shortname"),
            "exchange": q.get("exchange"),
            "type": q.get("quoteType"),
        }
        for q in data.get("quotes", [])[:count]
    ]

@pydantic_agent.tool_plain
async def get_technical_indicators(
    symbol: str,
    period: str = "1mo",
    interval: str = "1d",
    rsi_period: int = 14,
    sma_periods: list[int] = None,
    bollinger_period: int = 20,
    bollinger_std: float = 2.0,
) -> dict:
    """Get technical indicators (RSI, SMA, MACD, Bollinger Bands) for a stock symbol."""
    if sma_periods is None:
        sma_periods = [20, 50, 200]

    symbol = symbol.upper().strip()

    data = await fetch(
        f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
        {"range": period, "interval": interval},
    )

    chart = data.get("chart", {})
    if "result" not in chart or not chart["result"]:
        return {"error": "Symbol not found"}

    result = chart["result"][0]
    q = result["indicators"]["quote"][0]
    timestamps = result["timestamp"]

    closes = [safe_float(c) for c in q["close"] if c is not None]

    if len(closes) < 20:
        return {"error": "Not enough price data"}

    sma_values = {p: sma(closes, p) for p in sma_periods}

    fast = ema(closes[-26:], 12)
    slow = ema(closes[-26:], 26)

    macd = None
    if fast and slow:
        macd = fast - slow

    # Get Bollinger Bands series for visualization
    bollinger_data = bollinger_bands_series(closes, timestamps, bollinger_period, bollinger_std)

    # Get price data for the same range as bollinger bands
    prices = []
    if bollinger_data:
        start_index = len(closes) - len(bollinger_data)
        for i, timestamp in enumerate(timestamps[start_index:], start=start_index):
            if i < len(closes):
                prices.append({
                    "date": timestamp,
                    "close": closes[i],
                })

    return {
        "symbol": symbol,
        "interval": interval,
        "period": period,
        "rsi": rsi(closes, rsi_period),
        "sma": sma_values,
        "macd": macd,
        "bollinger": bollinger(closes, bollinger_period, bollinger_std),
        "bollinger_data": bollinger_data,
        "prices": prices,
    }

# Create AG-UI app
app = AGUIApp(pydantic_agent)
