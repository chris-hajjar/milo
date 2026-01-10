# Simple Pydantic AI Agent

A minimal Pydantic AI agent powered by OpenAI, with Yahoo Finance MCP integration.

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

Run the Yahoo Finance agent:
```bash
python agent_yahoo_finance.py
```

## Yahoo Finance Integration

The Yahoo Finance agent uses MCP (Model Context Protocol) via stdio for lightweight server connection. It provides tools for: ticker info, news, search, top entities, and price history.

**Requirements:** Docker (to avoid curl-cffi build issues on macOS)

Test the MCP connection:
```bash
python test_yahoo_mcp.py
```

**Alternative without Docker:** If you have a Linux system or want to try building dependencies locally, you can modify `agent_yahoo_finance.py` to use:
```python
yahoo_finance_server = MCPServerStdio('uvx', args=['yfmcp@latest'], timeout=30)
```
