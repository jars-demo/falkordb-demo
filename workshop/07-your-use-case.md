# 07 · Build your own use case (15 min)

Now model something *you* know as a graph, and share it with a pull request.

## 1. Fork and branch

1. Click **Fork** on this repo's GitHub page, then clone your fork.
2. Create a branch:

   ```bash
   git checkout -b usecase/<your-github-handle>
   ```

## 2. Copy the template

```bash
cp -r usecases/_template usecases/<your-github-handle>
# Windows PowerShell: Copy-Item -Recurse usecases/_template usecases/<your-github-handle>
```

## 3. Write your graph

Replace `seed.cypher` with your own `CREATE` statements. Ideas: a sports league, your project's
services and their dependencies, a family tree, a book series and its characters. **Only use data
you are allowed to share: nothing personal, private or confidential.**

Start small: 10–30 nodes, two or three labels, three or four relationship types.

## 4. Write your questions and run

Edit `QUESTIONS` in `run.py`: each entry is a question and the Cypher that answers it. Include one
that needs two or more hops. Then:

```bash
docker compose exec backend python usecases/<your-github-handle>/run.py   # Docker
uv run python usecases/<your-github-handle>/run.py                        # running locally
```

`run.py` loads your graph as `usecase_<your_github_handle>` (dashes become underscores). Type that
name as the graph in the app and draw it.

## 5. Write it up and open a pull request

Fill in your `README.md`, add a row to [`usecases/README.md`](../usecases/README.md), then:

```bash
git add usecases/<your-github-handle> usecases/README.md
git commit -m "feat(usecases): Add <short title> use case"
git push -u origin usecase/<your-github-handle>
```

Open a pull request to this repo's `main`. The checklist is in [CONTRIBUTING.md](../CONTRIBUTING.md).
See [`usecases/jishanahmed-shaikh`](../usecases/jishanahmed-shaikh) for a finished example.

## Going further

- Try [FalkorDB Cloud](https://app.falkordb.cloud): `python scripts/setup.py`, option 3.
- Read the [FalkorDB docs](https://docs.falkordb.com/) and the [Cypher reference](https://docs.falkordb.com/cypher/).
- Look at [QueryWeaver](https://github.com/FalkorDB/QueryWeaver), FalkorDB's text-to-SQL tool.
