# Yahoo Finance MCP Server Integration Guide

This guide explains how to integrate the Yahoo Finance MCP server with your Pydantic AI agent, allowing your agent to access real-time financial data, news, stock prices, and more.

## Overview

**Architecture:**
- **MCP Server**: Yahoo Finance MCP Server (runs as a separate process)
- **MCP Client**: Your Pydantic AI Agent (connects to the server to use its tools)

The agent will be able to use 7 financial data tools provided by the Yahoo Finance MCP server.

## Installation

### 1. Install Yahoo Finance MCP Server

```bash
# Option 1: Using uvx (recommended)
uvx yahoo-finance-server

# Option 2: Using pip
pip install yahoo-finance-server

# Option 3: From source
git clone https://github.com/AgentX-ai/AgentX-mcp-servers.git
cd AgentX-mcp-servers/yahoo_finance_server
pip install -e .
```

### 2. Install MCP Client Dependencies

Add to your `requirements.txt`:
```
pydantic-ai
openai
python-dotenv
mcp
```

Install:
```bash
pip install -r requirements.txt
```

## Configuration

### Proxy Setup (Optional but Recommended)

For better reliability and to avoid rate limiting:

```bash
# HTTP/HTTPS proxy
export PROXY_URL="http://proxy.example.com:8080"

# SOCKS proxy with auth
export PROXY_URL="socks5://user:pass@127.0.0.1:1080/"
```

### Claude Desktop Configuration

If using Claude Desktop app, add to your config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "yahoo-finance": {
      "command": "uvx",
      "args": ["yahoo-finance-server"],
      "env": {
        "PROXY_URL": "http://127.0.0.1:7890"
      }
    }
  }
}
```

## Pydantic AI Agent Integration

### Basic Setup

To connect your Pydantic AI agent to the Yahoo Finance MCP server, you'll use the MCP client SDK:

```python
#!/usr/bin/env python3
"""Pydantic AI agent with Yahoo Finance MCP integration."""

import asyncio
import os
from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from pydantic_ai import Agent

load_dotenv()


