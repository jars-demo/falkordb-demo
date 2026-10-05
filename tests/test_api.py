"""API tests. The FalkorDB layer (app/backend/services/graph.py) is faked: no database needed."""

import pytest
from fastapi.testclient import TestClient
from redis.exceptions import ConnectionError as RedisConnectionError
from redis.exceptions import ResponseError

from app.backend import main
from app.backend.services import graph, samples


@pytest.fixture
def client(monkeypatch):
    calls = []

    def fake_query(name, cypher, allow_writes=False):
        calls.append(("query", name, cypher, allow_writes))
        if cypher == "BROKEN":
            raise ResponseError("Invalid input 'B'")
        if cypher == "WRITE" and not allow_writes:
            raise ResponseError("graph.RO_QUERY is to be executed only on read-only queries")
        return {"columns": ["n"], "rows": [[1]], "truncated": False, "stats": {"run_time_ms": 0.1}}

    monkeypatch.setattr(graph, "ping", lambda: True)
    monkeypatch.setattr(graph, "list_graphs", lambda: ["social_network"])
    monkeypatch.setattr(
        graph,
        "load_sample",
        lambda name: {"graph": name, "nodes_created": 10, "relationships_created": 19},
    )
    monkeypatch.setattr(graph, "run_query", fake_query)
    monkeypatch.setattr(graph, "graph_view", lambda name: {"nodes": [], "edges": []})
    monkeypatch.setattr(graph, "delete_graph", lambda name: name == "social_network")
    monkeypatch.delenv("LLM_API_KEY", raising=False)

    with TestClient(main.create_app()) as test_client:
        test_client.calls = calls
        yield test_client


def test_status(client):
    body = client.get("/api/status").json()
    assert body["connected"] is True
    assert body["llm_available"] is False


def test_samples_list_every_seeded_folder(client):
    body = client.get("/api/samples").json()
    assert body["default"] == "social_network"
    names = [s["graph"] for s in body["samples"]]
    assert names == ["cyber_attack_paths", "fraud_ring", "social_network"]
    assert all(len(s["questions"]) == 3 for s in body["samples"])


def test_every_sample_question_has_cypher():
    for sample in samples.list_samples():
        for question in sample["questions"]:
            assert question["question"] and "RETURN" in question["cypher"]


def test_seed_statements_skip_comments():
    statements = samples.seed_statements("social_network")
    assert len(statements) == 1
    assert statements[0].startswith("CREATE")


def test_load_sample(client):
    body = client.post("/api/samples/social_network/load").json()
    assert body["nodes_created"] == 10


def test_unknown_or_unsafe_sample_is_404(client):
    assert client.post("/api/samples/nope/load").status_code == 404
    assert client.post("/api/samples/Bad!Name/load").status_code == 404


def test_query_is_read_only_by_default(client):
    assert (
        client.post(
            "/api/query", json={"graph": "social_network", "cypher": "MATCH (n) RETURN n"}
        ).status_code
        == 200
    )
    assert client.calls[-1][3] is False


def test_write_without_opt_in_gets_a_clear_message(client):
    response = client.post("/api/query", json={"graph": "social_network", "cypher": "WRITE"})
    assert response.status_code == 400
    assert "Allow changes" in response.json()["detail"]


def test_write_with_opt_in(client):
    response = client.post(
        "/api/query", json={"graph": "social_network", "cypher": "WRITE", "allow_writes": True}
    )
    assert response.status_code == 200


def test_cypher_errors_are_400(client):
    response = client.post("/api/query", json={"graph": "social_network", "cypher": "BROKEN"})
    assert response.status_code == 400
    assert "Invalid input" in response.json()["detail"]


def test_unreachable_falkordb_is_503(client, monkeypatch):
    def down(*args, **kwargs):
        raise RedisConnectionError("refused")

    monkeypatch.setattr(graph, "run_query", down)
    response = client.post("/api/query", json={"graph": "g", "cypher": "MATCH (n) RETURN n"})
    assert response.status_code == 503


def test_graph_names_are_validated(client):
    assert (
        client.post(
            "/api/query", json={"graph": "../x", "cypher": "MATCH (n) RETURN n"}
        ).status_code
        == 422
    )


def test_delete(client):
    assert client.delete("/api/graphs/social_network").status_code == 200
    assert client.delete("/api/graphs/missing").status_code == 404


def test_graphrag_needs_a_key(client):
    response = client.post("/api/graphrag/ask", json={"question": "who?"})
    assert response.status_code == 400
    assert "Groq" in response.json()["detail"]


def test_graphrag_sample(client):
    body = client.get("/api/graphrag/sample").json()
    assert body["graph"] == "graphrag_demo"
    assert "Incident report" in body["text"]
