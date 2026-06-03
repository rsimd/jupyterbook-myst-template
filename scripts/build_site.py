"""Build the Jupyter Book site for local preview or static hosting."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_SOURCE_DIR = ROOT / "notebooks-src"
NOTEBOOK_OUTPUT_DIR = ROOT / "notebooks"
BUILD_OUTPUT_DIR = ROOT / "_build" / "html"


def run(command: list[str], env: dict[str, str] | None = None) -> None:
    subprocess.run(command, cwd=ROOT, env=env, check=True)


def sync_notebooks() -> None:
    NOTEBOOK_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for source in sorted(NOTEBOOK_SOURCE_DIR.glob("*.md")):
        output = NOTEBOOK_OUTPUT_DIR / f"{source.stem}.ipynb"
        run(["uv", "run", "jupytext", "--to", "ipynb", "--output", str(output), str(source)])


def sync_standalone_html() -> None:
    for dirname in ("assets", "demos", "slides"):
        source_dir = ROOT / dirname
        target_dir = BUILD_OUTPUT_DIR / dirname
        target_dir.mkdir(parents=True, exist_ok=True)
        if not source_dir.exists():
            continue
        for source in sorted(source_dir.glob("*.html")):
            shutil.copy2(source, target_dir / source.name)


def build(base_url: str) -> None:
    env = os.environ.copy()
    if base_url:
        env["BASE_URL"] = base_url
    else:
        env.pop("BASE_URL", None)

    sync_notebooks()
    run(["uv", "run", "jupyter-book", "build", "--html", "--ci"], env=env)
    sync_standalone_html()
    run(["uv", "run", "python", "scripts/postprocess_html.py"], env=env)

    if base_url:
        (BUILD_OUTPUT_DIR / ".nojekyll").touch()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--target",
        choices=("local", "cloudflare", "github"),
        default="local",
        help="Hosting target. GitHub Pages uses a repository base path; Cloudflare Pages uses root.",
    )
    parser.add_argument(
        "--base-url",
        default=None,
        help="Override BASE_URL. Use /REPOSITORY for GitHub Pages project sites.",
    )
    args = parser.parse_args()

    if args.base_url is not None:
        base_url = args.base_url
    elif args.target == "github":
        base_url = os.environ.get("BASE_URL", "")
    else:
        base_url = ""

    build(base_url)


if __name__ == "__main__":
    main()
