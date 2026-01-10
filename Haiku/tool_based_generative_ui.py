"""Tool Based Generative UI feature.

No special handling is required for this feature.
"""

from __future__ import annotations

from pathlib import Path
from dotenv import load_dotenv
from pydantic_ai import Agent

# Load .env from root directory
load_dotenv(Path(__file__).parent.parent / '.env')

agent = Agent('openai:gpt-4o-mini')
app = agent.to_ag_ui()
