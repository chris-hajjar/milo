#!/usr/bin/env python3
"""
CopilotKit agent with Yahoo Finance native tools using Pydantic AI.
Run: uvicorn copilotkit_agent:app --host 127.0.0.1 --port 8000
"""
import os
import math
import httpx
import numpy as np
import random
import re
from pathlib import Path
from datetime import datetime, timedelta
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

def parse_positions(positions_str: str) -> list[dict]:
    """
    Parse a natural language position string into structured holdings.

    Formats supported:
    - "100 AAPL, 50 MSFT, 25 GOOGL"
    - "100 shares of AAPL, 50 shares of MSFT"
    - "AAPL 100, MSFT 50, GOOGL 25"
    """
    import re

    holdings = []

    # Split by comma or 'and'
    parts = re.split(r',|\s+and\s+', positions_str)

    for part in parts:
        part = part.strip()
        if not part:
            continue

        # Try to extract number and ticker
        # Pattern 1: "100 AAPL" or "100 shares of AAPL"
        match = re.search(r'(\d+)\s+(?:shares?\s+(?:of\s+)?)?([A-Z]{1,5})', part, re.IGNORECASE)
        if match:
            quantity = int(match.group(1))
            ticker = match.group(2).upper()
            holdings.append({"ticker": ticker, "quantity": quantity})
            continue

        # Pattern 2: "AAPL 100" or "AAPL: 100"
        match = re.search(r'([A-Z]{1,5})[:\s]+(\d+)', part, re.IGNORECASE)
        if match:
            ticker = match.group(1).upper()
            quantity = int(match.group(2))
            holdings.append({"ticker": ticker, "quantity": quantity})
            continue

    return holdings

