#!/usr/bin/env python3
"""Simple Pydantic AI agent with MCP support."""

import asyncio
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPClient


async def main():
    # Create MCP client (optional - add servers as needed)
    mcp = MCPClient()

    # Create basic agent with concise instructions
    agent = Agent(
        'anthropic:claude-3-5-haiku-20241022',
        system_prompt='Be concise, reply with one sentence.',
        mcp_client=mcp,
    )

    print("Agent ready. Type your message (or 'quit' to exit):\n")

    while True:
        user_input = input("You: ").strip()

        if user_input.lower() in ['quit', 'exit', 'q']:
            break

        if not user_input:
            continue

        result = await agent.run(user_input)
        print(f"Agent: {result.data}\n")


if __name__ == "__main__":
    asyncio.run(main())
