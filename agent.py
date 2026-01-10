#!/usr/bin/env python3
"""Simple Pydantic AI agent with OpenAI."""

import asyncio
from dotenv import load_dotenv
from pydantic_ai import Agent

load_dotenv()


async def main():
    # Create basic agent with concise instructions
    agent = Agent(
        'openai:gpt-4o-mini',
        system_prompt='always add the color blue in a very concise answer.',
    )

    print("Agent ready. Type your message (type 'exit' to quit):\n")

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
