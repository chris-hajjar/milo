#!/usr/bin/env python3
"""
Pydantic AI agent connecting to remote Yahoo Finance MCP server over HTTP.
Requires: Yahoo Finance MCP server running on a remote Linux machine.
"""

import asyncio
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStreamableHTTP

load_dotenv()


async def main():
    # Connect to remote Yahoo Finance MCP server via HTTP
    # Replace with your remote server URL
    yahoo_finance_server = MCPServerStreamableHTTP(
        'http://your-remote-server:8000/mcp'  # Update this URL
    )

    # Create agent with Yahoo Finance toolset
    agent = Agent(
        'openai:gpt-4o-mini',
        system_prompt='You are a helpful financial assistant that can retrieve stock market data.',
        toolsets=[yahoo_finance_server]
    )

    print("Yahoo Finance Agent ready (remote connection). Type your message (type 'exit' to quit):\n")
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
