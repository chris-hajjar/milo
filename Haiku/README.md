# Haiku Generator - AG UI Example

A code example demonstrating [AG UI (Agent Generative UI)](https://ai.pydantic.dev/ag-ui/) with Pydantic AI and CopilotKit.

## Overview

This project showcases how to build interactive generative UI experiences where an AI agent creates beautiful haiku poetry with:
- Japanese and English verses
- Dynamic gradient backgrounds
- Curated Japanese landscape imagery
- Smooth animations and carousel navigation

## Files

- **`page.tsx`** - React component with CopilotKit integration
- **`style.css`** - Custom styling and animations
- **`tool_based_generative_ui.py`** - Pydantic AI agent using GPT-4o-mini

## What is AG UI?

AG UI (Agent Generative UI) allows AI agents to generate and update user interface components dynamically, creating interactive experiences that go beyond simple chat responses. This example demonstrates the pattern with a haiku generator that renders visual poetry cards.

## How to Run

This is a code example that requires integration into a full application stack:

### Backend (Python Agent)

1. Install dependencies (if not already installed):
```bash
pip install pydantic-ai openai python-dotenv
```

2. Make sure your root `.env` file has your OpenAI API key:
```
OPENAI_API_KEY=your_key_here
```

3. Run the agent server from the Haiku directory:
```bash
cd Haiku
uvicorn tool_based_generative_ui:app --host 127.0.0.1 --port 8000
```

The agent will use the `.env` file from the root directory.

### Frontend (Next.js + React)

The `page.tsx` and `style.css` files need to be integrated into a Next.js application with:

- **CopilotKit** installed (`@copilotkit/react-core`, `@copilotkit/react-ui`)
- **shadcn/ui carousel components** (`@/components/ui/carousel`)
- **URL params context** (`@/contexts/url-params-context`)
- Proper Next.js routing (this would typically go in `app/[integrationId]/page.tsx`)

### As a Standalone Project

To run this as a complete standalone project, you would need to:
1. Create a Next.js app with the required dependencies
2. Set up the proper file structure and routing
3. Create the missing UI components and contexts
4. Configure CopilotKit to connect to the Python backend

This code serves as a reference for implementing AG UI patterns with Pydantic AI.
