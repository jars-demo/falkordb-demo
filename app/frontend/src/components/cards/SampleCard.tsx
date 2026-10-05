import type { GraphState } from '../../hooks/useGraph.ts'
import { Button, Card } from '../Card.tsx'

export function SampleCard({ state, highlight }: { state: GraphState; highlight: boolean }) {
  const selected = state.samples.find((s) => s.graph === state.sampleName)
  return (
    <Card
      id="card-load"
      num="1"
      title="Load a sample graph"
      highlight={highlight}
      lede={
        <>
          Each sample is a Cypher script in <code>data/</code>. Loading it runs the script with{' '}
          <code>graph.query()</code> and creates a graph of the same name in FalkorDB.
        </>
      }
    >
      <div className="stack">
        <div>
          <label className="field" htmlFor="sample">Sample dataset</label>
          <div className="row">
            <select
              id="sample"
              className="grow"
              value={state.sampleName}
              onChange={(e) => state.setSampleName(e.target.value)}
            >
              {state.samples.map((s) => (
                <option key={s.graph} value={s.graph}>
                  {s.title}
                </option>
              ))}
            </select>
            <Button variant="primary" busy={state.busy === 'load'} busyLabel="Loading…" onClick={() => state.loadSample()}>
              Load sample
            </Button>
          </div>
          {selected && <div className="hint" style={{ marginTop: 6 }}>{selected.description}</div>}
        </div>
        <div>
          <label className="field" htmlFor="graph-name">Graph</label>
          <input id="graph-name" type="text" value={state.graph} onChange={(e) => state.setGraph(e.target.value)} />
          <div className="hint" style={{ marginTop: 6 }}>Query, Explore and Delete all use this graph.</div>
        </div>
        {state.notice.load && <div className="hint">{state.notice.load}</div>}
      </div>
    </Card>
  )
}
