// The ideas behind FalkorDB, each with a short example. Read before (or during) the workshop.

import type { ReactNode } from 'react'
import { GraphDiagram } from '../components/GraphDiagram.tsx'

interface Concept {
  id: string
  title: string
  body: string
  code?: string
  visual?: ReactNode
}

const CONCEPTS: Concept[] = [
  {
    id: 'property-graph',
    title: 'The property graph',
    body: 'A graph is made of nodes (things) and relationships (how they connect). Nodes carry labels such as :Person, relationships have a type such as :WORKS_AT and a direction, and both can hold properties. Here is a piece of the Social Network sample:',
    visual: <GraphDiagram />,
  },
  {
    id: 'falkordb',
    title: 'FalkorDB',
    body: 'FalkorDB is an open-source graph database built for speed: it represents graphs as sparse matrices and answers queries with linear algebra. It speaks the Redis protocol, so one server holds many named graphs, and it ships with a browser UI for exploring them.',
    code: `from falkordb import FalkorDB

db = FalkorDB(host="localhost", port=6379)
g = db.select_graph("social_network")`,
  },
  {
    id: 'create',
    title: 'Creating data: CREATE and MERGE',
    body: 'CREATE always adds new nodes and relationships. MERGE first looks for the pattern and only creates what is missing, so running it twice does not duplicate anything. Use MERGE whenever data may already be there.',
    code: `CREATE (:Person {name: 'Ada'})-[:WORKS_AT {since: 2019}]->(:Company {name: 'Orbit Labs'})

MERGE (p:Person {name: 'Ada'})
MERGE (c:City {name: 'Pune'})
MERGE (p)-[:LIVES_IN]->(c)`,
  },
  {
    id: 'match',
    title: 'Querying: MATCH, WHERE, RETURN',
    body: 'MATCH draws the pattern you are looking for, WHERE filters it, and RETURN picks what comes back. Patterns read like the graph itself, which keeps multi-hop questions short.',
    code: `MATCH (a:Person)-[:LIVES_IN]->(city:City)<-[:LIVES_IN]-(b:Person)
WHERE a.name < b.name
RETURN city.name, a.name, b.name`,
  },
  {
    id: 'paths',
    title: 'Paths and traversals',
    body: 'Variable-length patterns such as -[:CAN_REACH*]-> follow any number of hops. shortestPath finds the shortest route between two nodes; in FalkorDB it goes in a WITH or RETURN clause, not inside MATCH.',
    code: `MATCH (src:Zone {name: 'Internet'}), (dst:Host {name: 'customer-db'})
WITH shortestPath((src)-[:CAN_REACH*]->(dst)) AS p
RETURN [n IN nodes(p) | n.name] AS attack_path`,
  },
  {
    id: 'read-only',
    title: 'Read-only queries',
    body: 'ro_query runs a query that cannot change the graph, which is the safe default for exploration. The workshop app uses it unless you tick "Allow changes".',
    code: `g.ro_query("MATCH (n) RETURN count(n)")   # read only
g.query("CREATE (:Person {name: 'You'})")  # may change the graph`,
  },
  {
    id: 'indexes',
    title: 'Indexes',
    body: 'An index lets FalkorDB find starting nodes quickly, for example a person by name, instead of scanning every node. Create one for properties you often match on.',
    code: 'CREATE INDEX FOR (p:Person) ON (p.name)',
  },
  {
    id: 'graphrag',
    title: 'GraphRAG',
    body: "GraphRAG combines a knowledge graph with an LLM. FalkorDB's GraphRAG-SDK reads documents, extracts entities and relationships into a graph, and answers questions from the facts and links it finds, so answers can be traced back to the source.",
    code: `async with GraphRAG(connection=ConnectionConfig(graph_name="graphrag_demo"),
                    llm=LiteLLM(model="groq/openai/gpt-oss-120b"), embedder=embedder) as rag:
    await rag.ingest(text=report)
    answer = await rag.completion("Who led the response?")`,
  },
  {
    id: 'queryweaver',
    title: 'QueryWeaver: text to SQL',
    body: "QueryWeaver is FalkorDB's open-source text-to-SQL tool. It stores a relational database's schema as a graph, so an LLM can follow the links between tables and write correct SQL from a plain-language question. It is a good example of a graph used as context for an LLM.",
  },
]

export function ConceptsPage() {
  return (
    <main className="page">
      <section className="page-header">
        <span className="pill">Concepts</span>
        <h1>How graphs and FalkorDB work</h1>
        <p>
          The ideas you will use in the workshop, in the order you meet them. For the full picture, see
          the <a href="https://docs.falkordb.com/" target="_blank" rel="noreferrer">FalkorDB docs</a>.
        </p>
      </section>

      <div className="concepts">
        <nav className="concepts-toc" aria-label="Concepts">
          {CONCEPTS.map((concept, index) => (
            <a
              key={concept.id}
              href="#/concepts"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(concept.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {concept.title}
            </a>
          ))}
        </nav>
        <div className="concepts-list">
          {CONCEPTS.map((concept, index) => (
            <article className="concept" id={concept.id} key={concept.id}>
              <span className="concept-index">{String(index + 1).padStart(2, '0')}</span>
              <h2>{concept.title}</h2>
              <p>{concept.body}</p>
              {concept.visual}
              {concept.code && <pre>{concept.code}</pre>}
            </article>
          ))}
          <div className="concept cta">
            <h2>Ready to try it?</h2>
            <p>The workshop puts each of these into practice, step by step.</p>
            <a className="btn" href="#/workshop">Start the workshop</a>
          </div>
        </div>
      </div>
    </main>
  )
}
