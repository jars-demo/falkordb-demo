# 01 · Meet FalkorDB (5 min)

## Start the app

If it is not running yet: `docker compose up -d --build` (or `python scripts/setup.py`).

Open <http://localhost:3200/#/workshop>. The guide on the left follows these chapters, and the
badge in the top bar shows whether FalkorDB is reachable. New to graphs? Read the **Concepts**
page first (<http://localhost:3200/#/concepts>).

## What FalkorDB is

[FalkorDB](https://www.falkordb.com/) is a fast, open-source **graph database**. Instead of tables
and joins, it stores:

| Piece | Example |
|---|---|
| **Nodes**, with a label and properties | `(:Person {name: 'Ada', age: 34})` |
| **Relationships**, with a type, a direction and properties | `-[:WORKS_AT {since: 2019}]->` |

You ask questions in **Cypher**, a query language made of the same patterns:

```cypher
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
RETURN p.name, c.name
```

FalkorDB stores each graph as sparse matrices (it uses GraphBLAS) and speaks the Redis protocol,
so one server holds many named graphs. That is why the app lets you choose a graph by name.

Next: [02 · Load a sample graph](./02-load-a-sample.md)
