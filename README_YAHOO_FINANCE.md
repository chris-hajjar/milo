# Yahoo Finance MCP Integration

This project includes a Pydantic AI agent integrated with the Yahoo Finance MCP server for retrieving real-time stock market data.

## Setup

1. Install dependencies:
```bash
uv pip install --system -r requirements.txt
```

2. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_key_here
```

## Architecture

### Lightweight Remote MCP Connection

The integration uses Pydantic AI's `MCPServerStdio` class to connect to the Yahoo Finance MCP server via stdio transport:

```python
from pydantic_ai.mcp import MCPServerStdio

# Create lightweight MCP server connection
yahoo_finance_server = MCPServerStdio(
    'uvx',                           # Use uvx to run the server
    args=['yahoo-finance-server'],   # Server package name
    timeout=30                        # Connection timeout
)

# Attach to agent as a toolset
agent = Agent(
    'openai:gpt-4o-mini',
    toolsets=[yahoo_finance_server]
)
```

This is the **most lightweight approach** because:
- ✅ No HTTP server setup required
- ✅ Direct stdio communication
- ✅ Automatic server lifecycle management
- ✅ Uses `uvx` for on-demand server execution

### Yahoo Finance MCP Server

The Yahoo Finance MCP server provides 7 tools:

1. **get-ticker-info** - Get comprehensive stock information
2. **get-ticker-news** - Fetch recent news articles
3. **search** - Find stocks, ETFs, and financial instruments
4. **get-top-entities** - Get top performers by sector
5. **get-price-history** - Historical price data
6. **ticker-option-chain** - Options data
7. **ticker-earning** - Earnings information

## Usage

### Run the Yahoo Finance Agent

```bash
python agent_yahoo_finance.py
```

Example queries:
- "What's the current stock price of AAPL?"
- "Get me the latest news for TSLA"
- "Show me price history for NVDA over the past month"
- "What are the top performing technology companies?"

### Test MCP Server Connection

```bash
python test_yahoo_mcp.py
```

This will verify the MCP server connection and list all available tools.

## How It Works

1. **Agent Initialization**: The agent is created with the Yahoo Finance MCP server as a toolset
2. **Async Context Manager**: Using `async with agent` starts the MCP server subprocess
3. **User Query**: When you ask about stocks, the agent decides which tools to use
4. **Tool Execution**: The agent calls the appropriate Yahoo Finance tools
5. **Response**: The agent synthesizes the data into a natural language response

## Sources

- [Pydantic AI MCP Client Documentation](https://ai.pydantic.dev/mcp/client/)
- [Yahoo Finance MCP Server](https://github.com/AgentX-ai/yahoo-finance-server)
- [Pydantic AI MCP API](https://ai.pydantic.dev/api/mcp/)
- [MCP with Pydantic AI](https://datastud.dev/posts/pydantic-ai-mcp/)
