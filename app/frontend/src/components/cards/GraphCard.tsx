import cytoscape from 'cytoscape'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { GraphNode } from '../../api/types.ts'
import type { GraphState } from '../../hooks/useGraph.ts'
import { Button, Card } from '../Card.tsx'

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b', '#14b8a6']

interface Selected {
  node: GraphNode
  links: string[]
}

export function GraphCard({ state, highlight, dark }: { state: GraphState; highlight: boolean; dark: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Selected | null>(null)
  const view = state.view
  const types = useMemo(() => [...new Set(view?.nodes.map((n) => n.type) ?? [])].sort(), [view])
  const color = (type: string) => COLORS[types.indexOf(type) % COLORS.length]
  const ink = dark ? '#fafafa' : '#18181b'

  useEffect(() => {
    setSelected(null)
    if (!container.current || !view?.nodes.length) return
    const byId = new Map(view.nodes.map((n) => [n.id, n]))
    const cy = cytoscape({
      container: container.current,
      elements: [
        ...view.nodes.map((n) => ({ data: { id: n.id, label: n.label, type: n.type, color: color(n.type) } })),
        ...view.edges.map((e) => ({ data: { id: `e${e.id}`, source: e.source, target: e.target, label: e.label } })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)', 'border-width': 1.5, 'border-color': dark ? '#09090b' : '#ffffff',
            label: 'data(label)', color: ink, 'font-size': 10, 'font-family': 'Inter, sans-serif',
            'text-valign': 'bottom', 'text-margin-y': 4, width: 20, height: 20,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.2, 'line-color': `${ink}55`, 'target-arrow-color': `${ink}55`,
            'target-arrow-shape': 'triangle', 'arrow-scale': 0.8, 'curve-style': 'bezier',
            label: 'data(label)', 'font-size': 8, color: `${ink}aa`, 'text-rotation': 'autorotate',
          },
        },
        { selector: 'node:selected', style: { 'border-width': 4, 'border-color': '#4f46e5' } },
      ],
      layout: { name: 'cose', animate: false, nodeRepulsion: () => 9000, idealEdgeLength: () => 100 },
      wheelSensitivity: 0.2,
    })
    cy.on('tap', 'node', (event) => {
      const id = event.target.id() as string
      const links = view.edges
        .filter((e) => e.source === id || e.target === id)
        .slice(0, 12)
        .map((e) =>
          e.source === id
            ? `→ ${e.label} ${byId.get(e.target)?.label}`
            : `← ${e.label} ${byId.get(e.source)?.label}`,
        )
      setSelected({ node: byId.get(id)!, links })
    })
    return () => cy.destroy()
    // color depends on types, which depends on view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, ink])

  return (
    <Card
      id="card-explore"
      num="3"
      title="Explore the graph"
      wide
      highlight={highlight}
      lede="Every node and relationship in the graph. Colours are node labels. Drag nodes around, and click one to see its properties and connections."
    >
      <div className="row">
        <Button busy={state.busy === 'view'} busyLabel="Loading…" onClick={state.loadView}>Draw graph</Button>
        <span className="hint">{state.notice.view}</span>
      </div>
      <div id="graph" ref={container}>
        {view && !view.nodes.length && (
          <div className="empty" style={{ margin: 16 }}>The graph “{state.graph}” is empty or does not exist. Load a sample first.</div>
        )}
      </div>
      <div className="legend">
        {types.map((t) => (
          <span className="item" key={t}>
            <span className="swatch" style={{ background: color(t) }} />
            {t}
          </span>
        ))}
      </div>
      {selected && (
        <div className="results">
          <div className="result">
            <div className="meta"><span className="tag">:{selected.node.type}</span></div>
            <strong>{selected.node.label}</strong>
            {`\n${Object.entries(selected.node.properties).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}`}
            {selected.links.length > 0 && `\n\n${selected.links.join('\n')}`}
          </div>
        </div>
      )}
    </Card>
  )
}
