#!/usr/bin/env python3
"""Pydantic AI agent with locally installed Yahoo Finance MCP server."""

import asyncio
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio

load_dotenv()


async def main():
    # Use locally installed yfmcp command (installed via: uv pip install yfmcp)
    yahoo_finance_server = MCPServerStdio(
        'yfmcp',  # Use direct command instead of uvx
        args=[],
        timeout=30
    )

    # Create agent with Yahoo Finance toolset
    agent = Agent(
        'openai:gpt-4o-mini',
        system_prompt='You are a helpful financial assistant that can retrieve stock market data.',
        toolsets=[yahoo_finance_server]
    )

    print("Yahoo Finance Agent ready (using locally installed yfmcp).\n")
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
