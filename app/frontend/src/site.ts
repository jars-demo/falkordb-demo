// Build flavours. `npm run build` makes the full app, which talks to the backend.
// `npm run build:static` (used by Vercel) makes a static site with no backend: Home and Concepts
// work as usual, and the Workshop page explains how to run the live version locally.

import type { Sample } from './api/types.ts'

export const IS_STATIC_SITE = import.meta.env.MODE === 'static'

export const REPO_URL = 'https://github.com/jars-demo/falkordb-demo'

// Sample summaries, read from data/*/about.json at build time so the static site can list them.
// Only folders with a seed.cypher are graph samples (data/graphrag/ holds the GraphRAG text).
const ABOUT_FILES = import.meta.glob<Omit<Sample, 'graph'>>('../../../data/*/about.json', {
  eager: true,
  import: 'default',
})
const SEED_FILES = import.meta.glob('../../../data/*/seed.cypher', { query: '?raw', import: 'default' })

const folderOf = (path: string) => path.split('/').at(-2) ?? ''
const seeded = new Set(Object.keys(SEED_FILES).map(folderOf))

export const BUNDLED_SAMPLES: Sample[] = Object.entries(ABOUT_FILES)
  .filter(([path]) => seeded.has(folderOf(path)))
  .map(([path, about]) => ({
    graph: folderOf(path),
    title: about.title,
    description: about.description,
    questions: about.questions,
  }))
  .sort((a, b) => a.graph.localeCompare(b.graph))
