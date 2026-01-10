# Pydantic AI Agent with Yahoo Finance MCP

A Pydantic AI agent integrated with a lightweight Yahoo Finance MCP (Model Context Protocol) server for real-time stock market data.

## Features

- ✅ **100% Local** - Runs entirely on your machine, no external services
- ✅ **Works on Any macOS** - No Docker or build tools required
- ✅ **No API Keys** - Uses Yahoo Finance's public API
- ✅ **MCP Integration** - Follows Pydantic AI's official MCP pattern
- ✅ **Real-time Data** - Stock prices, news, historical data, and search

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Environment

Create a `.env` file:
```
OPENAI_API_KEY=your_key_here
```

### 3. Run the Agent

**Command Line Interface:**
```bash
python agent.py
```

**Web Interface:**
```bash
uvicorn web:app --host 127.0.0.1 --port 7932
```

Then open your browser to `http://127.0.0.1:7932` to interact with the agent through a web UI.

## How It Works

### Architecture

```
User Query → agent.py → Pydantic AI Agent
                                           ↓
                                    MCPServerStdio
                                           ↓
                            server.py
                                           ↓
                                Yahoo Finance Public API
```

### MCP Integration

The project uses Pydantic AI's `MCPServerStdio` to connect to a local MCP server via stdio transport (stdin/stdout):

```python
yahoo_finance_server = MCPServerStdio(
    'python3',
    args=['server.py'],
    timeout=30
)

agent = Agent(
    'openai:gpt-4o-mini',
    toolsets=[yahoo_finance_server]  # Register MCP server as toolset
)
```

This follows Pydantic AI's recommended pattern for local MCP servers.

### Yahoo Finance MCP Server

The `server.py` uses `fastmcp` to create an MCP server with 4 tools:

1. **get_stock_price** - Current price and basic info
2. **get_stock_news** - Recent news articles
3. **get_price_history** - Historical price data (1d to max range)
4. **search_stocks** - Search by company name or ticker

It fetches data directly from Yahoo Finance's public JSON API using `httpx` - no `yfinance` library or `curl-cffi` dependencies.

## Example Usage

```bash
$ python agent.py

You: What's the current stock price of AAPL?
Agent: Apple Inc. (AAPL) is currently trading at $185.92...

You: Get me the latest news for TSLA
Agent: Here are the recent news articles for Tesla...

You: Show me NVDA price history for the past month
Agent: Here's the price history for NVIDIA over the past month...

You: exit
```

## Why This Approach?

**Problem:** Official Yahoo Finance MCP servers use `yfinance` → `curl-cffi` → native C compilation, which fails on older macOS versions.

**Solution:** We built a lightweight MCP server that:
- Calls Yahoo Finance's public API directly with `httpx`
- No compilation or build tools needed
- Works on any macOS version
- Follows Pydantic AI's official MCP pattern

## Project Structure

```
.
├── agent.py             # Yahoo Finance agent CLI (connects to MCP)
├── web.py               # Yahoo Finance agent web interface
├── server.py            # Local MCP server (provides tools)
├── requirements.txt     # Python dependencies
├── .env                 # API keys (create this)
└── README.md            # This file
```

## Requirements

- Python 3.11+
- OpenAI API key
- Dependencies: `pydantic-ai`, `openai`, `python-dotenv`, `mcp`, `httpx`, `fastmcp`

## References

- [Pydantic AI](https://ai.pydantic.dev/)
- [Pydantic AI MCP Client](https://ai.pydantic.dev/mcp/client/)
- [Pydantic AI Toolsets](https://ai.pydantic.dev/toolsets/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Yahoo Finance](https://finance.yahoo.com/)
