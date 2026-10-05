// The landing page: what FalkorDB is, how graph thinking works, the samples, and how to start.

import { CommandBlock } from '../components/CommandBlock.tsx'
import type { GraphState } from '../hooks/useGraph.ts'
import { REPO_URL } from '../site.ts'

const FEATURES = [
  {
    tag: 'CREATE',
    title: 'Model',
    text: 'Store data as nodes and relationships, each with a label and properties. The shape of the graph is the shape of your domain.',
  },
  {
    tag: 'MATCH',
    title: 'Query',
    text: 'Ask with Cypher patterns: who knows whom, which paths reach a server, which customers share a phone. Multi-hop questions stay short.',
  },
  {
    tag: 'GraphRAG',
    title: 'Ground LLMs',
    text: "Let an LLM build a graph from text with FalkorDB's GraphRAG-SDK, then answer questions from the facts and links in it.",
  },
]

const PIPELINE = ['Your data', 'Nodes', 'Relationships', 'Cypher patterns', 'Answers']

export function HomePage({ state }: { state: GraphState }) {
  return (
    <main className="page">
      <section className="landing-hero">
        <div className="row">
          <span className="pill">Hands-on workshop · 30–60 minutes</span>
          <a className="pill powered" href="https://github.com/FalkorDB/FalkorDB" target="_blank" rel="noreferrer">
            <img className="logo-light" src="/falkordb/falkordb-logo.svg" alt="FalkorDB" />
            <img className="logo-dark" src="/falkordb/falkordb-logo-white.svg" alt="FalkorDB" /> on GitHub
          </a>
        </div>
        <h1>Think in graphs with FalkorDB</h1>
        <p>
          FalkorDB is a fast, open-source graph database. In this workshop you load real-looking
          graphs, query them with Cypher, find attack paths and fraud rings, and try GraphRAG.
        </p>
        <div className="row">
          <a className="btn" href="#/workshop">Start the workshop</a>
          <a className="btn ghost" href="#/concepts">Learn the concepts →</a>
        </div>
      </section>

      <section className="section">
        <div className="pipeline" aria-label="How graph thinking works">
          {PIPELINE.map((stage, index) => (
            <div className="pipeline-stage" key={stage}>
              <span className="pipeline-index">{String(index + 1).padStart(2, '0')}</span>
              {stage}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Model, query, ground</h2>
        <div className="tiles">
          {FEATURES.map((feature) => (
            <div className="tile" key={feature.title}>
              <code className="tile-call">{feature.tag}</code>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Sample graphs</h2>
        <p className="section-lede">
          Three small, fictional graphs ship with the workshop, one folder each in <code>data/</code>.
        </p>
        <div className="tiles">
          {state.samples.map((sample) => (
            <a className="tile link" key={sample.graph} href="#/workshop" onClick={() => state.setSampleName(sample.graph)}>
              <code className="tile-call">{sample.graph}</code>
              <h3>{sample.title}</h3>
              <p>{sample.description}</p>
              <p className="tile-question">“{sample.questions[0]?.question}”</p>
            </a>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Get started in three steps</h2>
        <p className="section-lede">
          You need <a href="https://docs.docker.com/get-docker/" target="_blank" rel="noreferrer">Docker Desktop</a>{' '}
          and Git. No account and no API key.
        </p>
        <div className="start">
          <div className="start-main">
            <CommandBlock
              lines={[
                '# 1. Get the code',
                `git clone ${REPO_URL}.git`,
                'cd falkordb-demo',
                '',
                '# 2. Start FalkorDB, the backend and the app',
                'docker compose up -d --build',
                '',
                '# 3. Open http://localhost:3200/#/workshop',
              ]}
            />
            <p className="hint">FalkorDB's own browser UI also runs, at http://localhost:3201.</p>
          </div>
          <div className="start-side">
            <div className="tile">
              <h3>Prefer a guided setup?</h3>
              <p>Add a free Groq key for GraphRAG, use FalkorDB Cloud, or run without Docker.</p>
              <CommandBlock title="Guided setup" lines={['python scripts/setup.py']} />
            </div>
            <a className="tile link" href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
              <h3>Share your use case</h3>
              <p>The workshop ends with your own graph in <code>usecases/</code> and a pull request.</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
