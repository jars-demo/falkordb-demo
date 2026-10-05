"""The optional GraphRAG step, with FalkorDB's GraphRAG-SDK.

An LLM reads text, builds a knowledge graph in FalkorDB, then answers questions from it.
The LLM is any LiteLLM model (default: Groq, free). Embeddings run locally with fastembed,
because Groq has no embedding models.
"""

from functools import lru_cache
from typing import Any

from app.backend.core.config import GRAPHRAG_GRAPH, Settings, get_settings

EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
EMBEDDING_DIMENSION = 384


class NoLLMKeyError(RuntimeError):
    """GraphRAG needs an LLM key (for example a free Groq key)."""


@lru_cache(maxsize=1)
def _embedder():
    # Imported lazily: the Cypher part of the workshop never pays for loading these.
    from fastembed import TextEmbedding
    from graphrag_sdk import Embedder

    class FastEmbedEmbedder(Embedder):
        """Local embeddings with fastembed (about 70 MB, CPU only, no key)."""

        def __init__(self) -> None:
            self._model = TextEmbedding(EMBEDDING_MODEL)

        @property
        def model_name(self) -> str:
            return EMBEDDING_MODEL

        def embed_query(self, text: str, **kwargs: Any) -> list[float]:
            return next(iter(self._model.embed([text]))).tolist()

        def embed_documents(self, texts: list[str], **kwargs: Any) -> list[list[float]]:
            return [vector.tolist() for vector in self._model.embed(texts)]

    return FastEmbedEmbedder()


def _rag(settings: Settings):
    if not settings.llm_available:
        raise NoLLMKeyError(
            "GraphRAG needs an LLM key. Add a free Groq key with `python scripts/setup.py`."
        )
    from graphrag_sdk import ConnectionConfig, GraphRAG, LiteLLM

    return GraphRAG(
        connection=ConnectionConfig(
            host=settings.host,
            port=settings.port,
            username=settings.username,
            password=settings.password,
            graph_name=GRAPHRAG_GRAPH,
        ),
        llm=LiteLLM(model=settings.llm_model, api_key=settings.llm_api_key),
        embedder=_embedder(),
        embedding_dimension=EMBEDDING_DIMENSION,
    )


async def ingest(text: str, document_id: str) -> dict:
    """Extract a knowledge graph from text into the graphrag_demo graph."""
    async with _rag(get_settings()) as rag:
        result = await rag.ingest(text=text, document_id=document_id)
        await rag.finalize()
    return {
        "graph": GRAPHRAG_GRAPH,
        "nodes_created": int(result.nodes_created),
        "relationships_created": int(result.relationships_created),
    }


async def ask(question: str) -> dict:
    """Answer a question from the graphrag_demo graph."""
    async with _rag(get_settings()) as rag:
        result = await rag.completion(question)
    return {"answer": result.answer}
