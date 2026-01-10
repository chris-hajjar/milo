/**
 * CopilotKit Runtime Server
 *
 * This server connects to the Python MCP server and exposes it to CopilotKit.
 * Run with: node copilot-runtime.js
 *
 * Loads environment variables from .env in the root directory.
 */

import { CopilotRuntime, OpenAIAdapter } from '@copilotkit/runtime';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env from root directory (single source of truth)
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize MCP client connection to Python server
let mcpClient = null;
let mcpTools = [];

async function initializeMCP() {
  console.log('Connecting to Python MCP server...');

  const transport = new StdioClientTransport({
    command: 'python3',
    args: ['server.py'],
  });

  mcpClient = new Client(
    {
      name: 'copilotkit-runtime',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await mcpClient.connect(transport);
  console.log('✅ Connected to MCP server');

  // Get list of tools
  const toolsList = await mcpClient.listTools();
  mcpTools = toolsList.tools;
  console.log(`📦 Loaded ${mcpTools.length} tools:`, mcpTools.map(t => t.name).join(', '));
}

// Convert MCP tool to CopilotKit action
function mcpToolToCopilotAction(tool) {
  return {
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
    handler: async (args) => {
      try {
        console.log(`🔧 Calling MCP tool: ${tool.name}`, args);
        const result = await mcpClient.callTool({
          name: tool.name,
          arguments: args,
        });
        console.log(`✅ Tool result:`, result.content);
        return JSON.stringify(result.content);
      } catch (error) {
        console.error(`❌ Error calling tool ${tool.name}:`, error);
        return `Error: ${error.message}`;
      }
    },
  };
}

// Initialize on startup
await initializeMCP();

// Create CopilotKit runtime with MCP tools
const runtime = new CopilotRuntime({
  actions: mcpTools.map(mcpToolToCopilotAction),
});

const serviceAdapter = new OpenAIAdapter({
  model: 'gpt-4o-mini',
});

// CopilotKit endpoint
app.post('/copilotkit', async (req, res) => {
  try {
    const { handleRequest } = runtime.streamHttpServerResponse({
      request: req.body,
      serviceAdapter,
    });

    const stream = await handleRequest();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    tools: mcpTools.map(t => t.name),
  });
});

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`🚀 CopilotKit Runtime running on http://localhost:${PORT}`);
  console.log(`📍 CopilotKit endpoint: http://localhost:${PORT}/copilotkit`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
