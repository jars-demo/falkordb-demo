"""One-step setup for falkordb-demo.

    python scripts/setup.py

Asks how you want to run the demo, writes .env, installs what that option needs and starts it.
Standard library only, so it runs before anything is installed. Press Enter to accept defaults.

Options:
    docker  Everything in Docker: FalkorDB + backend + frontend (default, needs only Docker)
    dev     FalkorDB in Docker, backend + frontend run locally with hot reload (for code changes)
    cloud   Backend + frontend locally, the database in FalkorDB Cloud

Non-interactive:  python scripts/setup.py --mode docker --yes
                  (add --groq-key gsk_... to turn on GraphRAG)
"""

import argparse
import getpass
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "app" / "frontend"
ENV_FILE = ROOT / ".env"
VENV_PYTHON = ROOT / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
GROQ_MODEL = "groq/openai/gpt-oss-120b"

MODES = {
    "docker": "Everything in Docker: FalkorDB + backend + frontend (recommended, only Docker)",
    "dev": "Develop: FalkorDB in Docker, backend + frontend locally with hot reload",
    "cloud": "FalkorDB Cloud: the database in the cloud, backend + frontend locally",
}


# ---------- helpers ----------


def title(text: str) -> None:
    print(f"\n\033[1m{text}\033[0m")


def info(text: str) -> None:
    print(f"  {text}")


def fail(text: str) -> None:
    print(f"\n  \033[31mx {text}\033[0m")
    sys.exit(1)


def ask(question: str, default: str = "", secret: bool = False) -> str:
    prompt = f"  {question}{f' [{default}]' if default and not secret else ''}: "
    answer = getpass.getpass(prompt) if secret else input(prompt)
    return answer.strip() or default


def confirm(question: str, default: bool, assume_yes: bool) -> bool:
    if assume_yes:
        return default
    answer = ask(f"{question} ({'Y/n' if default else 'y/N'})").lower()
    return default if not answer else answer.startswith("y")


def run(command: list[str], cwd: Path = ROOT) -> None:
    info("$ " + " ".join(command))
    if subprocess.call(command, cwd=cwd, shell=os.name == "nt" and command[0] == "npm") != 0:
        fail(f"Command failed: {' '.join(command)}")


def require(tool: str, url: str) -> None:
    if not shutil.which(tool):
        fail(f"{tool} is not installed. Get it here: {url}")


def wait_for(url: str, what: str, minutes: int = 10) -> None:
    info(f"Waiting for {what} at {url} (the first start can take a few minutes)…")
    deadline = time.time() + minutes * 60
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=5) as response:
                if response.status == 200:
                    info(f"{what} is up.")
                    return
        except OSError:
            pass
        time.sleep(3)
    fail(f"{what} did not come up. Check: docker compose logs")


def python_command() -> list[str]:
    return ["uv", "run", "--no-sync", "python"] if shutil.which("uv") else [str(VENV_PYTHON)]


# ---------- steps ----------


def choose_mode(args: argparse.Namespace) -> str:
    title("1/3  How do you want to run the demo?")
    if args.mode:
        info(MODES[args.mode])
        return args.mode
    keys = list(MODES)
    for number, key in enumerate(keys, start=1):
        info(f"{number}) {MODES[key]}")
    while True:
        answer = ask("Choose 1-3", "1")
        if answer in {"1", "2", "3"}:
            return keys[int(answer) - 1]