def generate_mock_transactions(seed=42):
    """
    Generate mock transaction data for testing (1 year of data).
    Returns a list of transaction dictionaries with various types.
    """
    random.seed(seed)
    np.random.seed(seed)

    transactions = []
    transaction_id = 1000

    # Account types and tickers
    accounts = ["TFSA", "RRSP", "Non-registered"]
    tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "VFV.TO", "XIC.TO", "QQQ"]

    # USD to CAD exchange rate (fixed for mock data)
    usd_to_cad = 1.35

    # Helper to determine if ticker is USD or CAD
    def is_cad_ticker(ticker):
        return ticker.endswith(".TO")

    # Start date: 1 year ago
    start_date = datetime.now() - timedelta(days=365)

    # 1. Initial deposits (one per account)
    for account in accounts:
        amount = random.randint(5000, 20000)
        transactions.append({
            "transaction_id": f"TXN{transaction_id}",
            "date": (start_date + timedelta(days=random.randint(0, 7))).isoformat(),
            "account_type": account,
            "transaction_type": "deposit",
            "ticker": None,
            "quantity": None,
            "price": None,
            "amount": amount,
            "description": f"Initial deposit to {account}",
            "currency": "CAD"
        })
        transaction_id += 1

    # 2. Monthly deposits over the year
    for month_offset in range(1, 12):
        for account in random.sample(accounts, k=random.randint(1, 2)):
            amount = random.randint(500, 2500)
            deposit_date = start_date + timedelta(days=30 * month_offset + random.randint(0, 5))
            transactions.append({
                "transaction_id": f"TXN{transaction_id}",
                "date": deposit_date.isoformat(),
                "account_type": account,
                "transaction_type": "deposit",
                "ticker": None,
                "quantity": None,
                "price": None,
                "amount": amount,
                "description": f"Monthly contribution to {account}",
                "currency": "CAD"
            })
            transaction_id += 1

    # 3. Stock purchases (20-30 purchases)
    num_purchases = random.randint(20, 30)
    for _ in range(num_purchases):
        account = random.choice(accounts)
        ticker = random.choice(tickers)
        quantity = random.randint(1, 50)

        # Mock prices based on ticker
        if ticker == "AAPL":
            price_usd = random.uniform(150, 200)
        elif ticker == "MSFT":
            price_usd = random.uniform(300, 400)
        elif ticker == "GOOGL":
            price_usd = random.uniform(130, 160)
        elif ticker == "AMZN":
            price_usd = random.uniform(140, 180)
        elif ticker == "TSLA":
            price_usd = random.uniform(200, 300)
        elif ticker == "VFV.TO":
            price_usd = random.uniform(100, 120)
        elif ticker == "XIC.TO":
            price_usd = random.uniform(30, 35)
        else:  # QQQ
            price_usd = random.uniform(350, 450)

        # Convert to CAD if USD ticker
        if is_cad_ticker(ticker):
            price = price_usd
            currency = "CAD"
        else:
            price = price_usd * usd_to_cad
            currency = "CAD"  # All amounts converted to CAD

        amount = -(quantity * price)  # Negative for purchase
        purchase_date = start_date + timedelta(days=random.randint(10, 350))

        transactions.append({
            "transaction_id": f"TXN{transaction_id}",
            "date": purchase_date.isoformat(),
            "account_type": account,
            "transaction_type": "purchase",
            "ticker": ticker,
            "quantity": quantity,
            "price": round(price, 2),
            "amount": round(amount, 2),
            "description": f"Bought {quantity} shares of {ticker}",
            "currency": currency
        })
        transaction_id += 1

    # 4. Stock sales (5-10 sales)
    num_sales = random.randint(5, 10)
    for _ in range(num_sales):
        account = random.choice(accounts)
        ticker = random.choice(tickers)
        quantity = random.randint(1, 30)

        # Mock prices (slightly different from purchases)
        if ticker == "AAPL":
            price_usd = random.uniform(160, 210)
        elif ticker == "MSFT":
            price_usd = random.uniform(310, 410)
        elif ticker == "GOOGL":
            price_usd = random.uniform(135, 165)
        elif ticker == "AMZN":
            price_usd = random.uniform(145, 185)
        elif ticker == "TSLA":
            price_usd = random.uniform(210, 310)
        elif ticker == "VFV.TO":
            price_usd = random.uniform(105, 125)
        elif ticker == "XIC.TO":
            price_usd = random.uniform(31, 36)
        else:  # QQQ
            price_usd = random.uniform(360, 460)

        # Convert to CAD if USD ticker
        if is_cad_ticker(ticker):
            price = price_usd
            currency = "CAD"
        else:
            price = price_usd * usd_to_cad
            currency = "CAD"

        amount = quantity * price  # Positive for sale
        sale_date = start_date + timedelta(days=random.randint(30, 360))

        transactions.append({
            "transaction_id": f"TXN{transaction_id}",
            "date": sale_date.isoformat(),
            "account_type": account,
            "transaction_type": "sale",
            "ticker": ticker,
            "quantity": quantity,
            "price": round(price, 2),
            "amount": round(amount, 2),
            "description": f"Sold {quantity} shares of {ticker}",
            "currency": currency
        })
        transaction_id += 1

    # 5. Quarterly dividends for select tickers
    dividend_tickers = ["AAPL", "MSFT", "VFV.TO", "XIC.TO"]
    for quarter in range(4):
        for ticker in dividend_tickers:
            if random.random() < 0.7:  # 70% chance of dividend
                account = random.choice(accounts)
                dividend_per_share = random.uniform(0.5, 2.0)
                shares_held = random.randint(10, 100)

                # Convert to CAD if USD ticker
                if is_cad_ticker(ticker):
                    amount = dividend_per_share * shares_held
                else:
                    amount = dividend_per_share * shares_held * usd_to_cad

                div_date = start_date + timedelta(days=90 * quarter + random.randint(0, 30))

                transactions.append({
                    "transaction_id": f"TXN{transaction_id}",
                    "date": div_date.isoformat(),
                    "account_type": account,
                    "transaction_type": "dividend",
                    "ticker": ticker,
                    "quantity": None,
                    "price": None,
                    "amount": round(amount, 2),
                    "description": f"Dividend from {ticker}",
                    "currency": "CAD"
                })
                transaction_id += 1

    # 6. Monthly interest income
    for month_offset in range(12):
        for account in random.sample(accounts, k=random.randint(1, 2)):
            amount = random.uniform(5, 50)
            interest_date = start_date + timedelta(days=30 * month_offset + random.randint(25, 30))

            transactions.append({
                "transaction_id": f"TXN{transaction_id}",
                "date": interest_date.isoformat(),
                "account_type": account,
                "transaction_type": "interest",
                "ticker": None,
                "quantity": None,
                "price": None,
                "amount": round(amount, 2),
                "description": f"Interest income in {account}",
                "currency": "CAD"
            })
            transaction_id += 1

    # 7. Occasional fees
    num_fees = random.randint(3, 8)
    for _ in range(num_fees):
        account = random.choice(accounts)
        amount = -random.uniform(5, 25)
        fee_date = start_date + timedelta(days=random.randint(30, 350))

        transactions.append({
            "transaction_id": f"TXN{transaction_id}",
            "date": fee_date.isoformat(),
            "account_type": account,
            "transaction_type": "fee",
            "ticker": None,
            "quantity": None,
            "price": None,
            "amount": round(amount, 2),
            "description": f"Account maintenance fee",
            "currency": "CAD"
        })
        transaction_id += 1

    # 8. A few withdrawals
    num_withdrawals = random.randint(2, 5)
    for _ in range(num_withdrawals):
        account = random.choice(["Non-registered", "TFSA"])  # Can't withdraw from RRSP easily
        amount = -random.randint(500, 3000)
        withdrawal_date = start_date + timedelta(days=random.randint(60, 350))

        transactions.append({
            "transaction_id": f"TXN{transaction_id}",
            "date": withdrawal_date.isoformat(),
            "account_type": account,
            "transaction_type": "withdrawal",
            "ticker": None,
            "quantity": None,
            "price": None,
            "amount": amount,
            "description": f"Withdrawal from {account}",
            "currency": "CAD"
        })
        transaction_id += 1

    # Sort by date
    transactions.sort(key=lambda t: t["date"])

    return transactions

