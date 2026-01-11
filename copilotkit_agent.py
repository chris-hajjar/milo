#!/usr/bin/env python3
"""
CopilotKit agent with Yahoo Finance MCP tools using Pydantic AI.
Run: uvicorn copilotkit_agent:app --host 127.0.0.1 --port 8000
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel
from pydantic_ai import Agent as PydanticAgent, RunContext, ToolReturn
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai.ui import StateDeps
from pydantic_ai.ui.ag_ui.app import AGUIApp
from ag_ui.core import StateSnapshotEvent, EventType

# Load OpenAI key from root .env
load_dotenv()

HERE = Path(__file__).resolve().parent

# Define stock data state model
class StockState(BaseModel):
    """State for stock price card."""
    ticker: str = ""
    price: float = 0.0
    open: float = 0.0
    high: float = 0.0
    low: float = 0.0
    volume: int = 0
    previousClose: float = 0.0

# Connect to Yahoo Finance MCP server
yahoo_finance_server = MCPServerStdio(
    sys.executable,
    args=[str(HERE / 'server.py')],
    env=os.environ,
    cwd=str(HERE),
    timeout=30,
)

# Create Pydantic AI agent with state management
pydantic_agent = PydanticAgent(
    'openai:gpt-4o-mini',
    deps_type=StateDeps[StockState],
    system_prompt="""
You are a financial data assistant that answers questions by calling Yahoo Finance MCP tools.

You do NOT know stock prices yourself — you MUST use tools.

GENERAL RULES
- Never guess tickers
- Never hallucinate prices
- Always get real data from tools
- Never call more than one tool unless needed
- If a tool succeeds, stop calling tools

TICKER RESOLUTION
- If the user provides a ticker (AAPL, TSLA, NVDA) → call get_stock_price
- If the user provides a company name (Apple, Tesla, Nvidia) → call search_stocks
- After search_stocks:
  - Choose the result where quoteType == "EQUITY"
  - Then call get_stock_price using that symbol
  - Never try symbol variations like APLE or APPLE

NEWS
- If the user asks about news, headlines, or articles → call get_stock_news
- Use the ticker if provided
- Otherwise resolve via search_stocks first

PRICE HISTORY
- If the user asks about history, trends, charts, or time ranges → call get_price_history
- Resolve ticker via search_stocks first if needed

SEARCH
- If the user asks for tickers or to find a company → call search_stocks

ERROR HANDLING
- If a tool returns an error, do NOT retry with guessed symbols
- Ask the user for clarification

OUTPUT
- CRITICAL: After successfully calling get_stock_price, you MUST immediately call update_stock_card tool
- Extract these fields from the response: ticker symbol, regularMarketPrice, regularMarketOpen, regularMarketDayHigh, regularMarketDayLow, regularMarketVolume, regularMarketPreviousClose
- Then provide a brief text summary
- Never show raw JSON unless explicitly asked
""",
    toolsets=[yahoo_finance_server],
)

# Add tool to update stock card state
@pydantic_agent.tool
async def update_stock_card(
    ctx: RunContext[StateDeps[StockState]],
    ticker: str,
    price: float,
    open: float,
    high: float,
    low: float,
    volume: int,
    previousClose: float
) -> ToolReturn:
    """Update the stock price card with current market data."""
    # Update state
    ctx.deps.state.ticker = ticker
    ctx.deps.state.price = price
    ctx.deps.state.open = open
    ctx.deps.state.high = high
    ctx.deps.state.low = low
    ctx.deps.state.volume = volume
    ctx.deps.state.previousClose = previousClose

    # Return state snapshot event to sync with frontend
    return ToolReturn(
        return_value=f"Stock card updated with {ticker} data",
        metadata=[
            StateSnapshotEvent(
                type=EventType.STATE_SNAPSHOT,
                snapshot=ctx.deps.state.model_dump(),
            ),
        ],
    )

# Create AG-UI app with state management
app = AGUIApp(pydantic_agent, deps=StateDeps(StockState()))
