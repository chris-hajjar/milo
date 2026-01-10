import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const response = await fetch("http://127.0.0.1:8000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });

  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const backendUrl = `http://127.0.0.1:8000${url.pathname.replace('/api/copilotkit', '')}${url.search}`;

  const response = await fetch(backendUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
