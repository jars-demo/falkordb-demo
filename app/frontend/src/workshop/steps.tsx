// The seven workshop steps shown on the Workshop page. Keep in sync with workshop/*.md.

import type { ReactNode } from 'react'
import { DEFAULT_SAMPLE, type GraphState, type StepId } from '../hooks/useGraph.ts'

export interface Step {
  id: StepId
  title: string
  minutes: number
  card: string | null
  body: ReactNode
  action: { label: string; run: (state: GraphState) => Promise<unknown> | true }
}

export const STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Meet FalkorDB',
    minutes: 5,
    card: null,
    body: (
      <>
        <h4>What is FalkorDB?</h4>
        <p>
          FalkorDB is a fast, open-source <strong>graph database</strong>. It stores data as{' '}
          <strong>nodes</strong> (things) and <strong>relationships</strong> (how they connect), and
          you ask questions in <strong>Cypher</strong>, a query language made of patterns.
        </p>
        <div className="callout">The badge in the top bar shows whether FalkorDB is reachable.</div>
        <pre>{`(:Person {name: 'Ada'})
  -[:WORKS_AT]->
(:Company {name: 'Orbit Labs'})`}</pre>
      </>
    ),
    action: { label: "I'm set up", run: () => true },
  },
  {
    id: 'load',
    title: 'Load a sample graph',
    minutes: 5,
    card: 'card-load',
    body: (
      <>
        <h4>Create your first graph</h4>
        <p>
          Click <strong>Try it</strong> to load the <strong>Social Network</strong> sample: six people,
          two companies, two cities. It runs <code>data/social_network/seed.cypher</code>, a single
          Cypher <code>CREATE</code> statement.
        </p>
        <pre>{`CREATE (ada:Person {name: 'Ada'}),
       (orbit:Company {name: 'Orbit Labs'}),
       (ada)-[:WORKS_AT {since: 2019}]->(orbit)`}</pre>
      </>
    ),
    action: { label: 'Try it: load the sample', run: (s) => s.loadSample(DEFAULT_SAMPLE) },
  },
  {
    id: 'query',
    title: 'Query with Cypher',
    minutes: 10,
    card: 'card-query',
    body: (
      <>
        <h4>Ask with patterns</h4>
        <p>
          <code>MATCH</code> describes a pattern, <code>WHERE</code> filters it, <code>RETURN</code>{' '}
          picks the output. Click the suggested questions above the editor, run them, then change
          them.
        </p>
        <pre>{`MATCH (p:Person)-[:WORKS_AT]->(c:Company)
RETURN p.name, c.name`}</pre>
      </>
    ),
    action: {
      label: 'Try it: run a query',
      run: (s) =>
        s.runQuery({
          cypher: "MATCH (p:Person)-[w:WORKS_AT]->(c:Company {name: 'Orbit Labs'})\nRETURN p.name AS person, w.since AS since\nORDER BY since",
          allowWrites: false,
        }),
    },
  },
  {
    id: 'explore',
    title: 'Explore the graph',
    minutes: 5,
    card: 'card-explore',
    body: (
      <>
        <h4>See the shape of your data</h4>
        <p>Draw the graph and click <strong>Ada</strong>: you see her properties and every relationship.</p>
        <p>
          Then load <strong>Cyber Attack Paths</strong> or <strong>Fraud Ring</strong> and draw those:
          the pattern you are looking for is often visible before you write any Cypher.
        </p>
      </>
    ),
    action: { label: 'Try it: draw the graph', run: (s) => s.loadView() },
  },
  {
    id: 'write',
    title: 'Change the graph',
    minutes: 10,
    card: 'card-query',
    body: (
      <>
        <h4>Create, update, delete</h4>
        <p>
          Tick <strong>Allow changes</strong>, then add yourself to the social network. <code>MERGE</code>{' '}
          finds a pattern or creates it, so running it twice does not duplicate anything.
        </p>
        <pre>{`MATCH (orbit:Company {name: 'Orbit Labs'})
MERGE (me:Person {name: 'You'})
MERGE (me)-[:WORKS_AT {since: 2026}]->(orbit)`}</pre>
      </>
    ),
    action: {
      label: 'Try it: add yourself',
      run: (s) =>
        s.runQuery({
          cypher: "MATCH (orbit:Company {name: 'Orbit Labs'})\nMERGE (me:Person {name: 'You'})\nMERGE (me)-[:WORKS_AT {since: 2026}]->(orbit)\nRETURN me.name AS person, orbit.name AS company",
          allowWrites: true,
        }),
    },
  },
  {
    id: 'graphrag',
    title: 'GraphRAG (optional)',
    minutes: 10,
    card: 'card-graphrag',
    body: (
      <>
        <h4>Let an LLM build the graph</h4>
        <p>
          With a free Groq key, FalkorDB's GraphRAG-SDK reads a short incident report, extracts
          people, systems and events into a graph, and answers questions from it.
        </p>
        <ol>
          <li>Click <strong>Load sample report</strong>, then <strong>Build graph from text</strong>.</li>
          <li>Ask one of the suggested questions.</li>
          <li>Type <code>graphrag_demo</code> as the graph in card 1 and draw it.</li>
        </ol>
      </>
    ),
    action: { label: 'Try it: load the report', run: (s) => s.loadRagSample() },
  },
  {
    id: 'your-use-case',
    title: 'Build your own use case',
    minutes: 15,
    card: null,
    body: (
      <>
        <h4>Make it yours, then open a PR</h4>
        <ol>
          <li>Fork the repo and clone your fork.</li>
          <li>Copy <code>usecases/_template</code> to <code>usecases/&lt;your-github-handle&gt;</code>.</li>
          <li>Write your own graph in <code>seed.cypher</code> (nothing private).</li>
          <li>Add three questions with their Cypher to <code>run.py</code> and run it.</li>
          <li>Fill in your <code>README.md</code> and open a pull request (see CONTRIBUTING.md).</li>
        </ol>
      </>
    ),
    action: { label: 'Mark as done', run: () => true },
  },
]
