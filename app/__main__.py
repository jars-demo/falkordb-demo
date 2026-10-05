"""Start the app:  uv run python -m app   (add --port 8010 to change the port)."""

import argparse

import uvicorn


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the falkordb-demo app.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8200)
    parser.add_argument("--reload", action="store_true", help="Restart on code changes.")
    args = parser.parse_args()
    print(f"falkordb-demo running at http://{args.host}:{args.port}/#/workshop")
    uvicorn.run("app.backend.main:app", host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    main()
