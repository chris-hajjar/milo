#!/usr/bin/env python3
import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio

load_dotenv()

HERE = Path(__file__).resolve().parent

async def main():
    yahoo_finance_server = MCPServerStdio(
        sys.executable,                         # ✅ absolute path to current python
        args=[str(HERE / 'yahoo_finance_simple_server.py')],
        env=os.environ,                         # ✅ inherit PATH + other env vars
        cwd=str(HERE),                          # ✅ run from project folder
        timeout=30,
    )

    agent = Agent(
        'openai:gpt-4o-mini',
        system_prompt = """
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
- After using tools, summarize results in plain English
- Include ticker, price, and currency
- Never show raw JSON unless explicitly asked
""",
        toolsets=[yahoo_finance_server],
    )

    print("Yahoo Finance Agent ready (simple local version). Type your message (type 'exit' to quit):\n")

    async with agent:
        while True:
            user_input = input("You: ").strip()
            if user_input.lower() == 'exit':
                break
            if not user_input:
                continue

            result = await agent.run(user_input)
            print(f"Agent: {result.output}\n")

if __name__ == "__main__":
    asyncio.run(main())
