# Milo - Stock Market AI Agent

A financial AI assistant built with Pydantic AI, Yahoo Finance MCP tools, and CopilotKit UI.

## Features

- **CopilotKit Chat UI** - Interactive sidebar chat interface
- **Yahoo Finance Data** - Real-time stock prices, news, historical data, and search
- **MCP Tools** - Modular tool system using Model Context Protocol
- **AG-UI Protocol** - Connects Pydantic AI backend to CopilotKit frontend
- **100% Local** - No external services, uses Yahoo Finance public API

## Quick Start

### 1. Install Dependencies

**Python:**
```bash
pip install -r requirements.txt
```

**Node.js:**
```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file:
```
OPENAI_API_KEY=your_key_here
```

### 3. Run the Application

**Terminal 1 - Python Backend:**
```bash
uvicorn copilotkit_agent:app --host 127.0.0.1 --port 8000
```

**Terminal 2 - Next.js Frontend:**
```bash
npm run dev
```

**Open:** http://localhost:3000

## Architecture

```
Browser (CopilotKit UI)
    ↓
Next.js API Route (HttpAgent)
    ↓
copilotkit_agent.py (Pydantic AI + AG-UI)
    ↓
server.py (FastMCP Tools)
    ↓
Yahoo Finance Public API
```

## Available Tools

The agent has access to these Yahoo Finance tools via MCP:

- `get_stock_price` - Current price and basic info
- `get_stock_news` - Recent news articles
- `get_price_history` - Historical OHLCV data
- `search_stocks` - Search by company name or ticker
- `get_technical_indicators` - RSI, SMA, MACD, Bollinger Bands

## Example Queries

- "What's the price of AAPL?"
- "Get me news about Tesla"
- "Show technical indicators for NVDA"
- "What was Microsoft's stock price last month?"

## Project Structure

```
.
├── copilotkit_agent.py     # Pydantic AI agent with AG-UI endpoint
├── server.py               # FastMCP server with Yahoo Finance tools
├── app/                    # Next.js app
│   ├── page.tsx           # Main page with CopilotSidebar
│   └── api/copilotkit/    # AG-UI HttpAgent proxy
├── components/             # React components
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
└── Haiku/                 # AG-UI example project
```

## Additional Examples

**CLI Agent:**
```bash
python agent.py
```

**Web UI (alternative):**
```bash
uvicorn web:app --host 127.0.0.1 --port 7932
```

## Tech Stack

- **Backend:** Pydantic AI, FastAPI, FastMCP, OpenAI
- **Frontend:** Next.js, React, CopilotKit, AG-UI Protocol
- **Data:** Yahoo Finance Public API (no API key required)

## Requirements

- Python 3.11+
- Node.js 18+
- OpenAI API key

## References

- [Pydantic AI](https://ai.pydantic.dev/)
- [CopilotKit](https://www.copilotkit.ai/)
- [AG-UI Protocol](https://www.copilotkit.ai/ag-ui)
- [Model Context Protocol](https://modelcontextprotocol.io/)