def write_env(mode: str, args: argparse.Namespace) -> None:
    title("2/3  Writing .env")
    lines = [
        "# Written by scripts/setup.py. Re-run it to switch modes; .env.example explains every",
        f"# setting. Mode: {mode}",
        "",
    ]
    if mode == "cloud":
        info("Find these on your instance page at https://app.falkordb.cloud")
        host = args.host or ask("Host (for example r-xxxx.falkordb.cloud)")
        port = args.port or ask("Port", "6379")
        username = args.username if args.username is not None else ask("Username", "falkordb")
        password = args.password if args.password is not None else ask("Password", secret=True)
        if not host:
            fail("A host is required for FalkorDB Cloud.")
        lines += [
            f"FALKORDB_HOST={host}",
            f"FALKORDB_PORT={port}",
            f"FALKORDB_USERNAME={username}",
            f'FALKORDB_PASSWORD="{password}"',
        ]
    else:
        lines += [
            "# The falkordb container from docker-compose.yml.",
            "FALKORDB_HOST=localhost",
            "FALKORDB_PORT=6379",
        ]

    groq = args.groq_key
    if groq is None and not args.yes:
        info("Optional: a free Groq key turns on the GraphRAG step. Everything else needs no key.")
        groq = ask("Groq key from https://console.groq.com/keys (Enter to skip)", secret=True)
    if groq:
        if not groq.startswith("gsk_"):
            fail("That does not look like a Groq key (they start with gsk_).")
        lines += [
            "",
            "# GraphRAG: LLM on Groq, embeddings run locally.",
            f'LLM_API_KEY="{groq}"',
            f'LLM_MODEL="{GROQ_MODEL}"',
        ]

    if ENV_FILE.exists():
        if not confirm(".env exists. Replace it (old one kept as .env.backup)?", True, args.yes):
            info("Keeping your .env.")
            return
        shutil.copy(ENV_FILE, ROOT / ".env.backup")
    ENV_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    info("Wrote .env")


def install_backend() -> None:
    if shutil.which("uv"):
        run(["uv", "sync"])
        return
    if not (3, 10) <= sys.version_info[:2] <= (3, 13):
        fail("Use Python 3.10-3.13, or install uv: https://docs.astral.sh/uv/")
    if not VENV_PYTHON.exists():
        run([sys.executable, "-m", "venv", ".venv"])
    run([str(VENV_PYTHON), "-m", "pip", "install", "-r", "requirements.txt"])


def install_frontend() -> None:
    require("npm", "https://nodejs.org/ (version 22.12 or newer)")
    run(["npm", "install", "--no-fund", "--no-audit"], cwd=FRONTEND)


def start(mode: str, args: argparse.Namespace) -> None:
    title("3/3  Installing and starting")
    py = " ".join(python_command())
    if mode == "docker":
        require("docker", "https://docs.docker.com/get-docker/")
        run(["docker", "compose", "up", "-d", "--build"])
        wait_for("http://localhost:8200/health", "backend")
        title("Done! Open http://localhost:3200/#/workshop")
        info("FalkorDB's own browser UI: http://localhost:3201")
        info("Stop:  docker compose down      Logs:  docker compose logs -f")
        return

    install_backend()
    install_frontend()
    if mode == "dev":
        require("docker", "https://docs.docker.com/get-docker/")
        run(["docker", "compose", "up", "-d", "falkordb"])
        time.sleep(3)

    if not args.no_check:
        info("Checking FalkorDB end to end…")
        run([*python_command(), "scripts/check_setup.py"])

    title("Done!")
    info(f"Terminal 1 (backend):   {py} -m app --reload")
    info("Terminal 2 (frontend):  cd app/frontend && npm run dev")
    info("Open http://localhost:5273/#/workshop")


def main() -> None:
    parser = argparse.ArgumentParser(description="Set up falkordb-demo.")
    parser.add_argument("--mode", choices=list(MODES))
    parser.add_argument("--groq-key")
    parser.add_argument("--host", help="FalkorDB Cloud host")
    parser.add_argument("--port", help="FalkorDB Cloud port")
    parser.add_argument("--username", help="FalkorDB Cloud username")
    parser.add_argument("--password", help="FalkorDB Cloud password")
    parser.add_argument("--yes", action="store_true", help="Accept all defaults")
    parser.add_argument("--no-check", action="store_true", help="Skip the end-to-end check")
    args = parser.parse_args()

    if os.name == "nt":
        os.system("")  # enables colours in the classic Windows console
    sys.stdout.reconfigure(errors="replace")
    print("\033[1mfalkordb-demo setup\033[0m")
    mode = choose_mode(args)
    write_env(mode, args)
    start(mode, args)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n  Setup cancelled.")
        sys.exit(130)
