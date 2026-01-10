# Yahoo Finance AI Agent

A Pydantic AI agent integrated with the Yahoo Finance MCP server for real-time stock market data and financial information.

## Features

- Ask natural language questions about stocks (e.g., "What did Apple close at today?")
- Get real-time stock prices and market data
- Access company information, news, and financial metrics
- Query historical price data and earnings information

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variable

```bash
export ANTHROPIC_API_KEY=your_key_here
```

## Run

```bash
python agent.py
```

## Example Questions

- "What did Apple close at today?"
- "Get me the latest news about Tesla"
- "What's the current price of Microsoft?"
- "Show me Apple's recent stock performance"

## How It Works

The agent uses:
- **Pydantic AI**: Framework for building AI agents with type safety
- **Yahoo Finance MCP Server**: Provides financial data tools via Model Context Protocol
- **Claude**: Anthropic's language model for natural language understanding

The Yahoo Finance MCP server runs as a subprocess (via `uvx`) and automatically provides 7 financial tools to the agent:
1. `get-ticker-info` - Comprehensive stock information
2. `get-ticker-news` - Recent news articles
3. `search` - Find stocks and ETFs
4. `get-top-entities` - Top performers by sector
5. `get-price-history` - Historical pricing data
6. `ticker-option-chain` - Options data
7. `ticker-earning` - Earnings information
