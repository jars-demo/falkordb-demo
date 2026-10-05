# Contributing

Thanks for taking part! You can contribute in two ways.

## 1. Add your use case

This is the workshop's final step. Full walkthrough: [workshop step 7](workshop/07-your-use-case.md).

**In short:** fork → copy `usecases/_template` to `usecases/<your-github-handle>/` → write your
graph in `seed.cypher` and your questions in `run.py` → run it → open a pull request.

Before you open the PR, check:

- [ ] Only `usecases/<your-github-handle>/` changed, plus one new row in `usecases/README.md`
- [ ] Your graph is yours to share: **nothing personal, private or confidential, no keys**
- [ ] `run.py` works: `docker compose exec backend python usecases/<your-github-handle>/run.py`
- [ ] Your `README.md` says what you modelled, your questions, and what came back
- [ ] No `.env` in the commit
- [ ] PR title: `feat(usecases): Add <short title> use case`

## 2. Improve the workshop

Fixes, clearer steps and better sample graphs are welcome. For anything bigger than a small fix,
open an issue first so we can agree on the approach.

**Run it for development** (FalkorDB in Docker, your code local with hot reload):

```bash
docker compose up -d falkordb
uv sync && uv run python -m app --reload            # backend  → :8200
cd app/frontend && npm install && npm run dev       # frontend → :5273
```

**Check before you push:**

```bash
uv run pytest && uv run ruff check . && uv run ruff format --check .
cd app/frontend && npm run lint && npm run build
```

**Keep it simple:**

- Every FalkorDB call goes in `app/backend/services/graph.py`; routes stay thin.
- Test every Cypher statement you add against a real FalkorDB (`docker compose up -d falkordb`).
- A change to the app flow also updates `workshop/*.md` and `app/frontend/src/workshop/steps.tsx`.
- New Python dependency? Pin it in `pyproject.toml`, then regenerate `requirements.txt` (the
  command is at the top of that file). New npm package? Pin the exact version.

## Commit messages

```text
type(scope): Short imperative summary
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`. Example: `docs(workshop): Clarify MERGE`.

## Be kind

Many attendees are new to graphs. Be patient, assume good intent, and give constructive feedback.
