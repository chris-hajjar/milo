#!/usr/bin/env python3
"""Pydantic AI agent with Yahoo Finance MCP server integration."""

import asyncio
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio

load_dotenv()


async def main():
    # Create MCP server connection to Yahoo Finance (stdio transport)
    yahoo_finance_server = MCPServerStdio(
        'uvx',
        args=['yahoo-finance-server'],
        timeout=30
    )

    # Create agent with Yahoo Finance toolset
    agent = Agent(
        'openai:gpt-4o-mini',
        system_prompt='You are a helpful financial assistant that can retrieve stock market data.',
        toolsets=[yahoo_finance_server]
    )

    print("Yahoo Finance Agent ready. Type your message (type 'exit' to quit):\n")
    print("Examples:")
    print("  - What's the current stock price of AAPL?")
    print("  - Get me the latest news for TSLA")
    print("  - Show me price history for NVDA over the past month\n")

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
