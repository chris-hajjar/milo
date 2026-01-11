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

🚨 CRITICAL DISPLAY RULES - READ CAREFULLY 🚨
The following tools render VISUAL COMPONENTS that display ALL data automatically:
- get_stock_price: Shows a detailed card with all stock information
- get_price_history: Shows an interactive price chart with all OHLCV data

When you call these tools, your response MUST be minimal:
1. If the tool result has a "_display" field, respond with EXACTLY AND ONLY that message - DO NOT add anything else
2. IGNORE all other fields in the tool result (prices, dates, volume, etc.) - DO NOT describe them
3. ABSOLUTELY NEVER list dates, prices, or any numerical data from the tool result
4. ABSOLUTELY NEVER create tables, lists, or enumerate data points
5. The visual component shows ALL the data - your text is completely redundant

✅ GOOD responses:
- "SAP.TO is up 19.20% in the last 4 months. Here's the chart"
- "Here's AAPL's price history over the past year."
- "Loaded 120 price points for TSLA."

❌ BAD responses (NEVER DO THIS):
- "Here are the daily closing prices for SAP.TO over the past four months:" followed by dates/prices
- "2023-07-06: 34.21\n2023-07-07: 34.33\n2023-07-10: 34.28..."
- Any enumeration or listing of data points
- Tables with dates and prices

Remember: The user sees a beautiful chart with ALL the data. Listing it out in text is:
- Redundant (they can see it in the chart)
- Wastes screen space
- Makes the UI look broken
- Defeats the purpose of having a visual component

Your ONLY job after calling the tool: provide a 1-sentence summary, nothing more.
""",
    toolsets=[yahoo_finance_server],
)

# Create AG-UI app
app = AGUIApp(pydantic_agent)