def parse_timeframe(query: str):
    """
    Extract start and end dates from natural language timeframe.
    Returns (start_date, end_date) as ISO strings or (None, None).
    """
    query_lower = query.lower()
    now = datetime.now()

    # "last X days"
    match = re.search(r'last\s+(\d+)\s+days?', query_lower)
    if match:
        days = int(match.group(1))
        start = now - timedelta(days=days)
        return start.isoformat(), now.isoformat()

    # "last X months"
    match = re.search(r'last\s+(\d+)\s+months?', query_lower)
    if match:
        months = int(match.group(1))
        start = now - timedelta(days=months * 30)
        return start.isoformat(), now.isoformat()

    # "this year" or "YTD"
    if 'this year' in query_lower or 'ytd' in query_lower:
        start = datetime(now.year, 1, 1)
        return start.isoformat(), now.isoformat()

    # "this month"
    if 'this month' in query_lower:
        start = datetime(now.year, now.month, 1)
        return start.isoformat(), now.isoformat()

    # "last year"
    if 'last year' in query_lower:
        start = datetime(now.year - 1, 1, 1)
        end = datetime(now.year - 1, 12, 31)
        return start.isoformat(), end.isoformat()

    # "Q1", "Q2", etc. (assume current year if not specified)
    match = re.search(r'q([1-4])(?:\s+(\d{4}))?', query_lower)
    if match:
        quarter = int(match.group(1))
        year = int(match.group(2)) if match.group(2) else now.year

        quarter_starts = {
            1: (1, 1),
            2: (4, 1),
            3: (7, 1),
            4: (10, 1)
        }
        quarter_ends = {
            1: (3, 31),
            2: (6, 30),
            3: (9, 30),
            4: (12, 31)
        }

        start = datetime(year, *quarter_starts[quarter])
        end = datetime(year, *quarter_ends[quarter])
        return start.isoformat(), end.isoformat()

    # Default: last 30 days
    start = now - timedelta(days=30)
    return start.isoformat(), now.isoformat()

