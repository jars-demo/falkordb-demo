// All app state and every action in one hook, so the cards and the workshop panel share it.

import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.ts'
import type { QueryResponse, RagSample, Sample, Status, ViewResponse } from '../api/types.ts'
import { BUNDLED_SAMPLES, IS_STATIC_SITE } from '../site.ts'

export type LogKind = 'call' | 'ok' | 'err'
export interface LogLine {
  id: number
  time: string
  kind: LogKind
  text: string
}

export type StepId = 'setup' | 'load' | 'query' | 'explore' | 'write' | 'graphrag' | 'your-use-case'

// The sample the workshop starts with. Every folder in data/ is a sample graph of the same name.
export const DEFAULT_SAMPLE = 'social_network'

let nextLogId = 0

export function useGraph(onStepDone: (id: StepId) => void) {
  const [status, setStatus] = useState<Status | null>(null)
  const [statusError, setStatusError] = useState(false)
  const [samples, setSamples] = useState<Sample[]>([])
  const [sampleName, setSampleName] = useState(DEFAULT_SAMPLE)
  const [graph, setGraph] = useState(DEFAULT_SAMPLE)
  const [cypher, setCypher] = useState('MATCH (n) RETURN n LIMIT 10')
  const [allowWrites, setAllowWrites] = useState(false)
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [view, setView] = useState<ViewResponse | null>(null)
  const [rag, setRag] = useState<RagSample | null>(null)
  const [ragText, setRagText] = useState('')
  const [ragQuestion, setRagQuestion] = useState('')
  const [ragAnswer, setRagAnswer] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<Record<string, string>>({})
  const [log, setLog] = useState<LogLine[]>([])

  const write = useCallback((kind: LogKind, line: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false })
    setLog((lines) => [...lines.slice(-199), { id: nextLogId++, time, kind, text: line }])
  }, [])

  const say = (card: string, message: string) => setNotice((n) => ({ ...n, [card]: message }))

  useEffect(() => {
    // The static (Vercel) site has no backend: list the samples bundled at build time.
    if (IS_STATIC_SITE) return setSamples(BUNDLED_SAMPLES)
    api.status().then(setStatus).catch(() => setStatusError(true))
    api
      .samples()
      .then((list) => setSamples(list.samples))
      .catch(() => setSamples(BUNDLED_SAMPLES))
  }, [])

  async function guarded<T>(name: string, task: () => Promise<T>): Promise<T | undefined> {
    setBusy(name)
    say(name, '')
    try {
      return await task()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      write('err', `✗ ${name} failed: ${message}`)
      say(name, message)
      return undefined
    } finally {
      setBusy(null)
    }
  }

  // Questions (with Cypher) for the graph that is selected now.
  const suggestions = samples.find((s) => s.graph === graph)?.questions ?? []

  const loadSample = async (name: string = sampleName) => {
    write('call', `→ load data/${name}/seed.cypher into graph "${name}"`)
    const loaded = await guarded('load', () => api.loadSample(name))
    if (!loaded) return
    setSampleName(name)
    setGraph(name)
    setResult(null)
    setView(null)
    say('load', `Graph “${name}” is ready: ${loaded.nodes_created} nodes, ${loaded.relationships_created} relationships.`)
    write('ok', `✓ ${loaded.nodes_created} nodes, ${loaded.relationships_created} relationships created`)
    onStepDone('load')
  }

  const runQuery = async (override?: { cypher: string; allowWrites?: boolean }) => {
    const text = override?.cypher ?? cypher
    const writes = override?.allowWrites ?? allowWrites
    if (override) {
      setCypher(text)
      setAllowWrites(writes)
    }
    if (!text.trim()) return
    write('call', `→ ${writes ? 'query' : 'ro_query'} on "${graph}"`)
    const response = await guarded('query', () => api.query(graph, text, writes))
    if (!response) return setResult(null)
    setResult(response)
    const changed = response.stats.nodes_created + response.stats.relationships_created + response.stats.properties_set
    write('ok', `✓ ${response.rows.length} row(s) in ${response.stats.run_time_ms} ms${changed ? ` · ${changed} change(s)` : ''}`)
    onStepDone(changed || response.stats.nodes_deleted || response.stats.relationships_deleted ? 'write' : 'query')
  }

  const loadView = async () => {
    write('call', `→ draw graph "${graph}"`)
    const response = await guarded('view', () => api.view(graph))
    if (!response) return
    setView(response)
    say('view', `${response.nodes.length} nodes, ${response.edges.length} relationships`)
    write('ok', `✓ ${response.nodes.length} nodes · ${response.seconds}s`)
    if (response.nodes.length) onStepDone('explore')
  }

  const deleteGraph = async () => {
    if (!window.confirm(`Delete the graph “${graph}”? You can load the sample again afterwards.`)) return
    write('call', `→ select_graph("${graph}").delete()`)
    const response = await guarded('delete', () => api.deleteGraph(graph))
    if (!response) return
    setView(null)
    setResult(null)
    say('delete', `Graph “${graph}” was deleted. Load the sample again to bring it back.`)
    write('ok', `✓ deleted "${graph}"`)
  }

  const loadRagSample = async () => {
    const sample = await guarded('graphrag', () => api.ragSample())
    if (!sample) return
    setRag(sample)
    setRagText(sample.text)
    setRagQuestion(sample.questions[0] ?? '')
    write('call', `Loaded the ${sample.title.toLowerCase()} for GraphRAG.`)
  }

  const ingest = async () => {
    if (!ragText.trim()) return say('graphrag', 'Load the sample report or paste some text first.')
    say('graphrag', 'An LLM is reading the text and building the graph. This takes a minute or two.')
    write('call', '→ rag.ingest(text=…) + rag.finalize()')
    const response = await guarded('graphrag', () => api.ragIngest(ragText))
    if (!response) return
    say('graphrag', `Built graph “${response.graph}”: ${response.nodes_created} nodes, ${response.relationships_created} relationships.`)
    write('ok', `✓ ${response.nodes_created} nodes · ${response.seconds}s`)
  }

  const ask = async (question: string = ragQuestion) => {
    if (!question.trim()) return
    setRagQuestion(question)
    write('call', `→ rag.completion("${question}")`)
    const response = await guarded('graphrag', () => api.ragAsk(question))
    if (!response) return setRagAnswer(null)
    setRagAnswer(response.answer)
    write('ok', `✓ answered in ${response.seconds}s`)
    onStepDone('graphrag')
  }

  return {
    status, statusError, samples, sampleName, setSampleName, graph, setGraph, cypher, setCypher,
    allowWrites, setAllowWrites, result, view, suggestions, rag, ragText, setRagText,
    ragQuestion, setRagQuestion, ragAnswer, busy, notice, log,
    loadSample, runQuery, loadView, deleteGraph, loadRagSample, ingest, ask,
  }
}

export type GraphState = ReturnType<typeof useGraph>