async def main():
    # Initialize the Yahoo Finance MCP server
    server_params = StdioServerParameters(
        command='yahoo-finance-server',
        env=os.environ
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # List available tools
            tools = await session.list_tools()
            print(f"Available tools: {[t.name for t in tools.tools]}")

            # Create Pydantic AI agent
            agent = Agent(
                'openai:gpt-4o-mini',
                system_prompt='You are a financial assistant with access to Yahoo Finance data.'
            )

            print("Financial Agent ready. Type your message (type 'exit' to quit):\n")

            while True:
                user_input = input("You: ").strip()

                if user_input.lower() == 'exit':
                    break

                if not user_input:
                    continue

                # For now, we'll use the agent directly
                # Full integration requires passing MCP tools to the agent
                result = await agent.run(user_input)
                print(f"Agent: {result.output}\n")


if __name__ == "__main__":
    asyncio.run(main())
```

## Available Tools

The Yahoo Finance MCP server provides these tools:

### 1. **get-ticker-info**
Get comprehensive stock information.

```python
result = await session.call_tool('get-ticker-info', {'symbol': 'AAPL'})
```

**Returns**: Company details, financials, trading metrics, market cap, P/E ratio, etc.

### 2. **get-ticker-news**
Get recent news articles for a stock.

```python
result = await session.call_tool('get-ticker-news', {
    'symbol': 'AAPL',
    'count': 10
})
```

### 3. **search**
Search for stocks, ETFs, and financial instruments.

```python
result = await session.call_tool('search', {
    'query': 'Apple Inc',
    'count': 10
})
```

### 4. **get-top-entities**
Get top performing entities by sector.

```python
result = await session.call_tool('get-top-entities', {
    'entity_type': 'companies',  # or 'etfs', 'mutual_funds', 'growth_companies', 'performing_companies'
    'sector': 'technology',
    'count': 10
})
```

**Supported Sectors:**
- basic-materials
- communication-services
- consumer-cyclical
- consumer-defensive
- energy
- financial-services
- healthcare
- industrials
- real-estate
- technology
- utilities

### 5. **get-price-history**
Get historical price data.

```python
result = await session.call_tool('get-price-history', {
    'symbol': 'AAPL',
    'period': '1y',    # 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    'interval': '1d'   # 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
})
```

### 6. **ticker-option-chain**
Get option chain data.

```python
result = await session.call_tool('ticker-option-chain', {
    'symbol': 'AAPL',
    'option_type': 'call',  # 'call', 'put', or 'both'
    'date': '2024-01-19'    # Optional: YYYY-MM-DD
})
```

### 7. **ticker-earning**
Get earnings data.

```python
result = await session.call_tool('ticker-earning', {
    'symbol': 'AAPL',
    'period': 'annual',     # 'annual' or 'quarterly'
    'date': '2023-12-31'    # Optional: YYYY-MM-DD
})
```

## Usage Examples

### Example 1: Get Stock Information

```python
async def get_stock_info(session, symbol):
    result = await session.call_tool('get-ticker-info', {'symbol': symbol})
    print(result.content[0].text)
```

### Example 2: Get Latest News

```python
async def get_latest_news(session, symbol):
    result = await session.call_tool('get-ticker-news', {
        'symbol': symbol,
        'count': 5
    })
    print(result.content[0].text)
```

### Example 3: Search for Stocks

```python
async def search_stocks(session, query):
    result = await session.call_tool('search', {
        'query': query,
        'count': 10
    })
    print(result.content[0].text)
```

## Advanced: Full Agent Integration

For full integration where the Pydantic AI agent can automatically use MCP tools, you'll need to:

1. **Pass MCP tools to the agent** as callable functions
2. **Map MCP tool calls** to the agent's tool system
3. **Handle tool responses** and feed them back to the agent

This requires creating wrapper functions that the agent can call:

```python
from pydantic_ai import Agent, RunContext

# Create MCP session (global or passed via deps)
mcp_session = None

async def yahoo_get_ticker_info(symbol: str) -> str:
    """Get comprehensive stock information."""
    result = await mcp_session.call_tool('get-ticker-info', {'symbol': symbol})
    return result.content[0].text

async def yahoo_get_news(symbol: str, count: int = 10) -> str:
    """Get recent news for a stock."""
    result = await mcp_session.call_tool('get-ticker-news', {
        'symbol': symbol,
        'count': count
    })
    return result.content[0].text

# Register tools with agent
agent = Agent(
    'openai:gpt-4o-mini',
    system_prompt='You are a financial assistant with access to Yahoo Finance data.',
    tools=[yahoo_get_ticker_info, yahoo_get_news]
)
```

## Testing

### Test the MCP Server

```bash
# Using MCP Inspector
npx @modelcontextprotocol/inspector yahoo-finance-server

# Manual test
python -c "
import asyncio
from yahoo_finance_server.helper import get_ticker_info

async def test():
    info = await get_ticker_info('AAPL')
    print(f'Stock: {info[\"longName\"]}')

asyncio.run(test())
"
```

### Test Your Integration

```python
async def test_integration():
    server_params = StdioServerParameters(
        command='yahoo-finance-server',
        env=os.environ
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Test a simple call
            result = await session.call_tool('get-ticker-info', {'symbol': 'AAPL'})
            print(result.content[0].text)

asyncio.run(test_integration())
```

## Troubleshooting

### Rate Limiting
If you encounter rate limiting errors:
1. Set up a proxy using `PROXY_URL` environment variable
2. Add delays between requests
3. Use caching for frequently requested data

### Connection Issues
- Ensure the yahoo-finance-server is installed correctly
- Check that the server starts without errors: `yahoo-finance-server`
- Verify environment variables are set correctly

### Tool Call Errors
- Validate parameters match the expected format
- Check symbol formatting (should be uppercase, e.g., 'AAPL')
- Ensure dates are in YYYY-MM-DD format

## Next Steps

1. Create a full example agent that integrates all Yahoo Finance tools
2. Add caching for frequently requested data
3. Implement error handling and retries
4. Add streaming responses for better UX
5. Create specialized financial analysis prompts

## Resources

- [Yahoo Finance MCP Server GitHub](https://github.com/AgentX-ai/AgentX-mcp-servers)
- [Pydantic AI Documentation](https://ai.pydantic.dev/)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
