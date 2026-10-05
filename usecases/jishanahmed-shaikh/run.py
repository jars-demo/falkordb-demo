"""Use case: Jishanahmed AR Shaikh's open-source connector work, as a graph.

Run it from the repo root:

    docker compose exec backend python usecases/jishanahmed-shaikh/run.py   # Docker
    uv run python usecases/jishanahmed-shaikh/run.py                        # locally
"""

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent.parent))

from app.backend.services import graph  # noqa: E402  (loads .env)

GRAPH = f"usecase_{HERE.name.strip('_').replace('-', '_')}"

QUESTIONS = [
    (
        "How many connectors did he build for each project, and how many are merged?",
        "MATCH (:Contributor)-[:BUILT]->(c:Connector)-[:FOR]->(p:Project)\n"
        "RETURN p.name AS project, count(c) AS built,\n"
        "       count(CASE WHEN c.status = 'merged' THEN 1 END) AS merged\n"
        "ORDER BY built DESC",
    ),
    (
        "Which systems has he connected to both Coral and DataHub?",
        "MATCH (s:System)<-[:CONNECTS]-(:Connector)-[:FOR]->(:Project {name: 'Coral'}),\n"
        "      (s)<-[:CONNECTS]-(:Connector)-[:FOR]->(:Project {name: 'DataHub'})\n"
        "RETURN DISTINCT s.name AS system",
    ),
    (
        "Which vector databases can Coral read through his sources?",
        "MATCH (:Project {name: 'Coral'})<-[:FOR]-(:Connector)-[:CONNECTS]->(s:System)\n"
        "WHERE s.kind = 'vector database'\n"
        "RETURN s.name AS system ORDER BY system",
    ),
    (
        "Which earlier work does each cognee proposal build on?",
        "MATCH (:Contributor)-[:PROPOSED]->(p:Connector)-[:CONNECTS]->(s:System),\n"
        "      (:Contributor)-[:BUILT]->(earlier:Connector)-[:CONNECTS]->(s)\n"
        "RETURN p.name AS proposal, collect(earlier.name) AS builds_on",
    ),
    (
        "Which contributions are not merged yet, and what is their status?",
        "MATCH (:Contributor)-[]->(c:Connector)\n"
        "WHERE c.status <> 'merged'\n"
        "RETURN c.name AS connector, c.status AS status ORDER BY connector",
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
