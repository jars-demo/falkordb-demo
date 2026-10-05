"""Health, status and the sample datasets."""

from importlib.metadata import version

from fastapi import APIRouter, HTTPException

from app.backend.api.errors import run_sync
from app.backend.core import config
from app.backend.services import graph, samples

router = APIRouter()


@router.get("/health", include_in_schema=False)
async def health() -> dict:
    return {"status": "ok"}


@router.get("/api/status")
async def status() -> dict:
    settings = config.get_settings()
    return {
        **settings.describe(),
        "connected": graph.ping(),
        "llm_available": settings.llm_available,
        "falkordb_client_version": version("falkordb"),
    }


@router.get("/api/samples")
async def list_samples() -> dict:
    return {"default": config.DEFAULT_SAMPLE, "samples": samples.list_samples()}


@router.post("/api/samples/{name}/load")
async def load_sample(name: str) -> dict:
    """(Re)create the sample's graph from its seed.cypher."""
    if samples.get_sample(name) is None:
        raise HTTPException(status_code=404, detail=f"There is no sample called {name}.")
    result = run_sync(lambda: graph.load_sample(name))
    return {"call": f'graph.query(seed) on "{name}"', **result}
