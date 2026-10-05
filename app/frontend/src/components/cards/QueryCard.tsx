import type { GraphState } from '../../hooks/useGraph.ts'
import { Button, Card } from '../Card.tsx'

// Render one result cell: nodes, relationships and paths get a readable short form.
function cell(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return `[${value.map(cell).join(', ')}]`
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>
    if (v.node) {
      const n = v.node as { type: string; label: string }
      return `(:${n.type} ${n.label})`
    }
    if (v.edge) return `[:${(v.edge as { label: string }).label}]`
    if (v.path) return (v.path as string[]).join(' → ')
    return JSON.stringify(value)
  }
  return String(value)
}

export function QueryCard({ state, highlight }: { state: GraphState; highlight: boolean }) {
  const r = state.result
  const changes = r
    ? Object.entries(r.stats).filter(([key, value]) => key !== 'run_time_ms' && value)
    : []
  return (
    <Card
      id="card-query"
      num="2"
      title="Query with Cypher"
      wide
      highlight={highlight}
      lede={
        <>
          Cypher describes patterns: <code>(node)-[:RELATIONSHIP]-&gt;(node)</code>. Queries run
          read-only with <code>ro_query()</code>; tick “Allow changes” to <code>CREATE</code>,{' '}
          <code>SET</code> or <code>DELETE</code>.
        </>
      }
    >
      <div className="stack">
        {state.suggestions.length > 0 && (
          <div className="chips">
            <span className="hint">Try:</span>
            {state.suggestions.map((q) => (
              <button key={q.question} type="button" className="chip" onClick={() => state.setCypher(q.cypher)}>
                {q.question}
              </button>
            ))}
          </div>
        )}
        <textarea
          aria-label="Cypher query"
          className="cypher"
          value={state.cypher}
          onChange={(e) => state.setCypher(e.target.value)}
          onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && state.runQuery()}
          spellCheck={false}
        />
        <div className="row">
          <Button variant="primary" busy={state.busy === 'query'} busyLabel="Running…" onClick={() => state.runQuery()}>
            Run query
          </Button>
          <label className="checkbox">
            <input type="checkbox" checked={state.allowWrites} onChange={(e) => state.setAllowWrites(e.target.checked)} />
            Allow changes
          </label>
          <span className="hint">Ctrl + Enter runs the query</span>
        </div>

        {state.notice.query && <div className="result error">{state.notice.query}</div>}

        {r && (
          <div className="table-wrap">
            <div className="hint" style={{ marginBottom: 8 }}>
              {r.rows.length} row(s) · {r.stats.run_time_ms} ms
              {changes.length > 0 && ` · ${changes.map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ')}`}
              {r.truncated && ' · showing the first 500 rows'}
            </div>
            {r.columns.length > 0 && (
              <table className="results-table">
                <thead>
                  <tr>{r.columns.map((c) => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {r.rows.map((row, i) => (
                    <tr key={i}>{row.map((value, j) => <td key={j}>{cell(value)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
