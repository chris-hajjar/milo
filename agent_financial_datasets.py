#!/usr/bin/env python3
"""Pydantic AI agent with Financial Datasets MCP server integration."""

import asyncio
import os
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio

load_dotenv()


async def main():
    # Get API key from environment
    api_key = os.getenv('FINANCIAL_DATASETS_API_KEY')
    if not api_key:
        print("Error: FINANCIAL_DATASETS_API_KEY not found in .env file")
        print("Get your free API key at: https://www.financialdatasets.ai/")
        return

    # Create MCP server connection to Financial Datasets (stdio transport)
    # No Docker, no curl-cffi, works on any macOS version!
    financial_datasets_server = MCPServerStdio(
        'uvx',
        args=['--from', 'financial-datasets-mcp', 'financial-datasets-mcp'],
        env={'FINANCIAL_DATASETS_API_KEY': api_key},
        timeout=30
    )

    # Create agent with Financial Datasets toolset
    agent = Agent(
        'openai:gpt-4o-mini',
        system_prompt='You are a helpful financial assistant that can retrieve stock market data, financial statements, and company news.',
        toolsets=[financial_datasets_server]
    )

    print("Financial Datasets Agent ready. Type your message (type 'exit' to quit):\n")
    print("Examples:")
    print("  - What's the current stock price of AAPL?")
    print("  - Get me the latest income statement for TSLA")
    print("  - Show me the balance sheet for MSFT")
    print("  - Get recent news for NVDA\n")

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
