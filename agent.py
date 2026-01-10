#!/usr/bin/env python3
"""Simple Pydantic AI agent with Yahoo Finance MCP support."""

import asyncio
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio


async def main():
    # Create Yahoo Finance MCP server connection
    yahoo_finance_server = MCPServerStdio(
        command='uvx',
        args=['yahoo-finance-server'],
    )

    # Create agent with Yahoo Finance tools
    agent = Agent(
        'anthropic:claude-sonnet-4-0',
        system_prompt='You are a helpful financial assistant. Use the Yahoo Finance tools to answer questions about stocks, market data, and financial information.',
        toolsets=[yahoo_finance_server],
    )

    print("Yahoo Finance Agent ready. Ask questions like 'What did Apple close at today?'\n")
    print("Type 'quit' to exit.\n")

    # Start the MCP server and run the agent
    async with agent.run_mcp_servers():
        while True:
            user_input = input("You: ").strip()

            if user_input.lower() in ['quit', 'exit', 'q']:
                break

            if not user_input:
                continue

            try:
                result = await agent.run(user_input)
                print(f"Agent: {result.data}\n")
            except Exception as e:
                print(f"Error: {e}\n")


if __name__ == "__main__":
    asyncio.run(main())
