# Milo - Stock Market AI Agent

A financial AI assistant built with Pydantic AI, native Yahoo Finance tools, and CopilotKit UI.

## Features

- **Full-Screen Chat Interface** - Clean chat UI powered by CopilotKit
- **Visual-Only Tool Responses** - Price charts and stock cards render without agent text output
- **Generative UI Components** - Material UI cards and charts that render inline with real-time data
- **Yahoo Finance Data** - Real-time stock prices, news, historical data, and search
- **Native Pydantic AI Tools** - Direct tool integration without MCP protocol overhead
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

Create a `.env` file in the project root:
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

## How to Run the Agents

This project supports **three different ways** to run the stock market AI agent:

### 1. CopilotKit Web UI (Primary - Recommended)

**Full-featured web interface with visual components**

```bash
# Terminal 1: Start backend agent with AG-UI endpoint
uvicorn copilotkit_agent:app --host 127.0.0.1 --port 8000

# Terminal 2: Start Next.js frontend
npm run dev

# Open http://localhost:3000
```

**Features:**
- Full-screen chat interface
- Visual stock cards and price charts (Material UI)
- Visual-only tool responses (no duplicate text)
- `useRenderToolCall` for backend tool rendering
- Real-time streaming responses

**Use this when:** You want the full visual experience with charts and cards

---

### 2. CLI Agent (MCP Tools)

**Simple command-line interface using MCP protocol**

```bash
python agent.py
```

**Features:**
- Text-based interface in terminal
- Uses FastMCP server (`server.py`) for tools
- Tool results displayed as formatted text
- Good for quick queries without browser

**Use this when:** You want quick terminal access or testing tools

---

### 3. Web UI (Alternative - MCP Based)

**Minimal web interface using MCP tools**

```bash
# Terminal 1: Start web UI server
uvicorn web:app --host 127.0.0.1 --port 7932

# Open http://localhost:7932
```

**Features:**
- Simple web-based chat
- Uses MCP tools from `server.py`
- Text-based responses (no visual components)
- Lighter weight than full CopilotKit setup

**Use this when:** You want a web UI without the full CopilotKit stack

---

## Architecture

### Primary Architecture (CopilotKit Web UI)

```
Browser (CopilotKit UI)
    ↓
Next.js API Route (HttpAgent)
    ↓
copilotkit_agent.py (Pydantic AI + AG-UI)
    ↓ (Native @tool_plain decorators)
Yahoo Finance Public API
```

**Key Files:**
- `copilotkit_agent.py` - Pydantic AI agent with native tools and AG-UI endpoint
- `app/page.tsx` - Next.js page with CopilotKit chat
- `app/api/copilotkit/route.ts` - AG-UI proxy to backend agent
- `components/StockCard.tsx` - Visual stock card component
- `components/PriceChart.tsx` - Visual price chart component

### CLI/Web UI Architecture (Alternative)

```
Terminal/Browser
    ↓
agent.py or web.py (Pydantic AI)
    ↓ (MCPServerStdio)
server.py (FastMCP Tools)
    ↓
Yahoo Finance Public API
```

**Key Files:**
- `agent.py` - CLI agent using MCP tools
- `web.py` - Web UI using MCP tools
- `server.py` - FastMCP server with Yahoo Finance tools

---

## Visual-Only Tool Pattern

The CopilotKit web UI implements a **visual-only** pattern for stock data tools:

### How It Works

1. **User Query:** "what is the 1 month chart for apple"
2. **Agent Action:** Calls `get_price_history(symbol="AAPL", period="1mo")`
3. **Tool Response:** Returns array of price candles (raw data only)
4. **Frontend Rendering:** `useRenderToolCall` renders interactive chart
5. **Agent Text Output:** **NONE** - visual component shows everything

### Visual Tools

- `get_stock_price` → StockCard component (Material UI card)
- `get_price_history` → PriceChart component (MUI LineChart)

### Implementation Details

**Backend (copilotkit_agent.py):**
- Tools use `@pydantic_agent.tool_plain` decorator
- `get_price_history` returns simple list of candles
- System prompt explicitly forbids text after visual tools
- Uses GPT-4o for better instruction following

**Frontend (components/):**
- `useRenderToolCall` hook for rendering backend tool results
- Components display loading states, then render visual data
- No `followUp` or `handler` needed for backend tools

---

## Available Tools

The agent has access to these tools:

### Stock Data Tools

**Visual Tools (No Text Output)**
- `get_stock_price` - Current price and basic info → **StockCard**
- `get_price_history` - Historical OHLCV data → **PriceChart**
- `get_technical_indicators` - RSI, SMA, MACD, Bollinger Bands → **BollingerBandsChart**

**Text Tools (Normal Output)**
- `get_stock_news` - Recent news articles
- `search_stocks` - Search by company name or ticker

### Portfolio Risk Tools

