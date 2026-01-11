#!/usr/bin/env python3
"""
CopilotKit agent with Yahoo Finance native tools using Pydantic AI.
Run: uvicorn copilotkit_agent:app --host 127.0.0.1 --port 8000
"""
import os
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

MANDATORY: After calling get_stock_price or get_price_history, output NO text.
The visual component displays everything automatically.

FORBIDDEN after calling these tools:
- Summaries, analysis, or explanations
- Bullet points or lists
- Prices, dates, numbers, or any data
- Phrases like "Here's...", "The data shows..."
- Date ranges, time periods, or metrics
- Confirmation messages

Your response must be completely empty.

CORRECT:
User: "show me apple stock"
You: [call get_stock_price with symbol="AAPL"]
Your response: [EMPTY]

INCORRECT:
"Here's a summary of Apple's stock price..."
"Key Prices: Opening Price: $280.15..."
Any text response after calling these tools

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

# Create AG-UI app
app = AGUIApp(pydantic_agent)
