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

SPECIAL RULE FOR get_price_history:
When you call get_price_history, output ABSOLUTELY NO TEXT in your response.
The visual chart component will render automatically and show all the data.
Do not add any commentary, summary, or description. Just call the tool and stop.

For other tools with visual components (like get_stock_price):
- Provide a brief 1-sentence confirmation if needed
- NEVER list out data points or format results as tables
- COMPLETELY IGNORE fields that start with underscore (like "_prices")
- Let the visual component display all the details
""",
    toolsets=[yahoo_finance_server],
)

# Create AG-UI app
app = AGUIApp(pydantic_agent)