def parse_account_type(query: str):
    """
    Extract account type from query.
    Returns account type string or None.
    """
    query_lower = query.lower()

    if 'tfsa' in query_lower:
        return "TFSA"
    elif 'rrsp' in query_lower:
        return "RRSP"
    elif 'non-registered' in query_lower or 'taxable' in query_lower:
        return "Non-registered"
    elif 'resp' in query_lower:
        return "RESP"
    elif 'lira' in query_lower:
        return "LIRA"

    return None

def parse_transaction_types(query: str):
    """
    Extract transaction types from query.
    Returns list of transaction type strings.
    """
    query_lower = query.lower()
    types = []

    if 'dividend' in query_lower:
        types.append("dividend")
    if 'deposit' in query_lower or 'contribution' in query_lower:
        types.append("deposit")
    if 'withdrawal' in query_lower or 'withdraw' in query_lower:
        types.append("withdrawal")
    if 'purchase' in query_lower or 'buy' in query_lower or 'bought' in query_lower:
        types.append("purchase")
    if 'sale' in query_lower or 'sell' in query_lower or 'sold' in query_lower:
        types.append("sale")
    if 'fee' in query_lower or 'charge' in query_lower:
        types.append("fee")
    if 'interest' in query_lower:
        types.append("interest")

    return types

def parse_ticker(query: str):
    """
    Extract ticker symbol from query.
    Returns ticker string or None.
    """
    # Look for uppercase 2-5 letter words, optionally with .TO suffix
    match = re.search(r'\b([A-Z]{2,5}(?:\.TO)?)\b', query)
    if match:
        return match.group(1)
    return None

