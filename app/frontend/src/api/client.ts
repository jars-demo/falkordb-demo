// Typed calls to the backend. Each function maps to one endpoint, and each endpoint to one
// FalkorDB call (see app/backend/services/graph.py).

import type {
  AskResponse,
  CallInfo,
  IngestResponse,
  LoadResponse,
  QueryResponse,
  RagSample,
  Sample,
  Status,
  ViewResponse,
} from './types.ts'

async function request<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const response = await fetch(path, {
    method: init?.method ?? 'GET',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = typeof payload.detail === 'string' ? payload.detail : JSON.stringify(payload.detail)
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return payload as T
}

const graphPath = (name: string) => `/api/graphs/${encodeURIComponent(name)}`

export const api = {
  status: () => request<Status>('/api/status'),

  samples: () => request<{ default: string; samples: Sample[] }>('/api/samples'),

  loadSample: (name: string) =>
    request<LoadResponse>(`/api/samples/${encodeURIComponent(name)}/load`, { method: 'POST' }),

  query: (graph: string, cypher: string, allowWrites: boolean) =>
    request<QueryResponse>('/api/query', {
      method: 'POST',
      body: { graph, cypher, allow_writes: allowWrites },
    }),

  view: (graph: string) => request<ViewResponse>(`${graphPath(graph)}/view`),

  deleteGraph: (graph: string) => request<CallInfo>(graphPath(graph), { method: 'DELETE' }),

  ragSample: () => request<RagSample>('/api/graphrag/sample'),

  ragIngest: (text: string) =>
    request<IngestResponse>('/api/graphrag/ingest', { method: 'POST', body: { text } }),

  ragAsk: (question: string) =>
    request<AskResponse>('/api/graphrag/ask', { method: 'POST', body: { question } }),
}
