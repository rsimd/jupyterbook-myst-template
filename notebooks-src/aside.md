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

# Aside Block

このページでは，本文の右余白に補足情報を置く `aside` ブロックを確認する。

## Main Text

:::{aside} Margin Note
`aside` に入れた内容は，本文の流れを止めずに右側の余白へ配置される。
用語の補足，短い注意，関連リンクなどを置く用途に向いている。
:::

本文側には通常の見出し，段落，コード，数式を置ける。aside があるページでは右余白が本文の補足に使われるため，右側の On this page は自動生成されても折りたたみ対象から外す。

```{code-cell} python
items = ["main text", "aside", "page outline"]
print(" / ".join(items))
```

## Summary

教材ページでは，式変形の補足や読み飛ばしてよい背景説明を aside に逃がすと，本文の主線を保ちやすい。