@pydantic_agent.tool_plain
async def analyze_portfolio_risk(
    positions: str,
    volatility_limit: float = None,
    var_limit: float = None,
    concentration_limit: float = None
) -> dict:
    """
    Analyze a portfolio's risk metrics including volatility, Value at Risk, and concentration.

    Args:
        positions: Portfolio holdings as a string (e.g., "100 AAPL, 50 MSFT, 25 GOOGL")
        volatility_limit: Optional max portfolio volatility in % (e.g., 20 means 20%)
        var_limit: Optional max Value at Risk in dollars (e.g., 5000 means $5,000)
        concentration_limit: Optional max single position % (e.g., 30 means 30%)

    Returns:
        Complete risk analysis with portfolio value, volatility, VaR, positions, and alerts

    Examples:
        - analyze_portfolio_risk("100 AAPL, 50 MSFT, 25 GOOGL")
        - analyze_portfolio_risk("100 AAPL, 50 MSFT", volatility_limit=20, var_limit=5000, concentration_limit=30)
    """
    # Parse positions from natural language
    holdings = parse_positions(positions)

    if not holdings:
        return {"error": "Could not parse any positions from input"}

    # Build limits dict
    limits = {}
    if volatility_limit is not None:
        limits["volatility"] = volatility_limit
    if var_limit is not None:
        limits["var"] = var_limit
    if concentration_limit is not None:
        limits["concentration"] = concentration_limit

    # 1. Fetch current prices and calculate volatility for each position
    position_list = []
    portfolio_value = 0

    for holding in holdings:
        ticker = holding["ticker"].upper().strip()
        quantity = holding["quantity"]

        if quantity <= 0:
            continue

        try:
            # Get current price
            stock_data = await fetch(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}",
                {"interval": "1d", "range": "1d"}
            )

            chart = stock_data.get("chart", {})
            if "result" not in chart or not chart["result"]:
                continue

            result = chart["result"][0]
            meta = result["meta"]
            price = safe_float(meta.get("regularMarketPrice"))

            if not price:
                continue

            # Get 30-day history for volatility
            hist_data = await fetch(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}",
                {"range": "1mo", "interval": "1d"}
            )

            hist_chart = hist_data.get("chart", {})
            if "result" in hist_chart and hist_chart["result"]:
                hist_result = hist_chart["result"][0]
                hist_quote = hist_result["indicators"]["quote"][0]
                closes = [safe_float(c) for c in hist_quote["close"] if c is not None]

                # Calculate daily returns and volatility
                if len(closes) > 1:
                    returns = []
                    for i in range(1, len(closes)):
                        if closes[i-1] and closes[i-1] != 0:
                            ret = (closes[i] - closes[i-1]) / closes[i-1]
                            returns.append(ret)

                    if returns:
                        daily_vol = float(np.std(returns))
                        annualized_vol = daily_vol * np.sqrt(252) * 100
                    else:
                        annualized_vol = 0.0
                else:
                    annualized_vol = 0.0
            else:
                annualized_vol = 0.0

            position_value = price * quantity
            portfolio_value += position_value

            position_list.append({
                "ticker": ticker,
                "quantity": quantity,
                "price": round(price, 2),
                "value": round(position_value, 2),
                "volatility": round(annualized_vol, 2),
            })

        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            continue

    if portfolio_value == 0 or not position_list:
        return {"error": "Could not fetch data for any holdings"}

    # 2. Calculate percentages after we know portfolio value
    for pos in position_list:
        pos["percentage"] = round((pos["value"] / portfolio_value) * 100, 2)

    # 3. Calculate portfolio-level metrics
    weights = [p["percentage"] / 100 for p in position_list]
    volatilities = [p["volatility"] / 100 for p in position_list]

    # Weighted average volatility (simplified portfolio volatility)
    portfolio_volatility = sum(w * v for w, v in zip(weights, volatilities)) * 100

    # Value at Risk (95% confidence, 1-day)
    z_score_95 = 1.645
    daily_vol = portfolio_volatility / 100 / np.sqrt(252)
    var_95 = portfolio_value * daily_vol * z_score_95

    max_concentration = max(p["percentage"] for p in position_list)

    # 4. Check alerts if limits provided
    alerts = []

    def check_limit(metric_name, current_value, limit_key, unit):
        if limit_key not in limits or limits[limit_key] is None:
            return

        limit_value = limits[limit_key]
        percentage = (current_value / limit_value) * 100

        if percentage >= 100:
            alerts.append({
                "severity": "red",
                "metric": metric_name,
                "current": round(current_value, 2),
                "limit": limit_value,
                "percentage": round(percentage, 1),
                "unit": unit,
                "message": f"{metric_name} {current_value:.1f}{unit} exceeds limit of {limit_value:.1f}{unit}"
            })
        elif percentage >= 80:
            alerts.append({
                "severity": "yellow",
                "metric": metric_name,
                "current": round(current_value, 2),
                "limit": limit_value,
                "percentage": round(percentage, 1),
                "unit": unit,
                "message": f"{metric_name} {current_value:.1f}{unit} approaching limit ({percentage:.0f}%)"
            })

    check_limit("Portfolio Volatility", portfolio_volatility, "volatility", "%")
    check_limit("Value at Risk", var_95, "var", "$")
    check_limit("Max Concentration", max_concentration, "concentration", "%")

    # Sort positions by value (largest first)
    position_list.sort(key=lambda p: p["value"], reverse=True)

    return {
        "portfolio_value": round(portfolio_value, 2),
        "num_holdings": len(position_list),
        "portfolio_volatility": round(portfolio_volatility, 2),
        "var_95": round(var_95, 2),
        "max_concentration": round(max_concentration, 2),
        "positions": position_list,
        "alerts": alerts,
        "timestamp": datetime.now().isoformat(),
    }

