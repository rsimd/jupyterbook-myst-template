# Jupyter Book MyST Template

Jupyter Book 2 / MyST 用の再利用可能なテンプレートです。`NITIC-HandsOnPRML` で整えた見た目と機能を，他の教材プロジェクトでも使えるように切り出しています。

## Features

- Collapsible left Table of Contents.
- Generated and collapsible right On this page outline.
- Numeric citation links such as `[1]` in the body.
- Citation links jump to the page References first; bibliography entries can link to DOI or URL.
- Local preview postprocess for MyST base-path drift and the BASE_URL fallback dialog.
- Jupytext workflow with `notebooks-src/*.md` as editable sources and `notebooks/*.ipynb` as published notebooks.
- GitHub Pages deployment workflow.

## Use This Template

```bash
git clone https://github.com/rsimd/jupyterbook-myst-template.git my-book
cd my-book
uv sync --all-groups
uv run jupytext --to ipynb --output notebooks/index.ipynb notebooks-src/index.md
uv run jupytext --to ipynb --output notebooks/demo.ipynb notebooks-src/demo.md
BASE_URL=/my-book uv run jupyter-book build --html --ci
BASE_URL=/my-book uv run python scripts/postprocess_html.py
```

For local preview from the root of `_build/html`, build without a deployment base path:

```bash
uv run jupyter-book build --html --ci
uv run python scripts/postprocess_html.py
python3 -m http.server 8001 --directory _build/html
```

Then open <http://127.0.0.1:8001/>.

## Customize

1. Edit `myst.yml`.
2. Replace `project.title`, `project.description`, `project.github`, `site.options.logo_text`, and `primary_sidebar_footer`.
3. Replace `project.toc` with your own notebook list.
4. Add references to `references.bib`.
5. Write source pages in `notebooks-src/`.
6. Generate paired notebooks in `notebooks/`.

## GitHub Pages

The workflow in `.github/workflows/deploy-jupyter-book.yml` builds the site and deploys `_build/html`.

Before the first deployment, open repository Settings -> Pages and set Source to GitHub Actions.

For a project repository, the workflow sets:

```bash
BASE_URL=/${{ github.event.repository.name }}
```

This keeps GitHub Pages asset paths aligned with `https://OWNER.github.io/REPOSITORY/`.
