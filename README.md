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

## Financial Data Options

### Option 1: Yahoo Finance (Recommended - No API Key Required)

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

---

### Option 2: Financial Datasets (Requires Free API Key)

More comprehensive data including financial statements.

```bash
# Get your free API key at https://www.financialdatasets.ai/
# Add to .env: FINANCIAL_DATASETS_API_KEY=your_key_here

python agent_financial_datasets.py
```

**Available:**
- Stock prices (current & historical)
- Financial statements (income, balance sheet, cash flow)
- Company news
- Crypto data
