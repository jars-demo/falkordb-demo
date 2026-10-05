// Replace this with your own graph. Each statement ends with a semicolon.
// Ideas: a sports league, your project's services and dependencies, a family tree, a book series.
// Only use data you are allowed to share: nothing personal, private or confidential.

CREATE
  (ada:Person {name: 'Ada'}),
  (ben:Person {name: 'Ben'}),
  (cara:Person {name: 'Cara'}),
  (ada)-[:KNOWS]->(ben),
  (ben)-[:KNOWS]->(cara);