@pydantic_agent.tool_plain
async def compare_portfolio_scenarios(
    current_positions: str,
    proposed_positions: str,
    current_name: str = "Current",
    proposed_name: str = "Proposed"
) -> dict:
    """
    Compare risk metrics between two portfolio scenarios for what-if analysis.

    Args:
        current_positions: Current portfolio holdings (e.g., "100 AAPL, 50 MSFT")
        proposed_positions: Proposed portfolio holdings (e.g., "100 AAPL, 50 MSFT, 50 TSLA")
        current_name: Name for current scenario (default: "Current")
        proposed_name: Name for proposed scenario (default: "Proposed")

    Returns:
        Side-by-side comparison with risk metrics and changes

    Examples:
        - compare_portfolio_scenarios("100 AAPL, 50 MSFT", "100 AAPL, 50 MSFT, 50 TSLA")
        - compare_portfolio_scenarios("200 AAPL", "100 AAPL, 100 GOOGL", current_name="Tech Heavy", proposed_name="Diversified")
    """
    result_a = await analyze_portfolio_risk(current_positions)
    result_b = await analyze_portfolio_risk(proposed_positions)

    return {
        "scenario_a": {
            "name": current_name,
            **result_a
        },
        "scenario_b": {
            "name": proposed_name,
            **result_b
        },
        "comparison": {
            "value_change": round(result_b.get("portfolio_value", 0) - result_a.get("portfolio_value", 0), 2),
            "volatility_change": round(result_b.get("portfolio_volatility", 0) - result_a.get("portfolio_volatility", 0), 2),
            "var_change": round(result_b.get("var_95", 0) - result_a.get("var_95", 0), 2),
        }
    }

@pydantic_agent.tool_plain
async def calculate_optimal_position_size(
    ticker: str,
    current_positions: str,
    max_concentration_pct: float = 20.0
) -> dict:
    """
    Calculate how many shares to buy without exceeding concentration limits.

    Args:
        ticker: Stock symbol to analyze (e.g., "NVDA")
        current_positions: Current portfolio holdings (e.g., "100 AAPL, 50 MSFT")
        max_concentration_pct: Maximum position concentration in % (default: 20%)

    Returns:
        Recommended shares and investment amount to stay within limits

    Examples:
        - calculate_optimal_position_size("NVDA", "100 AAPL, 50 MSFT")
        - calculate_optimal_position_size("TSLA", "200 MSFT, 100 GOOGL", max_concentration_pct=25)
    """
    ticker = ticker.upper().strip()

    # Get current portfolio value
    result = await analyze_portfolio_risk(current_positions)
    if "error" in result:
        return result

    current_portfolio_value = result["portfolio_value"]

    # Get target stock price
    try:
        stock_data = await fetch(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}",
            {"interval": "1d", "range": "1d"}
        )

        chart = stock_data.get("chart", {})
        if "result" not in chart or not chart["result"]:
            return {"error": f"Could not fetch price for {ticker}"}

        result_data = chart["result"][0]
        meta = result_data["meta"]
        price = safe_float(meta.get("regularMarketPrice"))

        if not price or price == 0:
            return {"error": f"Invalid price for {ticker}"}

    except Exception as e:
        return {"error": f"Error fetching {ticker}: {str(e)}"}

    # Calculate max position value based on concentration limit
    max_position_value = current_portfolio_value * (max_concentration_pct / 100)

    # Calculate shares
    max_shares = int(max_position_value / price)

    return {
        "ticker": ticker,
        "current_price": round(price, 2),
        "current_portfolio_value": round(current_portfolio_value, 2),
        "max_concentration_limit": max_concentration_pct,
        "max_position_value": round(max_position_value, 2),
        "max_shares": max_shares,
        "recommended_investment": round(max_shares * price, 2),
        "resulting_concentration": round((max_shares * price / current_portfolio_value) * 100, 2),
    }

