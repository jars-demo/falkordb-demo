"""Check that FalkorDB works with your settings, end to end.

    uv run python scripts/check_setup.py

It loads the Social Network sample, runs a Cypher query, reads the graph back, then deletes the
test graph, using the same code as the app (app/backend/services/graph.py).
"""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.backend.core import config  # noqa: E402  (loads .env)
from app.backend.services import graph, samples  # noqa: E402

SAMPLE = "social_network"
TEST_GRAPH = "setup_check"


def step(message: str) -> float:
    print(f"\n-> {message}", flush=True)
    return time.perf_counter()


def done(started: float) -> None:
    print(f"   ok ({time.perf_counter() - started:.2f}s)", flush=True)


def main() -> None:
    settings = config.get_settings()
    print(f"FalkorDB: {settings.host}:{settings.port}")

    started = step("connect")
    if not graph.ping():
        print("   FalkorDB is not reachable. Start it with: docker compose up -d falkordb")
        sys.exit(1)
    done(started)

    started = step("create a graph from the sample")
    target = graph.db().select_graph(TEST_GRAPH)
    if TEST_GRAPH in graph.list_graphs():
        target.delete()
    for statement in samples.seed_statements(SAMPLE):
        target.query(statement)
    done(started)

    started = step("query it with Cypher")
    result = graph.run_query(
        TEST_GRAPH, "MATCH (p:Person)-[:WORKS_AT]->(c:Company) RETURN count(p)"
    )
    done(started)
    print(f"   {result['rows'][0][0]} people work at a company")

    started = step("read the graph back")
    view = graph.graph_view(TEST_GRAPH)
    done(started)
    print(f"   {len(view['nodes'])} nodes, {len(view['edges'])} relationships")

    started = step("delete the test graph")
    graph.delete_graph(TEST_GRAPH)
    done(started)

    graphrag = "ready" if settings.llm_available else "add a Groq key to try it"
    print(f"\nAll good. GraphRAG step: {graphrag}.")


if __name__ == "__main__":
    sys.stdout.reconfigure(errors="replace")
    main()
