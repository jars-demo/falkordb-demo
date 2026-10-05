# 00 · Prerequisites

Do this **before** the workshop: about 5 minutes, mostly downloads.

## 1. Tools

| Tool | Needed for | Get it |
|---|---|---|
| Docker Desktop | Running the stack (recommended) | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| Git | Cloning and your pull request | [git-scm.com](https://git-scm.com/downloads) |
| GitHub account | Step 7 | [github.com/signup](https://github.com/signup) |
| Python 3.10–3.13 + [uv](https://docs.astral.sh/uv/getting-started/installation/), Node 22.12+ | Only for developing, or FalkorDB Cloud (also a C++ compiler, see [troubleshooting](./troubleshooting.md)) | [python.org](https://www.python.org/downloads/), [nodejs.org](https://nodejs.org/) |

## 2. Choose how to run FalkorDB

| Option | Account needed | Where FalkorDB runs |
|---|---|---|
| **1 · Docker** (default) | None | In the `falkordb` container on your machine |
| **2 · Develop** | None | In Docker; you run the app code locally |
| **3 · FalkorDB Cloud** | A [FalkorDB Cloud](https://app.falkordb.cloud) instance | In the cloud |

Steps 1–5 need no API key. Step 6 (GraphRAG) needs a free [Groq](https://console.groq.com/keys) key.

## 3. Start it

```bash
git clone https://github.com/<you>/falkordb-demo.git && cd falkordb-demo   # your fork, see step 7
docker compose up -d --build
```

Or run `python scripts/setup.py` to be guided through any option (and to add a Groq key).

Open <http://localhost:3200/#/workshop>. FalkorDB's own browser UI runs at <http://localhost:3201>.

Stuck? See [Troubleshooting](./troubleshooting.md).

Next: [01 · Meet FalkorDB](./01-meet-falkordb.md)
