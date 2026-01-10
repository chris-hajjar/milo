# Simple Pydantic AI Agent

Minimal Pydantic AI agent powered by OpenAI with financial data MCP integrations.

## Quick Start

```bash
pip install -r requirements.txt
```

Create a `.env` file:
```
OPENAI_API_KEY=your_key_here
```

Run the basic agent:
```bash
python agent.py
```

## Yahoo Finance Agent

**100% local, works on any macOS version!**

```bash
python agent_yahoo_simple.py
```

Uses a lightweight local MCP server that fetches data directly from Yahoo Finance's public API.

**Available:**
- Current stock prices
- Historical price data
- Stock news
- Stock search

**No API key, no Docker, no external dependencies.**
