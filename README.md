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

### Option 1: Docker (Recommended for macOS)

**Why Docker?** The `curl-cffi` dependency fails to build on macOS. Docker provides pre-built binaries.

```bash
# Pull image once (cached locally after first pull)
docker pull narumi/yfinance-mcp

# Run agent
python agent_yahoo_finance.py
```

Test connection: `python test_yahoo_mcp.py`

### Option 2: Local Installation (Linux only)

On Linux where `curl-cffi` builds properly:

```bash
# Install once
uv pip install --system yfmcp

# Run agent (uses locally installed command)
python agent_yahoo_finance_local.py
```

### Option 3: On-the-fly with uvx (Linux only)

```bash
# Modify agent to use:
yahoo_finance_server = MCPServerStdio('uvx', args=['yfmcp@latest'], timeout=30)
```

**Note:** Options 2 and 3 will fail on macOS with `curl-cffi` build errors.
