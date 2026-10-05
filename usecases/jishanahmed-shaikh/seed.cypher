// Open-source connector graph: Jishanahmed AR Shaikh's sources for Coral and DataHub, and his
// connector proposals for cognee. Facts taken from his public pull requests and issues on GitHub.

CREATE
  (me:Contributor {name: 'Jishanahmed AR Shaikh', github: 'jishanahmed-shaikh'}),

  (coral:Project {name: 'Coral', what: 'One SQL interface for agents over APIs, files and live sources'}),
  (datahub:Project {name: 'DataHub', what: 'Open-source metadata platform and data catalog'}),
  (cognee:Project {name: 'cognee', what: 'Open-source memory engine for AI apps'}),

  (airflow:System {name: 'Apache Airflow', kind: 'workflow orchestrator'}),
  (kestra:System {name: 'Kestra', kind: 'workflow orchestrator'}),
  (datahubsys:System {name: 'DataHub', kind: 'metadata platform'}),
  (kafka:System {name: 'Apache Kafka', kind: 'event streaming'}),
  (rabbit:System {name: 'RabbitMQ', kind: 'message broker'}),
  (neo4j:System {name: 'Neo4j', kind: 'graph database'}),
  (pinecone:System {name: 'Pinecone', kind: 'vector database'}),
  (milvus:System {name: 'Milvus', kind: 'vector database'}),
  (qdrant:System {name: 'Qdrant Cloud', kind: 'vector database'}),
  (langfuse:System {name: 'Langfuse', kind: 'LLM observability'}),
  (signoz:System {name: 'SigNoz', kind: 'observability'}),
  (cloudflare:System {name: 'Cloudflare', kind: 'web infrastructure'}),
  (cal:System {name: 'Cal.com', kind: 'scheduling'}),
  (sap:System {name: 'SAP SuccessFactors', kind: 'HR platform'}),

  (me)-[:BUILT]->(:Connector {name: 'Coral Airflow source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/511'})-[:CONNECTS]->(airflow),
  (me)-[:BUILT]->(:Connector {name: 'Coral Kestra source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/468'})-[:CONNECTS]->(kestra),
  (me)-[:BUILT]->(:Connector {name: 'Coral DataHub source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/478'})-[:CONNECTS]->(datahubsys),
  (me)-[:BUILT]->(:Connector {name: 'Coral Kafka source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/550'})-[:CONNECTS]->(kafka),
  (me)-[:BUILT]->(:Connector {name: 'Coral RabbitMQ source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/538'})-[:CONNECTS]->(rabbit),
  (me)-[:BUILT]->(:Connector {name: 'Coral Neo4j source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/552'})-[:CONNECTS]->(neo4j),
  (me)-[:BUILT]->(:Connector {name: 'Coral Pinecone source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/513'})-[:CONNECTS]->(pinecone),
  (me)-[:BUILT]->(:Connector {name: 'Coral Milvus source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/541'})-[:CONNECTS]->(milvus),
  (me)-[:BUILT]->(:Connector {name: 'Coral Qdrant Cloud source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/413'})-[:CONNECTS]->(qdrant),
  (me)-[:BUILT]->(:Connector {name: 'Coral Langfuse source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/371'})-[:CONNECTS]->(langfuse),
  (me)-[:BUILT]->(:Connector {name: 'Coral SigNoz source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/516'})-[:CONNECTS]->(signoz),
  (me)-[:BUILT]->(:Connector {name: 'Coral Cloudflare source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/338'})-[:CONNECTS]->(cloudflare),
  (me)-[:BUILT]->(:Connector {name: 'Coral Cal.com source', status: 'merged', pr: 'https://github.com/withcoral/coral/pull/383'})-[:CONNECTS]->(cal),
  (me)-[:BUILT]->(:Connector {name: 'Coral SAP SuccessFactors source', status: 'open', pr: 'https://github.com/withcoral/coral/pull/2306'})-[:CONNECTS]->(sap),
  (me)-[:BUILT]->(:Connector {name: 'DataHub Pinecone source', status: 'merged', pr: 'https://github.com/datahub-project/datahub/pull/16472'})-[:CONNECTS]->(pinecone),
  (me)-[:BUILT]->(:Connector {name: 'DataHub Langfuse source', status: 'approved, awaiting merge', pr: 'https://github.com/datahub-project/datahub/pull/19923'})-[:CONNECTS]->(langfuse),
  (me)-[:PROPOSED]->(:Connector {name: 'cognee Airflow connector', status: 'proposed', issue: 'https://github.com/topoteretes/cognee/issues/5359'})-[:CONNECTS]->(airflow),
  (me)-[:PROPOSED]->(:Connector {name: 'cognee DataHub connector', status: 'proposed', issue: 'https://github.com/topoteretes/cognee/issues/5360'})-[:CONNECTS]->(datahubsys);

// Attach every connector to the project it was built for, using its name.
MATCH (c:Connector), (p:Project)
WHERE c.name STARTS WITH p.name + ' '
CREATE (c)-[:FOR]->(p);
