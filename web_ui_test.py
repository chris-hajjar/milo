# to run: uvicorn web_ui_test:app --host 127.0.0.1 --port 7932
# Ultra-simple chart implementation - adds Plotly charts to the basic web UI

from pathlib import Path
import os, sys, json
from datetime import datetime
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import HTMLResponse, StreamingResponse

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
    system_prompt="""You are a financial data assistant. You do NOT have knowledge of stock prices - you MUST use the provided tools.

CRITICAL: You cannot answer questions without calling tools. Never provide price data from memory.

When users ask about:
- Current price → MUST call get_stock_price
- Price history/charts/trends → MUST call get_price_history
- News → MUST call get_stock_news
- Technical indicators → MUST call get_technical_indicators
- Company search → MUST call search_stocks

If you don't call a tool, you are hallucinating. Always call the appropriate tool first.""",
    toolsets=[yahoo_finance_server],
)

# Debug: Check if tools are loaded
print(f"\n=== AGENT STARTUP DEBUG ===")
print(f"Agent model: {agent.model}")
print(f"Number of toolsets: {len(agent._function_tools) if hasattr(agent, '_function_tools') else 'unknown'}")
print(f"=========================\n")

# Universal chart creator (~10 lines)
def make_chart(data):
    if 'prices' not in data or not data['prices']:
        return None
    prices = data['prices']
    return {
        "x": [datetime.fromtimestamp(p['date']).strftime('%Y-%m-%d') for p in prices],
        "y": [p['close'] for p in prices if p['close']],
        "type": "scatter",
        "mode": "lines",
        "name": data.get('symbol', 'Price')
    }

# Minimal frontend
HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Yahoo Finance Agent</title>
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
    <style>
        body { font-family: system-ui; max-width: 900px; margin: 40px auto; padding: 20px; }
        #chat { background: #fff; padding: 20px; border-radius: 8px; min-height: 400px; margin-bottom: 16px; }
        .msg { padding: 10px; margin: 10px 0; border-radius: 6px; }
        .user { background: #e0f2fe; }
        .bot { background: #f1f5f9; }
        input { width: 80%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; }
        button { padding: 12px 24px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>📈 Yahoo Finance Agent</h1>
    <div id="chat"></div>
    <input id="input" placeholder="Ask about stocks..." />
    <button onclick="send()">Send</button>
    <script>
        async function send() {
            const msg = input.value.trim();
            if (!msg) return;
            chat.innerHTML += `<div class="msg user">${msg}</div>`;
            input.value = '';

            const res = await fetch('/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({msg})
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                const lines = decoder.decode(value).split('\\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const d = JSON.parse(line.slice(6));
                        if (d.type === 'text') {
                            chat.innerHTML += `<div class="msg bot">${d.text}</div>`;
                        } else if (d.type === 'chart') {
                            const div = document.createElement('div');
                            chat.appendChild(div);
                            Plotly.newPlot(div, [d.chart], {height: 300});
                        }
                    }
                }
            }
        }
        input.addEventListener('keypress', e => e.key === 'Enter' && send());
    </script>
</body>
</html>
"""

async def home(request):
    return HTMLResponse(HTML)

async def chat(request):
    data = await request.json()

    async def stream():
        # CRITICAL: Use context manager to initialize MCP connection
        async with agent:
            result = await agent.run(data['msg'])

            # Send text
            yield f"data: {json.dumps({'type': 'text', 'text': str(result.output)})}\n\n"

            # Debug: log all messages
            print(f"\nDEBUG: Total messages: {len(list(result.all_messages()))}")
            for i, m in enumerate(result.all_messages()):
                print(f"DEBUG: Message {i}: kind={m.kind}, has tool_name={hasattr(m, 'tool_name')}")
                if hasattr(m, 'tool_name'):
                    print(f"DEBUG:   tool_name={m.tool_name}")

            # Send chart if found
            for m in result.all_messages():
                if m.kind == 'tool-return' and m.tool_name == 'get_price_history':
                    print(f"DEBUG: Found price history tool return")
                    print(f"DEBUG: Content type: {type(m.content)}")
                    print(f"DEBUG: Content keys: {m.content.keys() if isinstance(m.content, dict) else 'not a dict'}")
                    chart = make_chart(m.content)
                    if chart:
                        print(f"DEBUG: Chart created successfully")
                        yield f"data: {json.dumps({'type': 'chart', 'chart': chart})}\n\n"
                    else:
                        print(f"DEBUG: Chart was None")

    return StreamingResponse(stream(), media_type='text/event-stream')

app = Starlette(routes=[Route('/', home), Route('/chat', chat, methods=['POST'])])
