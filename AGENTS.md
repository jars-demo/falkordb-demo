# AGENTS.md

Guidance for AI coding agents and developers working in this repo.

## What this is

A workshop app for [FalkorDB](https://www.falkordb.com/), the open-source graph database. It
teaches graph modelling and Cypher with a FastAPI backend, a React + TypeScript + Vite frontend,
step-by-step docs, sample graphs, an optional GraphRAG step, and a `usecases/` folder attendees
contribute to. Attendees read the code as a reference, so prefer clear over clever.

## Map

```text
docker-compose.yml           falkordb/falkordb:v4.22.0 + backend + frontend
.env.example                 all settings; scripts/setup.py writes .env
pyproject.toml · uv.lock     Python deps (pinned); requirements.txt is the full pinned export

app/backend/
├── main.py                  FastAPI app factory
├── core/config.py           .env loading, paths, FalkorDB connection settings, LLM key
├── services/graph.py        EVERY FalkorDB call lives here
├── services/graphrag.py     GraphRAG-SDK: LiteLLM (Groq) + local fastembed embedder
├── services/samples.py      reads the sample graphs in data/
├── api/routes/              system.py · graphs.py · graphrag.py
├── api/schemas.py · errors.py
└── Dockerfile

app/frontend/src/
├── main.tsx · App.tsx       entry and app shell; router.ts = hash routes #/ #/concepts #/workshop
├── pages/                   HomePage, ConceptsPage, WorkshopPage, RunLocallyPage (static site)
├── components/cards/        SampleCard, QueryCard, GraphCard, GraphRagCard, DeleteCard, ActivityLog
├── components/layout/       TopBar, Hero, Footer, BackToTop
├── hooks/useGraph.ts        all state and actions
├── site.ts                  build flavour: full app, or static site (npm run build:static, Vercel)
├── api/                     typed API client
└── workshop/                workshop steps and panel

data/<graph>/                seed.cypher + about.json (questions with Cypher); folder = graph name
data/graphrag/               the GraphRAG sample text and questions (no seed.cypher)
scripts/                     setup.py (stdlib only) · check_setup.py (real end-to-end check)
usecases/                    _template/ and a worked example
workshop/                    chapters 00–07 + troubleshooting
tests/                       backend tests, FalkorDB layer faked
```

## Commands

```bash
docker compose up -d --build                     # whole stack → http://localhost:3200
docker compose up -d falkordb                    # FalkorDB only, for local development
uv run python -m app --reload                    # backend → :8200
cd app/frontend && npm run dev                   # frontend → :5273 (proxies /api to :8200)
uv run pytest && uv run ruff check . && uv run ruff format --check .
cd app/frontend && npm run lint && npm run build
uv run python scripts/check_setup.py             # real FalkorDB, end to end
```

## Rules

1. **All FalkorDB calls go in `services/graph.py`.** Routes only validate and time.
2. **Queries are read-only by default** (`ro_query`); writes need `allow_writes`.
3. **Test every Cypher statement against a real FalkorDB** before committing it. FalkorDB differs
   from other Cypher databases in places: `shortestPath` only works in `WITH` or `RETURN` and only
   directed, pattern predicates inside `all()` fail (collect the nodes first, then use `IN`), and
   `sum()` returns floats (use `count(CASE … END)` for whole numbers).
4. **The core workshop needs no key.** Only GraphRAG uses an LLM, and it fails with a clear 400
   when no key is set. Embeddings stay local (fastembed), because Groq has no embedding models.
5. **Sample folder = graph name.** Add samples as new folders in `data/` with a `seed.cypher` and
   an `about.json`; no code changes needed.
6. **Pins move together:** Python deps in `pyproject.toml` (regenerate `requirements.txt`), the
   `falkordb/falkordb` image tag in `docker-compose.yml`, exact versions in `package.json`.
7. **Docs follow the app:** flow changes update `workshop/*.md` and `src/workshop/steps.tsx`.
8. **Never commit** `.env`, `node_modules/`, `dist/` or keys.

## Style

Python 3.10+, ruff, line length 100, type hints on public functions. TypeScript strict, function
components and hooks, oxlint. Commits: `type(scope): Imperative summary`.
