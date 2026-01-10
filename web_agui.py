# to run: uvicorn web_agui:app --host 127.0.0.1 --port 7932
# Minimal AG-UI implementation with Plotly charts

from pathlib import Path
import os
import sys
import json
from datetime import datetime
from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext
from pydantic_ai.mcp import MCPServerStdio
import plotly.graph_objects as go
from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.responses import HTMLResponse, StreamingResponse
from starlette.staticfiles import StaticFiles
import asyncio

load_dotenv()

HERE = Path(__file__).resolve().parent

yahoo_finance_server = MCPServerStdio(
    sys.executable,
    args=[str(HERE / "server.py")],
    env=os.environ,
    cwd=str(HERE),
    timeout=30,
)

agent = Agent(
    "openai:gpt-4o-mini",
    system_prompt = """
You are a financial data assistant that answers questions by calling Yahoo Finance MCP tools.

You do NOT know stock prices yourself — you MUST use tools.

GENERAL RULES
- Never guess tickers
- Never hallucinate prices
- Always get real data from tools
- Never call more than one tool unless needed
- If a tool succeeds, stop calling tools

TICKER RESOLUTION
- If the user provides a ticker (AAPL, TSLA, NVDA) → call get_stock_price
- If the user provides a company name (Apple, Tesla, Nvidia) → call search_stocks
- After search_stocks:
  - Choose the result where quoteType == "EQUITY"
  - Then call get_stock_price using that symbol
  - Never try symbol variations like APLE or APPLE

NEWS
- If the user asks about news, headlines, or articles → call get_stock_news
- Use the ticker if provided
- Otherwise resolve via search_stocks first

PRICE HISTORY
- If the user asks about history, trends, charts, or time ranges → call get_price_history
- Resolve ticker via search_stocks first if needed

TECHNICAL INDICATORS
- If the user asks about RSI, MACD, Bollinger Bands, moving averages → call get_technical_indicators
- This tool automatically calculates common indicators

SEARCH
- If the user asks for tickers or to find a company → call search_stocks

ERROR HANDLING
- If a tool returns an error, do NOT retry with guessed symbols
- Ask the user for clarification

OUTPUT
- After using tools, summarize results in plain English
- Include ticker, price, and currency
- Never show raw JSON unless explicitly asked
""",
    toolsets=[yahoo_finance_server],
)

# Chart generation function (universal for time series)
def create_chart_json(data: dict) -> dict | None:
    """Create Plotly chart data from tool results."""
    if 'prices' in data and data['prices']:
        prices = data['prices']
        dates = [datetime.fromtimestamp(p['date']).strftime('%Y-%m-%d') for p in prices]
        closes = [p['close'] for p in prices if p['close'] is not None]

        return {
            "data": [{
                "x": dates,
                "y": closes,
                "type": "scatter",
                "mode": "lines",
                "name": data.get('symbol', 'Price'),
                "line": {"color": "#2563eb", "width": 2}
            }],
            "layout": {
                "title": f"{data.get('symbol', 'Stock')} Price History",
                "xaxis": {"title": "Date"},
                "yaxis": {"title": "Price (USD)"},
                "height": 400,
                "template": "plotly_white"
            }
        }
    return None

# Simple HTML frontend
FRONTEND = """
<!DOCTYPE html>
<html>
<head>
    <title>Yahoo Finance Agent</title>
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        h1 {
            color: #1e293b;
            margin-bottom: 24px;
            font-size: 28px;
        }
        #messages {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            min-height: 400px;
            max-height: 600px;
            overflow-y: auto;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .message {
            margin-bottom: 16px;
            padding: 12px 16px;
            border-radius: 8px;
            line-height: 1.5;
        }
        .user { background: #eff6ff; margin-left: 40px; }
        .assistant { background: #f8fafc; margin-right: 40px; }
        .chart { margin: 16px 0; }
        #input-container {
            display: flex;
            gap: 8px;
        }
        input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
        }
        button {
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
        }
        button:hover { background: #1d4ed8; }
        button:disabled { background: #94a3b8; cursor: not-allowed; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📈 Yahoo Finance Agent (with Charts)</h1>
        <div id="messages"></div>
        <div id="input-container">
            <input type="text" id="input" placeholder="Ask about stocks (try: show me Apple stock price history)" />
            <button onclick="send()">Send</button>
        </div>
    </div>

    <script>
        const messages = document.getElementById('messages');
        const input = document.getElementById('input');

        function addMessage(content, role) {
            const div = document.createElement('div');
            div.className = `message ${role}`;
            div.textContent = content;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }

        function addChart(chartData) {
            const div = document.createElement('div');
            div.className = 'chart';
            div.id = 'chart-' + Date.now();
            messages.appendChild(div);
            Plotly.newPlot(div, chartData.data, chartData.layout, {responsive: true});
            messages.scrollTop = messages.scrollHeight;
        }

        async function send() {
            const text = input.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            input.value = '';
            input.disabled = true;

            try {
                const res = await fetch('/chat', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({message: text})
                });

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, {stream: true});
                    const lines = buffer.split('\\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'text') {
                                addMessage(data.content, 'assistant');
                            } else if (data.type === 'chart') {
                                addChart(data.chart);
                            }
                        }
                    }
                }
            } catch (e) {
                addMessage('Error: ' + e.message, 'assistant');
            }

            input.disabled = false;
            input.focus();
        }

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') send();
        });
    </script>
</body>
</html>
"""

async def homepage(request):
    return HTMLResponse(FRONTEND)

async def chat_endpoint(request):
    body = await request.json()
    message = body.get('message', '')

    async def generate():
        result = await agent.run(message)

        # Send text response
        yield f"data: {json.dumps({'type': 'text', 'content': result.data})}\n\n"

        # Check if any tool results contain chart data
        for msg in result.all_messages():
            if msg.kind == 'tool-return' and msg.tool_name in ['get_price_history']:
                chart_data = create_chart_json(msg.content)
                if chart_data:
                    yield f"data: {json.dumps({'type': 'chart', 'chart': chart_data})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(generate(), media_type='text/event-stream')

app = Starlette(routes=[
    Route('/', homepage),
    Route('/chat', chat_endpoint, methods=['POST']),
])
