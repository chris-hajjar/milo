#!/usr/bin/env python3
"""
Simple Yahoo Finance MCP server without yfinance or curl-cffi.
Uses httpx to fetch data directly from Yahoo Finance's public API.
Runs 100% locally on any macOS version!
"""

import json
import httpx
from fastmcp import FastMCP

# Create MCP server
mcp = FastMCP("Yahoo Finance Simple")


@mcp.tool()
async def get_stock_price(symbol: str) -> dict:
    """Get current stock price and basic info for a ticker symbol."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    params = {
        "interval": "1d",
        "range": "1d",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10.0)
        data = response.json()

        if "chart" not in data or "error" in data.get("chart", {}):
            return {"error": "Stock symbol not found"}

        result = data["chart"]["result"][0]
        meta = result["meta"]
        quote = result["indicators"]["quote"][0]

        return {
            "symbol": symbol.upper(),
            "price": meta.get("regularMarketPrice"),
            "previous_close": meta.get("previousClose"),
            "currency": meta.get("currency"),
            "exchange": meta.get("exchangeName"),
            "open": quote["open"][-1] if quote.get("open") else None,
            "high": quote["high"][-1] if quote.get("high") else None,
            "low": quote["low"][-1] if quote.get("low") else None,
            "volume": quote["volume"][-1] if quote.get("volume") else None,
        }


@mcp.tool()
async def get_stock_news(symbol: str, count: int = 5) -> list:
    """Get recent news articles for a stock symbol."""
    url = f"https://query1.finance.yahoo.com/v1/finance/search"
    params = {
        "q": symbol,
        "newsCount": count,
        "quotesCount": 0,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10.0)
        data = response.json()

        news = data.get("news", [])
        return [
            {
                "title": article.get("title"),
                "publisher": article.get("publisher"),
                "link": article.get("link"),
                "published": article.get("providerPublishTime"),
            }
            for article in news[:count]
        ]


@mcp.tool()
async def get_price_history(
    symbol: str,
    range: str = "1mo",
    interval: str = "1d"
) -> dict:
    """
    Get historical price data for a stock.

    Args:
        symbol: Stock ticker symbol
        range: Time range (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        interval: Data interval (1d, 1wk, 1mo)
    """
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    params = {
        "interval": interval,
        "range": range,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10.0)
        data = response.json()

        if "chart" not in data or "error" in data.get("chart", {}):
            return {"error": "Stock symbol not found"}

        result = data["chart"]["result"][0]
        timestamps = result["timestamp"]
        quote = result["indicators"]["quote"][0]

        prices = []
        for i, ts in enumerate(timestamps):
            prices.append({
                "date": ts,
                "open": quote["open"][i],
                "high": quote["high"][i],
                "low": quote["low"][i],
                "close": quote["close"][i],
                "volume": quote["volume"][i],
            })

        return {
            "symbol": symbol.upper(),
            "range": range,
            "interval": interval,
            "prices": prices,
        }


@mcp.tool()
async def search_stocks(query: str, count: int = 5) -> list:
    """Search for stocks by company name or ticker symbol."""
    url = "https://query1.finance.yahoo.com/v1/finance/search"
    params = {
        "q": query,
        "quotesCount": count,
        "newsCount": 0,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10.0)
        data = response.json()

        quotes = data.get("quotes", [])
        return [
            {
                "symbol": quote.get("symbol"),
                "name": quote.get("longname") or quote.get("shortname"),
                "exchange": quote.get("exchange"),
                "type": quote.get("quoteType"),
            }
            for quote in quotes[:count]
        ]


if __name__ == "__main__":
    # Run the MCP server
    mcp.run()
