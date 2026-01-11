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

CRITICAL DISPLAY RULES:
The following tools have visual UI components that automatically display data:
- get_stock_price: Shows a detailed card with all stock information
- get_price_history: Shows an interactive price chart with all OHLCV data

When you call these tools:
1. Provide ONLY a brief, natural language summary (1 sentence max)
2. You MAY calculate percentage changes or trends from the data to make your response more informative
3. NEVER list out individual prices, dates, or numerical data points from the tool result
4. NEVER format the tool result as a table or list
5. NEVER describe technical details like "loaded X data points" or intervals
6. The visual component will show all the detailed data automatically

Good examples:
- "TSLA is up 15% over the past 6 months. Here's the chart."
- "AAPL has been trending sideways this month."
- "Here's the price history for GOOGL."

Bad examples:
- "Here are the prices: 2023-01-01: $150, 2023-01-02: $152..." ❌
- "Loaded 30 price points for AAPL (1mo, 1d interval)" ❌
- Listing each data point in any format ❌

Remember: The UI handles all data visualization. Your job is to call the tool and provide a brief, natural summary only.
""",
    toolsets=[yahoo_finance_server],
)

# Create AG-UI app
app = AGUIApp(pydantic_agent)
