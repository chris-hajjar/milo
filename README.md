# Simple Pydantic AI Agent

A minimal Pydantic AI agent powered by OpenAI, with Yahoo Finance MCP integration.

## Quick Start

```bash
pip install -r requirements.txt
```

Create a `.env` file:
```
OPENAI_API_KEY=your_key_here
FINANCIAL_DATASETS_API_KEY=your_key_here  # Get free key at https://www.financialdatasets.ai/
```

Run the basic agent:
```bash
python agent.py
```

Run the Yahoo Finance agent (simple local version):
```bash
python agent_yahoo_simple.py
```

## Financial Data Integration

### Financial Datasets MCP (Recommended - Works on All macOS Versions)

**No Docker required!** Uses minimal dependencies (httpx only).

```bash
# Get your free API key at https://www.financialdatasets.ai/
# Add it to .env as FINANCIAL_DATASETS_API_KEY

python agent_financial_datasets.py
```

**Available data:**
- Stock prices (current & historical)
- Financial statements (income, balance sheet, cash flow)
- Company news
- Crypto data

---

## Yahoo Finance Integration

### Simple Local Server (RECOMMENDED - Works on ANY macOS!)

**100% local, no Docker, no remote server, no curl-cffi build issues!**

```bash
python agent_yahoo_simple.py
```

This uses a lightweight Python server that fetches Yahoo Finance data directly via httpx. No external dependencies or compilation needed!

**Available tools:**
- Current stock prices
- Historical price data
- Stock news
- Stock search

---

### Option A: SSH Tunnel to Remote Linux

If you have access to **any Linux machine** (VPS, work server, friend's computer):

**Setup on Remote Linux:**
```bash
uv pip install --system yfmcp  # One-time install
```

**Use from Your Mac:**

Edit `agent_yahoo_finance.py` and change the server setup to:
```python
yahoo_finance_server = MCPServerStdio(
    'ssh',
    args=['-t', 'user@your-linux-server', 'yfmcp'],
    timeout=30
)
```

Then just run: `python agent_yahoo_finance.py`

The SSH command forwards the MCP stdio connection through SSH - no HTTP server needed!

**Free Linux Options:**
- GitHub Codespaces (60 hrs/month free)
- Google Cloud Shell (free)
- Oracle Cloud (always free tier)
- Any VPS/EC2 instance

### Option B: Docker or Linux

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
