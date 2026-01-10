import { NextRequest } from "next/server";

// Proxy all requests to the CopilotKit runtime server
export async function POST(req: NextRequest) {
  const body = await req.text();

  const response = await fetch("http://localhost:8001/copilotkit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });

  // Forward the streaming response
  if (response.headers.get("content-type")?.includes("text/event-stream")) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
