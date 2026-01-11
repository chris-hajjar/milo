import { NextRequest } from "next/server";
import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

// Create HttpAgent pointing to our Pydantic AI AG-UI backend
const yahooFinanceAgent = new HttpAgent({
  url: "http://127.0.0.1:8000/",
});

// Service adapter for single-agent setup
const serviceAdapter = new ExperimentalEmptyAdapter();

// Initialize CopilotKit runtime with the agent
const runtime = new CopilotRuntime({
  agents: {
    copilotkit_agent: yahooFinanceAgent,
  },
});

// Export POST handler for the API endpoint
export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
