# Jupyter Book MyST Template

Jupyter Book 2 / MyST 用の再利用可能なテンプレートです。`NITIC-HandsOnPRML` で整えた見た目と機能を，他の教材プロジェクトでも使えるように切り出しています。

## Features

- Collapsible left Table of Contents.
- Generated and collapsible right On this page outline.
- Numeric citation links such as `[1]` in the body.
- Citation links jump to the page References first; bibliography entries can link to DOI or URL.
- Local preview postprocess for MyST base-path drift and the BASE_URL fallback dialog.
- Jupytext workflow with `notebooks-src/*.md` as editable sources and `notebooks/*.ipynb` as published notebooks.
- GitHub Pages deployment workflow and Cloudflare Pages build settings.

## Use This Template

```bash
git clone https://github.com/rsimd/jupyterbook-myst-template.git my-book
cd my-book
uv sync --all-groups
uv run python scripts/build_site.py --target local
```

For local preview from the root of `_build/html`, build without a deployment base path:

```bash
uv run python scripts/build_site.py --target local
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

## Cloudflare Pages

Cloudflare Pages serves the site at the domain root, such as `https://PROJECT.pages.dev/`, so do not set `BASE_URL` for the normal Pages deployment.

Use these build settings:

```text
Build command: python -m pip install uv && uv sync --all-groups && uv run python scripts/build_site.py --target cloudflare
Build output directory: _build/html
Root directory: /
```

Set this environment variable in Cloudflare Pages if the default Python runtime is not 3.12:

```text
PYTHON_VERSION=3.12.2
```

If you deploy to GitHub Pages instead, keep using the included GitHub Actions workflow. If you deploy to Cloudflare Pages, you can leave the GitHub Actions workflow unused or delete it in your derived project.
