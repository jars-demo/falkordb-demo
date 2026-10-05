# 03 · Query with Cypher (10 min)

## Do it

With the `social_network` graph selected, click the suggested questions above the editor in card
**2 · Query with Cypher**, then **Run query** (or press Ctrl + Enter).

## The three clauses you need

| Clause | Does |
|---|---|
| `MATCH` | Describes the pattern to find |
| `WHERE` | Filters it |
| `RETURN` | Picks the output (add `ORDER BY`, `LIMIT` as needed) |

```cypher
MATCH (p:Person)-[w:WORKS_AT]->(c:Company {name: 'Orbit Labs'})
RETURN p.name AS person, p.role AS role, w.since AS since
ORDER BY since
```

Patterns can share nodes. This finds people in the same city who work at different companies:

```cypher
MATCH (a:Person)-[:LIVES_IN]->(city:City)<-[:LIVES_IN]-(b:Person),
      (a)-[:WORKS_AT]->(ca:Company), (b)-[:WORKS_AT]->(cb:Company)
WHERE a.name < b.name AND ca <> cb
RETURN city.name AS city, a.name AS person_a, b.name AS person_b
```

## Paths

`-[:KNOWS*]-` follows any number of hops. `shortestPath` finds the shortest route; in FalkorDB it
goes in a `WITH` or `RETURN` clause:

```cypher
MATCH (a:Person {name: 'Dev'}), (b:Person {name: 'Fay'})
WITH shortestPath((a)-[:KNOWS*]-(b)) AS p
RETURN [n IN nodes(p) | n.name] AS path, length(p) AS hops
```

## Try

Load **Cyber Attack Paths** and run its questions. The last one finds paths to the customer
database that pass **only through vulnerable hosts**, a question that is hard in SQL and short in
Cypher.

Next: [04 · Explore the graph](./04-explore.md)
