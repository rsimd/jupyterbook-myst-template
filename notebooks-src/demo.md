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

# Demo Page

このページでは，見出し目次，引用，コードハイライトを確認する。

## Citation

初期のニューラルネットワーク研究として McCulloch and Pitts のモデルが知られている [@McCulloch1943-py]。
MyST の引用記法は公式ドキュメントにもまとめられている [@MySTCitations]。

## Python Code

```{code-cell} python
import numpy as np

x = np.linspace(-4.0, 4.0, 9)
y = 1.0 / (1.0 + np.exp(-x))
print(np.round(y, 3))
```

## Nested Heading

右側の On this page は `h2` から `h4` を拾う。

### Subsection

サブセクションも右側の目次に表示される。

## Summary

このテンプレートを clone したプロジェクトでは，`myst.yml` の title, github, toc を差し替えて使う。
