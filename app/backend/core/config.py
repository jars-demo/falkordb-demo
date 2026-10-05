"""Settings: where FalkorDB is, and whether an LLM key is set for the optional GraphRAG step.

Values come from .env at the repo root (write it with `python scripts/setup.py`).
"""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[3]
ENV_FILE = REPO_ROOT / ".env"
load_dotenv(ENV_FILE)

# Sample datasets: every folder in data/ with a seed.cypher becomes a graph of the same name.
SAMPLES_DIR = REPO_ROOT / "data"
DEFAULT_SAMPLE = "social_network"

# The graph the optional GraphRAG step builds from text.
GRAPHRAG_GRAPH = "graphrag_demo"

FRONTEND_DIST = REPO_ROOT / "app" / "frontend" / "dist"

_PLACEHOLDER_KEYS = {"", "gsk_..."}


@dataclass(frozen=True)
class Settings:
    host: str
    port: int
    username: str | None
    password: str | None
    llm_api_key: str | None
    llm_model: str

    @property
    def llm_available(self) -> bool:
        return self.llm_api_key is not None

    @property
    def is_cloud(self) -> bool:
        return self.host not in {"localhost", "127.0.0.1", "falkordb"}

    def describe(self) -> dict:
        where = "FalkorDB Cloud" if self.is_cloud else "Local FalkorDB"
        return {"label": where, "detail": f"{self.host}:{self.port}"}


def get_settings() -> Settings:
    key = (os.getenv("LLM_API_KEY") or "").strip()
    return Settings(
        host=os.getenv("FALKORDB_HOST", "localhost"),
        port=int(os.getenv("FALKORDB_PORT", "6379")),
        username=os.getenv("FALKORDB_USERNAME") or None,
        password=os.getenv("FALKORDB_PASSWORD") or None,
        llm_api_key=None if key in _PLACEHOLDER_KEYS else key,
        llm_model=os.getenv("LLM_MODEL", "groq/openai/gpt-oss-120b"),
    )
