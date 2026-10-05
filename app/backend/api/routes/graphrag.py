"""The optional GraphRAG step: build a graph from text with an LLM, then ask it questions."""

import json
import time
import uuid

from fastapi import APIRouter

from app.backend.api.errors import run_async, seconds_since
from app.backend.api.schemas import AskRequest, IngestRequest
from app.backend.core.config import GRAPHRAG_GRAPH, SAMPLES_DIR
from app.backend.services import graphrag

router = APIRouter(prefix="/api/graphrag")

_SAMPLE_DIR = SAMPLES_DIR / "graphrag"


@router.get("/sample")
async def sample() -> dict:
    """The sample text (a fictional incident report) and questions to ask about it."""
    about = json.loads((_SAMPLE_DIR / "about.json").read_text(encoding="utf-8"))
    text = (_SAMPLE_DIR / "incident_report.md").read_text(encoding="utf-8").strip()
    return {**about, "text": text, "graph": GRAPHRAG_GRAPH}


@router.post("/ingest")
async def ingest(body: IngestRequest) -> dict:
    started = time.perf_counter()
    document_id = f"doc-{uuid.uuid4().hex[:8]}"
    result = await run_async(graphrag.ingest(body.text, document_id))
    return {
        "call": "rag.ingest(text=...) + rag.finalize()",
        "seconds": seconds_since(started),
        **result,
    }


@router.post("/ask")
async def ask(body: AskRequest) -> dict:
    started = time.perf_counter()
    result = await run_async(graphrag.ask(body.question))
    return {"call": "rag.completion(question)", "seconds": seconds_since(started), **result}
