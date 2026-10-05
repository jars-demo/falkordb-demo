"""Turn FalkorDB and GraphRAG failures into short, readable HTTP errors."""

import time
from collections.abc import Awaitable, Callable
from typing import TypeVar

from fastapi import HTTPException
from redis.exceptions import ConnectionError as RedisConnectionError
from redis.exceptions import ResponseError

from app.backend.services.graphrag import NoLLMKeyError

T = TypeVar("T")

NOT_REACHABLE = (
    "FalkorDB is not reachable. Start it with `docker compose up -d falkordb`, or check "
    "FALKORDB_HOST and FALKORDB_PORT in .env."
)


def run_sync(call: Callable[[], T]) -> T:
    try:
        return call()
    except Exception as error:
        raise _http_error(error) from error


async def run_async(call: Awaitable[T]) -> T:
    try:
        return await call
    except Exception as error:
        raise _http_error(error) from error


def _http_error(error: Exception) -> HTTPException:
    message = str(error) or error.__class__.__name__
    if isinstance(error, RedisConnectionError):
        return HTTPException(status_code=503, detail=NOT_REACHABLE)
    if isinstance(error, NoLLMKeyError):
        return HTTPException(status_code=400, detail=message)
    if isinstance(error, ResponseError):
        # Cypher mistakes come back as ResponseError: show FalkorDB's own message.
        if "graph.RO_QUERY is to be executed only on read-only queries" in message:
            message = "This query changes the graph. Tick 'Allow changes' to run it."
        return HTTPException(status_code=400, detail=message[:600])
    return HTTPException(status_code=500, detail=f"{error.__class__.__name__}: {message}"[:600])


def seconds_since(started: float) -> float:
    return round(time.perf_counter() - started, 3)
