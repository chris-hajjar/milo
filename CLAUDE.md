# Yahoo Finance MCP Integration

## Setup

```bash
pip install yahoo-finance-server mcp
```

## Simplest Integration

```python
from pydantic_ai import Agent
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Store MCP session
mcp_session = None

# Create wrapper functions
async def get_stock_info(symbol: str) -> str:
    """Get stock information."""
    result = await mcp_session.call_tool('get-ticker-info', {'symbol': symbol})
    return result.content[0].text

async def get_stock_news(symbol: str) -> str:
    """Get recent stock news."""
    result = await mcp_session.call_tool('get-ticker-news', {'symbol': symbol, 'count': 5})
    return result.content[0].text

# Create agent with tools
agent = Agent(
    'openai:gpt-4o-mini',
    tools=[get_stock_info, get_stock_news],
    system_prompt='You are a financial assistant.'
)

# Initialize and run
async def main():
    global mcp_session

    server_params = StdioServerParameters(command='yahoo-finance-server')
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            mcp_session = session

            result = await agent.run("What's Apple's latest news?")
            print(result.output)
```

## Available Yahoo Finance Tools

- `get-ticker-info` - Stock details, financials, metrics
- `get-ticker-news` - Recent news articles
- `search` - Find stocks/ETFs
- `get-top-entities` - Top performers by sector
- `get-price-history` - Historical prices
- `ticker-option-chain` - Options data
- `ticker-earning` - Earnings data

## Resources

- [Yahoo Finance MCP Server](https://github.com/AgentX-ai/AgentX-mcp-servers)
- [Pydantic AI Docs](https://ai.pydantic.dev/)
