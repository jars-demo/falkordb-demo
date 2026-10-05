"""Request bodies for the API."""

from typing import Annotated

from pydantic import BaseModel, Field

# A FalkorDB graph name: letters, digits, "_" and "-" only.
GraphName = Annotated[str, Field(min_length=1, max_length=64, pattern=r"^[\w\-]+$")]


class QueryRequest(BaseModel):
    graph: GraphName
    cypher: str = Field(min_length=1, max_length=20_000)
    # Off by default: queries are read-only, so CREATE/SET/DELETE need an explicit opt-in.
    allow_writes: bool = False


class IngestRequest(BaseModel):
    text: str = Field(min_length=1, max_length=50_000)


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2_000)
