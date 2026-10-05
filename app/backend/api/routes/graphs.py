"""Graph endpoints. Each one calls a single function in services/graph.py."""

import time

from fastapi import APIRouter, HTTPException

from app.backend.api.errors import run_sync, seconds_since
from app.backend.api.schemas import GraphName, QueryRequest
from app.backend.services import graph

router = APIRouter(prefix="/api")


@router.get("/graphs")
async def list_graphs() -> dict:
    return {"graphs": run_sync(graph.list_graphs)}


@router.post("/query")
async def query(body: QueryRequest) -> dict:
    started = time.perf_counter()
    result = run_sync(lambda: graph.run_query(body.graph, body.cypher, body.allow_writes))
    method = "query" if body.allow_writes else "ro_query"
    return {
        "call": f'select_graph("{body.graph}").{method}(cypher)',
        "seconds": seconds_since(started),
        **result,
    }


@router.get("/graphs/{name}/view")
async def view(name: GraphName) -> dict:
    started = time.perf_counter()
    data = run_sync(lambda: graph.graph_view(name))
    return {
        "call": f'select_graph("{name}").ro_query("MATCH (n) ...")',
        "seconds": seconds_since(started),
        **data,
    }


@router.get("/graphs/{name}/schema")
async def schema(name: GraphName) -> dict:
    return run_sync(lambda: graph.schema(name))


@router.delete("/graphs/{name}")
async def delete(name: GraphName) -> dict:
    started = time.perf_counter()
    if not run_sync(lambda: graph.delete_graph(name)):
        raise HTTPException(status_code=404, detail=f"There is no graph called {name}.")
    return {"call": f'select_graph("{name}").delete()', "seconds": seconds_since(started)}
