# 05 · Change the graph (10 min)

## Do it

The app runs queries **read-only** by default (`ro_query`), so a stray `CREATE` cannot change a
sample. Tick **Allow changes** in card 2, select the `social_network` graph, and add yourself:

```cypher
MATCH (orbit:Company {name: 'Orbit Labs'})
MERGE (me:Person {name: 'You'})
MERGE (me)-[:WORKS_AT {since: 2026}]->(orbit)
RETURN me.name AS person, orbit.name AS company
```

Run it twice. The stats line shows changes the first time and none the second.

## CREATE or MERGE?

| | Does |
|---|---|
| `CREATE` | Always adds new nodes and relationships |
| `MERGE` | Finds the pattern, and creates only what is missing |
| `SET` | Adds or changes properties: `SET me.role = 'Speaker'` |
| `DETACH DELETE` | Removes a node and its relationships |

## Speed up lookups

An index lets FalkorDB find starting nodes without scanning every node:

```cypher
CREATE INDEX FOR (p:Person) ON (p.name)
```

## Clean up

Card **5 · Delete the graph** removes the selected graph. Load the sample again to bring it back.

Next: [06 · GraphRAG](./06-graphrag.md)
