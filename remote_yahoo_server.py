#!/usr/bin/env python3
"""
Run this on a remote Linux server to host Yahoo Finance MCP over HTTP.
Install: pip install yfmcp fastmcp uvicorn
"""

import asyncio
from fastmcp import FastMCP
from pydantic_ai.mcp import MCPServerStdio

# Create FastMCP server that wraps Yahoo Finance MCP
mcp = FastMCP("Yahoo Finance Remote")


async def setup_yahoo_finance():
    """Initialize Yahoo Finance MCP server as a subprocess."""
    yahoo_server = MCPServerStdio('uvx', args=['yfmcp@latest'], timeout=30)
    async with yahoo_server as server:
        # Register all Yahoo Finance tools
        for tool in server.tools:
            # Proxy each tool from Yahoo Finance MCP
            @mcp.tool()
            async def proxy_tool(tool_name=tool.name, **kwargs):
                return await server.call_tool(tool_name, kwargs)

    return mcp


if __name__ == "__main__":
    # Run on port 8000, accessible from anywhere
    import uvicorn
    uvicorn.run(mcp, host="0.0.0.0", port=8000)
