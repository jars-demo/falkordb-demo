// Compact header for the workshop page.

export function Hero() {
  return (
    <section className="hero">
      <div>
        <h1>Workshop</h1>
        <p>
          Load a sample graph, query it with Cypher, draw it, change it, and try GraphRAG. The guide on
          the left walks you through it.
        </p>
      </div>
      <div className="flow" aria-label="Workshop flow">
        <span className="step">load</span>→<span className="step">query</span>→
        <span className="step">explore</span>→<span className="step">GraphRAG</span>
      </div>
    </section>
  )
}
