# 04 · Explore the graph (5 min)

## Do it

In card **3 · Explore the graph**, click **Draw graph**. Click **Ada**: the panel shows her
properties and every relationship.

## What you are looking at

Each colour is a node label (`Person`, `Company`, `City`), each arrow a relationship with its
type. The app reads the graph with two read-only queries:

```cypher
MATCH (n) RETURN n LIMIT 400
MATCH ()-[r]->() RETURN r LIMIT 1200
```

FalkorDB also ships its own browser UI at <http://localhost:3201>, where you can run Cypher and
see results drawn as a graph.

## Try

Load and draw **Fraud Ring**. Three customers look unrelated, but they share one phone, one device
and one address, and their accounts pass money in a circle. You can often see the pattern before
writing any Cypher; then confirm it with the sample's questions.

Next: [05 · Change the graph](./05-change-the-graph.md)
