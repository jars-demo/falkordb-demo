# 02 · Load a sample graph (5 min)

## Do it

In card **1 · Load a sample graph**, keep **Social Network** selected and click **Load sample**.

## What just happened

The app ran [`data/social_network/seed.cypher`](../data/social_network/seed.cypher): one Cypher
`CREATE` statement that makes six people, two companies, two cities and the relationships
between them, in a graph called `social_network`:

```cypher
CREATE
  (ada:Person {name: 'Ada', age: 34, role: 'Engineer'}),
  (orbit:Company {name: 'Orbit Labs', industry: 'Software'}),
  (ada)-[:WORKS_AT {since: 2019}]->(orbit),
  ...
```

In Python, that is all it takes:

```python
from falkordb import FalkorDB

db = FalkorDB(host="localhost", port=6379)
db.select_graph("social_network").query(seed_cypher)
```

The real code is in [`app/backend/services/graph.py`](../app/backend/services/graph.py).

## Try

Load the two other samples too: **Cyber Attack Paths** and **Fraud Ring**. Each becomes its own
graph, named after its folder in [`data/`](../data).

Next: [03 · Query with Cypher](./03-query.md)
