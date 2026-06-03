---
jupytext:
  text_representation:
    extension: .md
    format_name: myst
    format_version: '0.13'
    jupytext_version: 1.19.3
kernelspec:
  display_name: Python 3
  language: python
  name: python3
---

# Jupyter Book MyST Template

このテンプレートは，Jupyter Book 2 / MyST で教材サイトを作るための最小構成である。

- 左側の Table of Contents を開閉できる。
- 右側の On this page を本文見出しから生成し，開閉できる。
- 引用は本文中で `[1]` のように表示され，ページ下部の References に移動する。
- References の各文献から DOI や URL に移動できる。
- ローカル preview で MyST の BASE_URL 警告が出にくいように後処理する。

```{note}
:class: dropdown
:open: true

本文は `notebooks-src/` の MyST Markdown を編集し，`notebooks/` の `.ipynb` に Jupytext で同期する。
```

## Quick Start

```bash
uv sync --all-groups
uv run python scripts/build_site.py --target github
```

ローカルで `_build/html` を直接配信する場合は，`BASE_URL` を空にして build/postprocess する。
