#!/usr/bin/env python3
"""
CopilotKit agent with Yahoo Finance MCP tools using Pydantic AI.
Run: uvicorn copilotkit_agent:app --host 127.0.0.1 --port 8000
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from pydantic_ai import Agent as PydanticAgent
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai.ui.ag_ui.app import AGUIApp

# Load OpenAI key from root .env
load_dotenv()

HERE = Path(__file__).resolve().parent

# Connect to Yahoo Finance MCP server
yahoo_finance_server = MCPServerStdio(
    sys.executable,
    args=[str(HERE / 'server.py')],
    env=os.environ,
    cwd=str(HERE),
    timeout=30,
)

# Create Pydantic AI agent with Yahoo Finance tools
pydantic_agent = PydanticAgent(
    'openai:gpt-4o-mini',
    system_prompt="""
You are a financial data assistant that answers questions by calling Yahoo Finance MCP tools.

You do NOT know stock prices yourself — you MUST use tools to get accurate data.

When a user asks about a stock price, call the get_stock_price tool with the appropriate symbol.

IMPORTANT: The following tools automatically display visual components in the UI:
- get_stock_price: Shows a card with stock details
- get_price_history: Shows an interactive price chart

When you call these tools, provide ONLY a brief confirmation message (1 sentence max).
Do NOT repeat the data from the tool result in text form, as it will be displayed visually.

Example responses:
- "Here's the current price for AAPL" (then the card/chart appears)
- "I've loaded the price history for TSLA over the past 6 months" (then the chart appears)
""",
    toolsets=[yahoo_finance_server],
)

# Create AG-UI app
app = AGUIApp(pydantic_agent)
