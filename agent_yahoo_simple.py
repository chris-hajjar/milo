#!/usr/bin/env python3
"""
Pydantic AI agent with simple Yahoo Finance MCP server.
100% local, no Docker, no curl-cffi, works on any macOS version!
"""

import asyncio
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio

load_dotenv()


async def main():
    # Connect to our simple local Yahoo Finance MCP server
    yahoo_finance_server = MCPServerStdio(
        'python',
        args=['yahoo_finance_simple_server.py'],
        timeout=30
    )

    # Create agent with Yahoo Finance toolset
    agent = Agent(
        'openai:gpt-4o-mini',
        system_prompt='You are a helpful financial assistant that can retrieve stock market data from Yahoo Finance.',
        toolsets=[yahoo_finance_server]
    )

    print("Yahoo Finance Agent ready (simple local version). Type your message (type 'exit' to quit):\n")
    print("Examples:")
    print("  - What's the current stock price of AAPL?")
    print("  - Get me the latest news for TSLA")
    print("  - Show me price history for NVDA over the past month")
    print("  - Search for Microsoft stock\n")

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
