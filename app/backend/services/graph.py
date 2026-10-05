"""Every FalkorDB call the app makes lives in this module. Start reading here.

FalkorDB stores many named graphs. Each sample in data/ is loaded into a graph of the same name,
and you query a graph with Cypher.
"""

from functools import lru_cache
from typing import Any

from falkordb import Edge, FalkorDB, Node, Path

from app.backend.core.config import Settings, get_settings
from app.backend.services import samples

# Cap how much a query or the graph view returns, so a big graph never floods the browser.
MAX_ROWS = 500
VIEW_NODES = 400
VIEW_EDGES = 1200


@lru_cache(maxsize=1)
def _client(settings: Settings) -> FalkorDB:
    return FalkorDB(
        host=settings.host,
        port=settings.port,
        username=settings.username,
        password=settings.password,
    )


def db() -> FalkorDB:
    return _client(get_settings())


def ping() -> bool:
    """Whether FalkorDB answers."""
    try:
        db().list_graphs()
        return True
    except Exception:
        return False


def list_graphs() -> list[str]:
    return sorted(db().list_graphs())


def load_sample(name: str) -> dict:
    """(Re)create a sample graph from data/<name>/seed.cypher."""
    graph = db().select_graph(name)
    if name in db().list_graphs():
        graph.delete()
    created_nodes = created_edges = 0
    for statement in samples.seed_statements(name):
        result = graph.query(statement)
        created_nodes += int(result.nodes_created)
        created_edges += int(result.relationships_created)
    return {"graph": name, "nodes_created": created_nodes, "relationships_created": created_edges}


def run_query(graph: str, cypher: str, allow_writes: bool = False) -> dict:
    """Run Cypher. Read-only unless allow_writes, so a stray CREATE cannot change a sample."""
    target = db().select_graph(graph)
    result = target.query(cypher) if allow_writes else target.ro_query(cypher)
    columns = [column[1] for column in result.header]
    rows = [[_to_json(value) for value in row] for row in result.result_set[:MAX_ROWS]]
    return {
        "columns": columns,
        "rows": rows,
        "truncated": len(result.result_set) > MAX_ROWS,
        "stats": {
            # FalkorDB reports counts as floats; they are whole numbers.
            "nodes_created": int(result.nodes_created),
            "nodes_deleted": int(result.nodes_deleted),
            "relationships_created": int(result.relationships_created),
            "relationships_deleted": int(result.relationships_deleted),
            "properties_set": int(result.properties_set),
            "run_time_ms": round(result.run_time_ms, 3),
        },
    }


def graph_view(graph: str) -> dict:
    """The graph as {nodes, edges} for drawing."""
    if graph not in db().list_graphs():
        return {"nodes": [], "edges": []}
    target = db().select_graph(graph)
    nodes = target.ro_query(f"MATCH (n) RETURN n LIMIT {VIEW_NODES}").result_set
    edges = target.ro_query(f"MATCH ()-[r]->() RETURN r LIMIT {VIEW_EDGES}").result_set
    drawn = [_node(row[0]) for row in nodes]
    known = {node["id"] for node in drawn}
    lines = [_edge(row[0]) for row in edges]
    return {
        "nodes": drawn,
        "edges": [e for e in lines if e["source"] in known and e["target"] in known],
    }


def schema(graph: str) -> dict:
    """Node labels and relationship types in a graph, with counts."""
    target = db().select_graph(graph)
    labels = target.ro_query(
        "MATCH (n) UNWIND labels(n) AS label RETURN label, count(*) AS count ORDER BY label"
    ).result_set
    types = target.ro_query(
        "MATCH ()-[r]->() RETURN type(r) AS type, count(*) AS count ORDER BY type"
    ).result_set
    return {
        "labels": [{"name": name, "count": count} for name, count in labels],
        "relationship_types": [{"name": name, "count": count} for name, count in types],
    }


def delete_graph(graph: str) -> bool:
    """Delete a graph. Returns False when it did not exist."""
    if graph not in db().list_graphs():
        return False
    db().select_graph(graph).delete()
    return True


# ---------- turning FalkorDB values into JSON ----------


def _node(node: Node) -> dict:
    labels = list(node.labels or [])
    props = dict(node.properties or {})
    caption = next(
        (
            str(props[key])
            for key in ("name", "title", "number", "cve", "id", "line")
            if key in props
        ),
        labels[0] if labels else str(node.id),
    )
    return {
        "id": str(node.id),
        "label": caption[:60],
        "type": labels[0] if labels else "Node",
        "properties": props,
    }


def _edge(edge: Edge) -> dict:
    return {
        "id": str(edge.id),
        "source": str(_node_id(edge.src_node)),
        "target": str(_node_id(edge.dest_node)),
        "label": edge.relation,
        "properties": dict(edge.properties or {}),
    }


def _node_id(value: Any) -> Any:
    return value.id if isinstance(value, Node) else value


def _to_json(value: Any) -> Any:
    """Render one result cell: nodes, edges and paths as small dicts, lists recursively."""
    if isinstance(value, Node):
        return {"node": _node(value)}
    if isinstance(value, Edge):
        return {"edge": _edge(value)}
    if isinstance(value, Path):
        return {"path": [_node(node)["label"] for node in value.nodes()]}
    if isinstance(value, list):
        return [_to_json(item) for item in value]
    if isinstance(value, dict):
        return {key: _to_json(item) for key, item in value.items()}
    return value
