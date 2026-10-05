# Troubleshooting

## The badge says "FalkorDB not reachable"

- Docker: check `docker compose ps`. Start it with `docker compose up -d`.
- Running the backend locally: start FalkorDB with `docker compose up -d falkordb`, and check
  `FALKORDB_HOST` / `FALKORDB_PORT` in `.env` (default `localhost` / `6379`).
- FalkorDB Cloud: check host, port, username and password on your instance page at
  <https://app.falkordb.cloud>.

## "This query changes the graph. Tick 'Allow changes' to run it."

Queries run read-only by default. Tick **Allow changes** to run `CREATE`, `MERGE`, `SET` or
`DELETE`.

## "FalkorDB currently only supports shortestPaths in WITH or RETURN clauses"

Write `shortestPath` after `WITH` or in `RETURN`, not inside `MATCH`:

```cypher
MATCH (a:Person {name: 'Dev'}), (b:Person {name: 'Fay'})
WITH shortestPath((a)-[:KNOWS*]->(b)) AS p
RETURN nodes(p)
```

It also needs a direction (`->`); an undirected `-[:KNOWS*]-` fails with "does not currently
support undirected shortestPath traversals".

## A query returns nothing

- Is the right graph selected in card 1? Queries run against that graph.
- Did you delete it? Load the sample again.
- Labels, types and property names are case-sensitive: `:Person` is not `:person`.

## Port 6379 or 3200 is already in use

Another Redis or app uses the port. Stop it, or change the left-hand side of the port in
`docker-compose.yml` (for example `"6380:6379"`) and set `FALKORDB_PORT=6380` in `.env`.

## GraphRAG: "needs an LLM key", or a rate-limit error

Add a free Groq key with `python scripts/setup.py`, then restart. Groq's free tier limits tokens
per minute: if building the graph fails with a rate limit, wait a minute and try again.

## Develop mode: installing fails on `hnswlib` ("C++11 support is needed")

GraphRAG-SDK depends on `hnswlib`, which is published only as source, so installing the Python
dependencies outside Docker needs a C++ compiler:

| System | Install |
|---|---|
| Windows | [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/), workload "Desktop development with C++" |
| macOS | `xcode-select --install` |
| Linux | `sudo apt install build-essential` (or your distribution's equivalent) |

The Docker option needs none of this: the image builds it for you.

## Start completely fresh

`docker compose down -v` deletes all graphs and the downloaded embedding model.
`docker compose down` keeps both.
