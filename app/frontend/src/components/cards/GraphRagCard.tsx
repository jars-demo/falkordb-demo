import type { GraphState } from '../../hooks/useGraph.ts'
import { Button, Card } from '../Card.tsx'

export function GraphRagCard({ state, highlight }: { state: GraphState; highlight: boolean }) {
  const noKey = state.status?.llm_available === false
  return (
    <Card
      id="card-graphrag"
      num="4"
      title="GraphRAG (optional)"
      highlight={highlight}
      lede={
        <>
          With FalkorDB's GraphRAG-SDK, an LLM reads text, builds a knowledge graph in FalkorDB, and
          answers questions from it. Needs a free Groq key.
        </>
      }
    >
      <div className="stack">
        {noKey && (
          <div className="callout">
            No LLM key yet. Run <code>python scripts/setup.py</code> and add a free key from{' '}
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com</a>.
          </div>
        )}
        <div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <label className="field" htmlFor="rag-text">Text</label>
            <button type="button" className="chip" onClick={state.loadRagSample}>Load sample report</button>
          </div>
          <textarea
            id="rag-text"
            value={state.ragText}
            onChange={(e) => state.setRagText(e.target.value)}
            placeholder="Paste a few paragraphs, or load the sample incident report…"
          />
        </div>
        <Button variant="primary" busy={state.busy === 'graphrag'} busyLabel="Working…" onClick={state.ingest} disabled={noKey}>
          Build graph from text
        </Button>
        <div>
          <label className="field" htmlFor="rag-question">Question</label>
          <input
            id="rag-question"
            type="text"
            value={state.ragQuestion}
            onChange={(e) => state.setRagQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && state.ask()}
            placeholder="Who led the response to the incident?"
          />
          {state.rag && (
            <div className="chips">
              {state.rag.questions.map((q) => (
                <button key={q} type="button" className="chip" onClick={() => state.ask(q)}>{q}</button>
              ))}
            </div>
          )}
        </div>
        <Button busy={state.busy === 'graphrag'} busyLabel="Thinking…" onClick={() => state.ask()} disabled={noKey}>
          Ask
        </Button>
        {state.notice.graphrag && <div className="hint">{state.notice.graphrag}</div>}
        {state.ragAnswer && <div className="result">{state.ragAnswer}</div>}
      </div>
    </Card>
  )
}
