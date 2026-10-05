// Shapes returned by the backend (app/backend/api/routes/).

export interface Status {
  label: string
  detail: string
  connected: boolean
  llm_available: boolean
  falkordb_client_version: string
}

export interface SampleQuestion {
  question: string
  cypher: string
}

export interface Sample {
  graph: string
  title: string
  description: string
  questions: SampleQuestion[]
}

export interface CallInfo {
  call: string
  seconds: number
}

export interface LoadResponse {
  call: string
  graph: string
  nodes_created: number
  relationships_created: number
}

export interface GraphNode {
  id: string
  label: string
  type: string
  properties: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  properties: Record<string, unknown>
}

export interface QueryStats {
  nodes_created: number
  nodes_deleted: number
  relationships_created: number
  relationships_deleted: number
  properties_set: number
  run_time_ms: number
}

export interface QueryResponse extends CallInfo {
  columns: string[]
  rows: unknown[][]
  truncated: boolean
  stats: QueryStats
}

export interface ViewResponse extends CallInfo {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface RagSample {
  title: string
  description: string
  questions: string[]
  text: string
  graph: string
}

export interface IngestResponse extends CallInfo {
  graph: string
  nodes_created: number
  relationships_created: number
}

export interface AskResponse extends CallInfo {
  answer: string
}