@pydantic_agent.tool_plain
async def query_transactions(query: str) -> dict:
    """
    Query transaction history with natural language filters.

    Supports filtering by:
    - Timeframe: "last 30 days", "this year", "Q1 2026", etc.
    - Account type: "TFSA", "RRSP", "Non-registered"
    - Transaction type: "dividend", "deposit", "withdrawal", "purchase", "sale", "fee", "interest"
    - Ticker: "AAPL", "GOOGL", etc.

    Returns transaction data with summary statistics and time series aggregation.

    Examples:
        - "Show me all dividends in the last 90 days"
        - "RRSP deposits this year"
        - "TFSA purchases in the last 30 days"
        - "All AAPL transactions"
        - "Fees in Q1 2026"
    """
    # Generate mock transaction data
    all_transactions = generate_mock_transactions(seed=42)

    # Parse filters from query
    start_date, end_date = parse_timeframe(query)
    account_type = parse_account_type(query)
    transaction_types = parse_transaction_types(query)
    ticker = parse_ticker(query)

    # Filter transactions
    filtered = all_transactions

    # Filter by date range
    if start_date and end_date:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
        filtered = [
            t for t in filtered
            if start_dt <= datetime.fromisoformat(t["date"]) <= end_dt
        ]

    # Filter by account type
    if account_type:
        filtered = [t for t in filtered if t["account_type"] == account_type]

    # Filter by transaction types
    if transaction_types:
        filtered = [t for t in filtered if t["transaction_type"] in transaction_types]

    # Filter by ticker
    if ticker:
        filtered = [t for t in filtered if t["ticker"] == ticker]

    # Calculate summary statistics
    total_amount = sum(t["amount"] for t in filtered)
    total_count = len(filtered)

    # Breakdown by type
    by_type = {}
    for t in filtered:
        ttype = t["transaction_type"]
        if ttype not in by_type:
            by_type[ttype] = {"count": 0, "total": 0.0}
        by_type[ttype]["count"] += 1
        by_type[ttype]["total"] += t["amount"]

    # Round totals
    for ttype in by_type:
        by_type[ttype]["total"] = round(by_type[ttype]["total"], 2)

    # Breakdown by account
    by_account = {}
    for t in filtered:
        account = t["account_type"]
        if account not in by_account:
            by_account[account] = {"count": 0, "total": 0.0}
        by_account[account]["count"] += 1
        by_account[account]["total"] += t["amount"]

    # Round totals
    for account in by_account:
        by_account[account]["total"] = round(by_account[account]["total"], 2)

    # Generate monthly time series
    time_series = {}
    for t in filtered:
        date_obj = datetime.fromisoformat(t["date"])
        month_key = date_obj.strftime("%Y-%m")

        if month_key not in time_series:
            time_series[month_key] = {"amount": 0.0, "count": 0}

        time_series[month_key]["amount"] += t["amount"]
        time_series[month_key]["count"] += 1

    # Convert to sorted list
    time_series_list = [
        {
            "date": month,
            "amount": round(data["amount"], 2),
            "count": data["count"]
        }
        for month, data in sorted(time_series.items())
    ]

    return {
        "query": query,
        "filters": {
            "start_date": start_date,
            "end_date": end_date,
            "account_type": account_type,
            "transaction_types": transaction_types,
            "ticker": ticker
        },
        "summary": {
            "total_amount": round(total_amount, 2),
            "total_count": total_count,
            "by_type": by_type,
            "by_account": by_account
        },
        "time_series": time_series_list,
        "transactions": filtered,
        "timestamp": datetime.now().isoformat()
    }

# Create AG-UI app
app = AGUIApp(pydantic_agent)
