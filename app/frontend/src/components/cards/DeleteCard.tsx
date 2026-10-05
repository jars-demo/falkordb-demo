import type { GraphState } from '../../hooks/useGraph.ts'
import { Button, Card } from '../Card.tsx'

export function DeleteCard({ state, highlight }: { state: GraphState; highlight: boolean }) {
  return (
    <Card
      id="card-delete"
      num="5"
      title="Delete the graph"
      highlight={highlight}
      lede={<>Remove the selected graph with <code>graph.delete()</code>. Load the sample again to bring it back.</>}
    >
      <div className="row">
        <Button variant="danger" busy={state.busy === 'delete'} busyLabel="Deleting…" onClick={state.deleteGraph}>
          Delete “{state.graph}”
        </Button>
      </div>
      {state.notice.delete && <div className="hint" style={{ marginTop: 12 }}>{state.notice.delete}</div>}
    </Card>
  )
}