- `analyze_portfolio_risk` - Comprehensive portfolio analysis with volatility, VaR, concentration metrics, and risk alerts
- `compare_portfolio_scenarios` - Side-by-side comparison of two portfolio scenarios for what-if analysis
- `calculate_optimal_position_size` - Calculate how many shares to buy without exceeding concentration limits

### Transaction Query Tools

- `query_transactions` - Natural language transaction filtering with support for:
  - Timeframe: "last 30 days", "this year", "Q1 2026", etc.
  - Account type: "TFSA", "RRSP", "Non-registered"
  - Transaction type: "dividend", "deposit", "withdrawal", "purchase", "sale", "fee", "interest"
  - Ticker: "AAPL", "GOOGL", etc.
  - Returns summary statistics, time series aggregation, and filtered transaction list

---

## Example Queries

**Visual Tools:**
- "What's the price of AAPL?" (shows StockCard)
- "Show me the 6 month chart for Tesla" (shows PriceChart)
- "Apple stock price" (shows StockCard)

**Text Tools:**
- "Get me news about Tesla" (shows text list)
- "Search for Nvidia" (shows text results)
- "Show technical indicators for NVDA" (shows RSI, SMA, MACD, Bollinger)

---

## Available Routes

The application has multiple routes with different functionality:

### `/` - Chat Interface
Full-screen chat with inline visual components for stock analysis
- "What's the price of AAPL?"
- "Show me the 6 month chart for Tesla"
- "Get me news about NVDA"

### `/dashboard` - Stock Dashboard
Persistent dashboard with sidebar chat showing stock cards, price charts, and Bollinger Bands
- "Show me Apple stock"
- "Get the 1 year chart for Microsoft"
- "Show Bollinger Bands for TSLA"

### `/risk` - Portfolio Risk Monitor
Portfolio risk analysis dashboard with comprehensive risk metrics and alerts
- "Analyze 100 AAPL, 50 MSFT, 25 GOOGL"
- "Compare 100 AAPL and 50 MSFT with 100 AAPL, 50 MSFT, and 50 TSLA"
- "How much NVDA can I buy for my portfolio of 100 AAPL and 50 MSFT with 20% limit?"

### `/transactions` - Transaction Activity
Natural language transaction query dashboard with filtering and visualization
- "Show me all dividends in the last 90 days"
- "RRSP deposits this year"
- "TFSA purchases in the last 30 days"
- "All AAPL transactions"
- "Fees in Q1 2026"

---

## Project Structure

```
.
├── copilotkit_agent.py     # PRIMARY: Pydantic AI agent with native tools + AG-UI
├── agent.py                # ALTERNATIVE: CLI agent using MCP tools
├── web.py                  # ALTERNATIVE: Web UI using MCP tools
├── server.py               # MCP server (used by agent.py and web.py only)
├── app/                    # Next.js app (CopilotKit web UI)
│   ├── page.tsx           # Full-screen CopilotChat interface
│   ├── dashboard/         # Stock dashboard route
│   │   └── page.tsx
│   ├── risk/              # Portfolio risk monitor route
│   │   └── page.tsx
│   ├── transactions/      # Transaction query route
│   │   └── page.tsx
│   └── api/copilotkit/    # AG-UI HttpAgent proxy
│       └── route.ts
├── components/             # React visual components
│   ├── Navigation.tsx     # Navigation tab bar for all routes
│   ├── StockCard.tsx      # Visual stock card (Material UI)
│   ├── PriceChart.tsx     # Visual price chart (MUI LineChart)
│   ├── dashboard/         # Dashboard persistent components
│   │   ├── DashboardStockCard.tsx
│   │   ├── DashboardPriceChart.tsx
│   │   └── DashboardBollingerBandsChart.tsx
│   ├── risk/              # Risk analysis components
│   │   ├── DashboardPortfolioSummary.tsx
│   │   ├── DashboardRiskAlerts.tsx
│   │   ├── DashboardPositionTable.tsx
│   │   ├── DashboardScenarioComparison.tsx
│   │   └── DashboardPositionSizer.tsx
│   └── transactions/      # Transaction query components
│       ├── DashboardTransactionSummary.tsx
│       ├── DashboardTransactionTable.tsx
│       ├── DashboardTransactionChart.tsx
│       └── DashboardTransactionBreakdown.tsx
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
└── Haiku/                 # AG-UI reference example
```

---

## Tech Stack

- **Backend:** Pydantic AI, FastAPI, httpx, NumPy, OpenAI (GPT-4o)
- **Frontend:** Next.js 15, React 19, CopilotKit, AG-UI Protocol
- **UI Components:** Material UI (@mui/material, @mui/x-charts)
- **Data:** Yahoo Finance Public API (no API key required)
- **Alternative:** FastMCP for CLI/web agents

---

## Requirements

- Python 3.11+
- Node.js 18+
- OpenAI API key

---

## References

- [Pydantic AI](https://ai.pydantic.dev/)
- [CopilotKit](https://www.copilotkit.ai/)
- [AG-UI Protocol](https://www.copilotkit.ai/ag-ui)
- [Material UI](https://mui.com/)
