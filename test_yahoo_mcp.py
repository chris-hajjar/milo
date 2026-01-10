#!/usr/bin/env python3
"""Test script to verify Yahoo Finance MCP server connection."""

import asyncio
from pydantic_ai.mcp import MCPServerStdio


async def test_yahoo_finance_mcp():
    """Test connecting to Yahoo Finance MCP server and listing tools."""
    print("Testing Yahoo Finance MCP server connection...\n")

    # Create MCP server connection
    # Using Docker to avoid curl-cffi build issues on macOS
    yahoo_finance_server = MCPServerStdio(
        'docker',
        args=['run', '-i', '--rm', 'narumi/yfinance-mcp'],
        timeout=30
    )

    try:
        # Start the server and list available tools
        async with yahoo_finance_server as server:
            print(f"✓ Successfully connected to Yahoo Finance MCP server")
            print(f"✓ Server name: {server.info.name if hasattr(server, 'info') else 'Yahoo Finance'}")
            print(f"\nAvailable tools: {len(server.tools)}")

            for i, tool in enumerate(server.tools, 1):
                print(f"\n{i}. {tool.name}")
                print(f"   Description: {tool.description}")

            print("\n✓ Yahoo Finance MCP server is ready to use!")
            return True

    except Exception as e:
        print(f"✗ Error connecting to Yahoo Finance MCP server: {e}")
        return False


if __name__ == "__main__":
    success = asyncio.run(test_yahoo_finance_mcp())
    exit(0 if success else 1)
