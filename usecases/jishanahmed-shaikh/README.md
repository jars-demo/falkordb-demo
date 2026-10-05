# My use case: open-source connector graph

**Author:** Jishanahmed AR Shaikh ([@jishanahmed-shaikh](https://github.com/jishanahmed-shaikh) · [jishanahmed.in](https://jishanahmed.in))
**Mode I used:** Docker

## What I modelled

My open-source connector work as a graph: the connectors I built for Coral and DataHub, the
systems each one connects to, and my connector proposals for cognee. The facts come from my public
pull requests and issues on GitHub, and each connector node keeps its link.

## The graph

```text
(:Contributor)-[:BUILT|PROPOSED]->(:Connector {status, pr})-[:CONNECTS]->(:System {kind})
(:Connector)-[:FOR]->(:Project)
```

A second statement in `seed.cypher` links each connector to its project by name, with
`MATCH … WHERE c.name STARTS WITH p.name + ' ' CREATE (c)-[:FOR]->(p)`.

## Questions and what came back

These are the real results of `run.py` against FalkorDB:

| Question | What came back |
|---|---|
| How many connectors did he build for each project, and how many are merged? | Coral: 14 built, 13 merged · DataHub: 2 built, 1 merged |
| Which systems has he connected to both Coral and DataHub? | Pinecone, Langfuse |
| Which vector databases can Coral read through his sources? | Milvus, Pinecone, Qdrant Cloud |
| Which earlier work does each cognee proposal build on? | Airflow connector ← Coral Airflow source · DataHub connector ← Coral DataHub source |
| Which contributions are not merged yet, and what is their status? | SAP SuccessFactors (open), DataHub Langfuse source (approved, awaiting merge), both cognee proposals (proposed) |

## What I learned

- "Connected to both Coral and DataHub" is two patterns that share a node; in SQL it would be a
  self-join over three tables.
- Keeping `kind` on `:System` makes questions like "which vector databases" a simple `WHERE`.

## How to run it

```bash
docker compose exec backend python usecases/jishanahmed-shaikh/run.py
```

Then type `usecase_jishanahmed_shaikh` as the graph in the app's Workshop page and draw it.
