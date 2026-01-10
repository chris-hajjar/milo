#!/usr/bin/env python3
"""Pydantic AI agent with Yahoo Finance MCP integration."""

import asyncio
import os
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.mcp import mcptools
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

load_dotenv()


async def main():
    # Initialize Yahoo Finance MCP server
    server_params = StdioServerParameters(
        command='yahoo-finance-server',
        env=os.environ
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Automatically extract all Yahoo Finance tools
            tools = await mcptools(session)

            # Create agent with extracted tools
            agent = Agent(
                'openai:gpt-4o-mini',
                system_prompt='You are a helpful financial assistant with access to real-time stock market data from Yahoo Finance. Provide concise, informative responses.',
                tools=tools
            )

            print("Financial Agent ready with Yahoo Finance tools. Type your message (type 'exit' to quit):\n")

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
