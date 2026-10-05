"""The FastAPI app: the API under /api, plus the built frontend when it exists.

In Docker, nginx serves the frontend and forwards /api here. Locally, run the Vite dev server
(`npm run dev`), or build once (`npm run build`) and this app serves it too.
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.backend.api.routes import graphrag as graphrag_routes
from app.backend.api.routes import graphs as graph_routes
from app.backend.api.routes import system as system_routes
from app.backend.core import config


def create_app() -> FastAPI:
    app = FastAPI(title="falkordb-demo API")
    app.include_router(system_routes.router)
    app.include_router(graph_routes.router)
    app.include_router(graphrag_routes.router)
    if config.FRONTEND_DIST.is_dir():
        app.mount("/", StaticFiles(directory=config.FRONTEND_DIST, html=True), name="frontend")
    return app


app = create_app()
