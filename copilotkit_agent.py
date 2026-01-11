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
    result_type=str,
    system_prompt="""
You are a financial data assistant that answers questions by calling Yahoo Finance MCP tools.

You do NOT know stock prices yourself — you MUST use tools.

When a user asks about a stock price:
1. Call get_stock_price to get the data
2. Call update_stock_card with the data from step 1
3. Return a brief summary

ALWAYS call BOTH tools in sequence for any stock price query.
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
    print(f"🎯 update_stock_card called with: ticker={ticker}, price={price}")

    # Update state
    ctx.deps.state.ticker = ticker
    ctx.deps.state.price = price
    ctx.deps.state.open = open
    ctx.deps.state.high = high
    ctx.deps.state.low = low
    ctx.deps.state.volume = volume
    ctx.deps.state.previousClose = previousClose

    print(f"📊 State updated: {ctx.deps.state.model_dump()}")

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
