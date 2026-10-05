"""The sample datasets in data/: one folder each, with seed.cypher and about.json."""

import json
import re
from pathlib import Path

from app.backend.core.config import SAMPLES_DIR

_NAME = re.compile(r"^[a-z0-9_]+$")


def list_samples() -> list[dict]:
    """Every sample, with its title, description and suggested questions (with Cypher)."""
    return [_summary(folder) for folder in _folders()]


def get_sample(name: str) -> dict | None:
    folder = SAMPLES_DIR / name
    if not _NAME.match(name) or folder not in _folders():
        return None
    return _summary(folder)


def seed_statements(name: str) -> list[str]:
    """The Cypher statements that build a sample graph, comments removed."""
    text = (SAMPLES_DIR / name / "seed.cypher").read_text(encoding="utf-8")
    code = "\n".join(line for line in text.splitlines() if not line.strip().startswith("//"))
    return [statement.strip() for statement in code.split(";") if statement.strip()]


def _folders() -> list[Path]:
    return sorted(
        path
        for path in SAMPLES_DIR.iterdir()
        if path.is_dir() and _NAME.match(path.name) and (path / "seed.cypher").is_file()
    )


def _summary(folder: Path) -> dict:
    about = json.loads((folder / "about.json").read_text(encoding="utf-8"))
    return {
        "graph": folder.name,
        "title": about.get("title", folder.name.replace("_", " ").title()),
        "description": about.get("description", ""),
        "questions": about.get("questions", []),
    }
