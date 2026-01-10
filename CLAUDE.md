# Yahoo Finance MCP Integration

## Setup

```bash
pip install yahoo-finance-server mcp pydantic-ai
```

## Simplest Integration

```python
from pydantic_ai import Agent
from pydantic_ai.mcp import mcptools
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    # Connect to Yahoo Finance MCP server
    server_params = StdioServerParameters(command='yahoo-finance-server')

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Automatically extract all Yahoo Finance tools
            tools = await mcptools(session)

            # Create agent with tools
            agent = Agent(
                'openai:gpt-4o-mini',
                tools=tools,
                system_prompt='You are a financial assistant.'
            )

            result = await agent.run("What's Apple's latest news?")
            print(result.output)
```

## Available Yahoo Finance Tools

All 7 tools are automatically available:
- `get-ticker-info` - Stock details, financials, metrics
- `get-ticker-news` - Recent news articles
- `search` - Find stocks/ETFs
- `get-top-entities` - Top performers by sector
- `get-price-history` - Historical prices
- `ticker-option-chain` - Options data
- `ticker-earning` - Earnings data

The agent automatically detects when to use these tools based on user queries.

## Resources

- [Yahoo Finance MCP Server](https://github.com/AgentX-ai/AgentX-mcp-servers)
- [Pydantic AI MCP Docs](https://ai.pydantic.dev/mcp/client/)
