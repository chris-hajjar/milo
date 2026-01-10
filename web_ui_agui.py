# to run: uvicorn web_ui_agui:app --host 127.0.0.1 --port 7932
# Proper AG-UI implementation following Pydantic AI standards

from pathlib import Path
import os, sys, json
from datetime import datetime
from dotenv import load_dotenv
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext, ToolReturn
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai.ui import StateDeps
from pydantic_ai.ui.ag_ui.app import AGUIApp
from ag_ui.core import CustomEvent, EventType

load_dotenv()
HERE = Path(__file__).resolve().parent

# State model for chart data
class ChartState(BaseModel):
    """State for storing chart data."""
    chart_data: dict | None = None

# MCP server for Yahoo Finance tools
yahoo_finance_server = MCPServerStdio(
    sys.executable,
    args=[str(HERE / "server.py")],
    env=os.environ,
    cwd=str(HERE),
    timeout=30,
)

# Agent with proper AG-UI integration
agent = Agent(
    "openai:gpt-4o-mini",
    system_prompt="""You are a financial data assistant. You do NOT have knowledge of stock prices - you MUST use the provided tools.

CRITICAL: You cannot answer questions without calling tools. Never provide price data from memory.

When users ask about:
- Current price → MUST call get_stock_price
- Price history/charts/trends → MUST call get_price_history, then call emit_chart with the data
- News → MUST call get_stock_news
- Technical indicators → MUST call get_technical_indicators
- Company search → MUST call search_stocks

After calling get_price_history, you MUST call emit_chart with the prices and symbol to show a chart.

If you don't call a tool, you are hallucinating. Always call the appropriate tool first.""",
    toolsets=[yahoo_finance_server],
    deps_type=StateDeps[ChartState],
)

# Tool to emit chart events using AG-UI protocol
@agent.tool
async def emit_chart(
    ctx: RunContext[StateDeps[ChartState]],
    prices: list[dict],
    symbol: str
) -> ToolReturn:
    """Emit a chart event for price history data."""
    # Create Plotly chart data
    chart_data = {
        "data": [{
            "x": [datetime.fromtimestamp(p['date']).strftime('%Y-%m-%d') for p in prices],
            "y": [p['close'] for p in prices if p.get('close')],
            "type": "scatter",
            "mode": "lines",
            "name": symbol,
            "line": {"color": "#2563eb", "width": 2}
        }],
        "layout": {
            "title": f"{symbol} Price History",
            "xaxis": {"title": "Date"},
            "yaxis": {"title": "Price (USD)"},
            "height": 400,
            "template": "plotly_white"
        }
    }

    # Update state
    ctx.deps.state.chart_data = chart_data

    # Return with AG-UI custom event
    return ToolReturn(
        return_value=f'Chart created for {symbol}',
        metadata=[
            CustomEvent(
                type=EventType.CUSTOM,
                name='chart',
                value=chart_data,
            ),
        ]
    )

# Create AG-UI app (handles SSE and routing automatically)
app = AGUIApp(
    agent,
    deps=StateDeps(ChartState()),
    title="Yahoo Finance Agent with Charts"
)

print(f"\n=== AG-UI App Started ===")
print(f"Agent model: {agent.model}")
print(f"Using AG-UI protocol for chart rendering")
print(f"========================\n")
