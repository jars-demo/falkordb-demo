// A small, hand-placed property graph from the Social Network sample: nodes with labels and
// properties, relationships with a type and a direction. Static on purpose: it explains the idea
// without needing a backend (also on the Vercel site).

interface DiagramNode {
  id: string
  label: string
  props: string
  x: number
  y: number
  color: string
  /** Put the properties above the circle (when an arrow arrives from below). */
  above?: boolean
}

const PERSON = '#6366f1'
const COMPANY = '#0ea5e9'
const CITY = '#10b981'

const NODES: DiagramNode[] = [
  { id: 'ada', label: ':Person', props: "name: 'Ada'", x: 325, y: 85, color: PERSON, above: true },
  { id: 'pune', label: ':City', props: "name: 'Pune'", x: 95, y: 215, color: CITY },
  { id: 'orbit', label: ':Company', props: "name: 'Orbit Labs'", x: 555, y: 215, color: COMPANY },
  { id: 'cara', label: ':Person', props: "name: 'Cara'", x: 325, y: 320, color: PERSON },
]

// t: where along the edge its label sits (0 = source, 1 = target); default halfway.
const EDGES: { from: string; to: string; label: string; t?: number }[] = [
  { from: 'ada', to: 'orbit', label: ':WORKS_AT {since: 2019}' },
  { from: 'cara', to: 'orbit', label: ':WORKS_AT' },
  { from: 'ada', to: 'pune', label: ':LIVES_IN' },
  { from: 'cara', to: 'ada', label: ':MANAGES', t: 0.45 },
]

const byId = new Map(NODES.map((node) => [node.id, node]))
const R = 32

export function GraphDiagram() {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 650 395" role="img" aria-labelledby="diagram-title">
        <title id="diagram-title">
          A property graph: Ada and Cara are Person nodes, Orbit Labs is a Company, Pune is a City. Ada
          works at Orbit Labs since 2019 and lives in Pune; Cara works at Orbit Labs and manages Ada.
        </title>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="diagram-arrow" />
          </marker>
        </defs>
        {EDGES.map((edge) => {
          const a = byId.get(edge.from)!
          const b = byId.get(edge.to)!
          // Stop the line at the circle's edge so the arrowhead stays visible.
          const dx = b.x - a.x
          const dy = b.y - a.y
          const length = Math.hypot(dx, dy)
          const x1 = a.x + (dx / length) * R
          const y1 = a.y + (dy / length) * R
          const x2 = b.x - (dx / length) * (R + 4)
          const y2 = b.y - (dy / length) * (R + 4)
          const t = edge.t ?? 0.5
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="diagram-edge" markerEnd="url(#arrow)" />
              <text x={a.x + dx * t} y={a.y + dy * t - 8} className="diagram-edge-label" textAnchor="middle">
                {edge.label}
              </text>
            </g>
          )
        })}
        {NODES.map((node) => (
          <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <circle r={R} fill={node.color} className="diagram-node" />
            <text y={5} textAnchor="middle" className="diagram-node-label">
              {node.label}
            </text>
            <text y={node.above ? -R - 10 : R + 18} textAnchor="middle" className="diagram-label">
              {`{${node.props}}`}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        <span><i className="dot" style={{ background: PERSON }} /> :Person</span>
        <span><i className="dot" style={{ background: COMPANY }} /> :Company</span>
        <span><i className="dot" style={{ background: CITY }} /> :City</span>
        <span>circles are nodes (label + properties) · arrows are relationships (type + direction)</span>
      </figcaption>
    </figure>
  )
}
