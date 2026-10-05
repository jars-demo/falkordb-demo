# 06 · GraphRAG (optional, 10 min)

So far you wrote the graph yourself. With **GraphRAG**, an LLM builds it from text, and then
answers questions from the facts and links in the graph.

## Add a free Groq key

1. Create a key at [console.groq.com/keys](https://console.groq.com/keys).
2. Run `python scripts/setup.py`, pick your option again and paste the key when asked.
3. Restart: `docker compose up -d` (Docker), or restart the backend if it runs locally.

## Do it

In card **4 · GraphRAG**:

1. Click **Load sample report**: a short, fictional incident report about the attack on
   `web-01` from the Cyber Attack Paths sample.
2. Click **Build graph from text**. The LLM extracts people, servers, vulnerabilities and events.
3. Ask the suggested questions, such as "Who led the response to the incident?".
4. Type `graphrag_demo` as the graph in card 1 and draw it: this is the graph the LLM built.

## What just happened

The app uses FalkorDB's [GraphRAG-SDK](https://github.com/FalkorDB/GraphRAG-SDK):

```python
async with GraphRAG(
    connection=ConnectionConfig(host="localhost", graph_name="graphrag_demo"),
    llm=LiteLLM(model="groq/openai/gpt-oss-120b"),
    embedder=embedder,
    embedding_dimension=384,
) as rag:
    await rag.ingest(text=report)
    await rag.finalize()
    answer = await rag.completion("Who led the response to the incident?")
```

Groq has no embedding models, so the embedder is a small local model (fastembed, about 70 MB,
downloaded once). See [`app/backend/services/graphrag.py`](../app/backend/services/graphrag.py).

> Groq's free tier limits tokens per minute. If building the graph fails with a rate limit, wait a
> minute and try again.

Next: [07 · Build your own use case](./07-your-use-case.md)
