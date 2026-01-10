# Yahoo Finance AI Assistant - React Frontend

A modern React + Next.js frontend for the Yahoo Finance AI Agent, powered by CopilotKit.

## Features

- **CopilotKit Chat Interface**: Full-featured chat sidebar with suggestions and history
- **Generative UI**: Stock data cards that render dynamically as React components
- **Real-time Stock Data**: Connects to Yahoo Finance MCP backend
- **Beautiful UI**: Tailwind CSS with gradient backgrounds and smooth animations
- **Dark Mode Support**: Responsive design with light/dark themes

## Architecture

```
User Input → CopilotKit (React) → Pydantic AI Backend (port 8000) → MCP Server → Yahoo Finance API
```

## Prerequisites

- Node.js 18+ installed
- Python backend running on port 8000 (see root directory README)
- OpenAI API key configured in backend

## Quick Start

### 1. Start the Backend

From the root directory:

```bash
# Make sure your .env has OPENAI_API_KEY
uvicorn web:app --host 127.0.0.1 --port 8000
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Open Your Browser

Navigate to http://localhost:3000

The chat sidebar will open automatically. Try asking:
- "What's the price of Apple?"
- "Get me news about Tesla"
- "Show NVDA price history for 1 month"

## Installation

If this is your first time running the frontend:

```bash
cd frontend
npm install
```

## How It Works

### CopilotKit Integration

The app uses CopilotKit to connect the React frontend with the Pydantic AI backend:

```tsx
<CopilotKit
  runtimeUrl="http://127.0.0.1:8000"
  agent="yahoo_finance_agent"
>
  <CopilotSidebar defaultOpen={true} />
  <StockDisplay />
</CopilotKit>
```

### Generative UI POC

The app includes a **proof-of-concept generative UI** for stock data:

- Stock cards that render dynamically based on agent responses
- Shows ticker, company name, price, and percentage change
- Color-coded (green for gains, red for losses)
- Animated progress bars

**Current Status**: The `display_stock_card` action is registered in the frontend, but the backend agent doesn't automatically call it yet. This is a placeholder to demonstrate the pattern.

**To make it functional**: Update the agent's system prompt or tool logic to call `display_stock_card` when returning stock price data.

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx          # Main chat interface with CopilotKit
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── package.json          # Dependencies
├── next.config.js        # Next.js config
└── README.md            # This file
```

## Key Components

### YahooFinanceChat
Main component that wraps everything with CopilotKit provider and configures the chat sidebar.

### StockDisplay
Manages the generative UI for stock cards using `useCopilotAction`.

### StockCard
Visual component that displays stock data with animations and styling.

## Configuration

### Backend URL

If your backend runs on a different port, update `runtimeUrl` in `app/page.tsx`:

```tsx
<CopilotKit
  runtimeUrl="http://127.0.0.1:YOUR_PORT"
  ...
>
```

### Agent Name

The agent name must match your backend configuration. Currently: `"yahoo_finance_agent"`

## Comparison to Pydantic Web UI

| Feature | Pydantic `to_web()` | CopilotKit React |
|---------|---------------------|------------------|
| Chat Interface | ✅ Basic | ✅ Enhanced with suggestions |
| Custom Styling | ❌ Limited | ✅ Full Tailwind control |
| Generative UI | ❌ | ✅ Custom React components |
| Mobile Support | ⚠️ Basic | ✅ Responsive |
| Dark Mode | ❌ | ✅ Built-in |

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### "Failed to fetch" error
- Ensure backend is running on port 8000
- Verify `web.py` uses `agent.to_ag_ui()` not `agent.to_web()`
- Check `.env` has valid `OPENAI_API_KEY`

### Generative UI not showing
- The `display_stock_card` action is a POC and not automatically called yet
- To test it, modify the agent to call it when returning stock data

### Port conflicts
- Frontend default: http://localhost:3000
- Backend default: http://127.0.0.1:8000
- Update both locations if you change ports

## Next Steps

Ideas to extend the generative UI:

1. **Auto-call display_stock_card**: Update agent system prompt to call it automatically
2. **News Cards**: Create a similar UI for `get_stock_news` results
3. **Price Charts**: Add recharts/chart.js for `get_price_history` visualization
4. **Watchlist**: Save favorite stocks to localStorage
5. **Real-time Updates**: WebSocket integration for live prices
6. **Technical Indicators**: Visualize RSI, MACD, Bollinger Bands from backend

## Learn More

- [CopilotKit Docs](https://docs.copilotkit.ai/)
- [Next.js Docs](https://nextjs.org/docs)
- [Pydantic AI AG UI](https://ai.pydantic.dev/ag-ui/)
- [Tailwind CSS](https://tailwindcss.com/docs)
