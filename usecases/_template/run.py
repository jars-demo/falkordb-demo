"""Your FalkorDB use case. Copy this folder to usecases/<your-github-handle>/ and edit it.

Run it from the repo root:

    docker compose exec backend python usecases/<your-github-handle>/run.py   # Docker
    uv run python usecases/<your-github-handle>/run.py                        # locally

It loads seed.cypher into a graph named after your folder, then runs your questions. It uses
app/backend/services/graph.py, the same small wrapper around FalkorDB the app uses.
"""

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent.parent))

from app.backend.services import graph  # noqa: E402  (loads .env)

# 1. Your graph is named after your folder, so it never collides with anyone else's.
GRAPH = f"usecase_{HERE.name.strip('_').replace('-', '_')}"

# 2. Questions about your graph, each with the Cypher that answers it.
QUESTIONS = [
    ("Who is in the graph?", "MATCH (p:Person) RETURN p.name AS name ORDER BY name"),
    (
        "Who knows whom?",
        "MATCH (a:Person)-[:KNOWS]->(b:Person) RETURN a.name AS person, b.name AS knows",
    ),
    (
        "Replace me with a question that needs two hops",
        "MATCH (a:Person)-[:KNOWS*2]->(c:Person) RETURN DISTINCT a.name AS person, c.name AS reach",
    ),
]


def load() -> None:
    """(Re)create the graph from seed.cypher, so re-running starts clean."""
    graph.delete_graph(GRAPH)
    text = (HERE / "seed.cypher").read_text(encoding="utf-8")
    code = "\n".join(line for line in text.splitlines() if not line.strip().startswith("//"))
    target = graph.db().select_graph(GRAPH)
    for statement in (s.strip() for s in code.split(";")):
        if statement:
            target.query(statement)


def main() -> None:
    load()
    print(f"Loaded seed.cypher into graph '{GRAPH}'.")
    for question, cypher in QUESTIONS:
        result = graph.run_query(GRAPH, cypher)
        print(f"\nQ: {question}")
        print("   " + " | ".join(result["columns"]))
        for row in result["rows"]:
            print("   " + " | ".join(str(value) for value in row))


if __name__ == "__main__":
    sys.stdout.reconfigure(errors="replace")
    main()
