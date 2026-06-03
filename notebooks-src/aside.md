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

このページでは，本文の右余白に補足情報を置く `aside` ブロックと，教材でよく使う MyST / Jupyter Book のブロックをまとめて確認する。
ページを長めにしているので，冒頭では On this page だけが表示され，補足位置に近づくと Margin Note がその上に重なって表示される。

## Outline Only Section

この区間には margin / aside を置かない。右側には見出し一覧として On this page が表示される。
本文の主線だけで読ませたい場所では，この状態が標準になる。

教材では，定義，例，計算，確認問題の順に話を進めることが多い。
右余白に補足を出しすぎると視線が散るため，補足を入れる箇所は意図的に絞る。
このテンプレートでは本文の見出しから On this page を作り，長いページでも現在の構造を確認しやすくしている。

### Plain Paragraphs

長い文章だけの区間を用意して，右余白に outline だけが表示される初期状態を確認する。
たとえば，確率モデルの授業では，記号の導入，データの仮定，推定したい量を順番に説明する。
このとき，本文に直接必要な情報は段落として置き，歴史的背景や読み飛ばしてもよい注意だけを margin / aside に逃がす。

### Markdown Blocks

Markdown の基本ブロックも通常通り使える。

- 箇条書きは短い比較に使う。
- 番号付きリストは手順やアルゴリズムの流れに使う。
- 強調は `code` や **重要語** の確認に使う。

> 引用ブロックは，定義の直感的な言い換えや，本文と少し距離を置いた説明に使える。

## Margin Note Section

:::{aside} Margin Note
`aside` に入れた内容は，本文の流れを止めずに右側の余白へ配置される。
用語の補足，短い注意，関連リンクなどを置く用途に向いている。
:::

この見出し付近までスクロールすると，右余白に Margin Note が表示される。
表示された Margin Note はスクロールしても残り，On this page の上に置かれる。

本文側には通常の見出し，段落，コード，数式を置ける。
aside は本文の理解を助ける短い情報に向いている。
長い説明を入れると本文との対応が崩れやすいので，詳細説明は通常のセクションに分ける。

## Admonition Blocks

この区間では，教材で使いやすい admonition 系ブロックをまとめて表示する。
見た目と用途を比較できるように，短い文だけを入れている。

:::{note}
`note` は補足説明や前提の確認に使う。
:::

:::{tip}
`tip` は実装上の小さなコツや読み方のヒントに使う。
:::

:::{important}
`important` はこの後の議論に直接効く条件や結論に使う。
:::

:::{warning}
`warning` は誤用しやすい操作や，結果の解釈で注意すべき点に使う。
:::

:::{caution}
`caution` は warning より少し弱い注意や，前処理上の確認に使う。
:::

:::{attention}
`attention` は読み手の視線を一度止めたい注意に使う。
:::

:::{danger}
`danger` は壊れる操作，非推奨の手順，重大な落とし穴に使う。
:::

:::{error}
`error` は失敗例や例外の説明に使う。
:::

:::{hint}
:class: dropdown
`hint` は既定で折りたためる補助説明として使う。
:::

:::{seealso}
`seealso` は関連ページ，参考文献，発展項目への誘導に使う。
:::

:::{admonition} Custom Admonition
任意タイトルの admonition は，授業固有のラベルを付けたいときに使う。
:::

## Code Blocks

```{code-cell} python
items = ["main text", "margin note", "page outline"]
print(" / ".join(items))
```

```{code-block} python
:linenos:

def normalize(values):
    total = sum(values)
    return [value / total for value in values]
```

コードセルは実行結果を残したい教材に使う。
コードブロックは実行しない例示，疑似コード，設定ファイルの断片に使う。

## Math Blocks

数式は本文中の $p(x)$ のような inline math と，独立した display math の両方を使える。

```{math}
:label: eq-aside-demo-loss

L(\theta) = - \sum_{n=1}^{N} \log p(x_n \mid \theta)
```

式番号を参照したい場合は，label を付けた display math を使う。
確率モデルの教材では，目的関数，制約条件，更新式を display math に分けると読みやすい。

:::{aside} Formula Note
右余白の式補足は，本文の式変形を止めずに記号の意味だけを確認させたいときに使う。
:::

この区間ではもう一つ aside を置いている。
式の近くまでスクロールすると右余白が Formula Note に変わり，次の補足が出るまで On this page の上に残る。

## Table Blocks

:::{list-table} Block Usage Summary
:header-rows: 1

* - Block
  - Typical Use
* - `aside`
  - 本文の流れから外した短い補足
* - `note`
  - 前提，補足，軽い注意
* - `warning`
  - 誤用しやすい点
* - `code-cell`
  - 実行結果を見せたい Python コード
* - `math`
  - 番号付きの独立数式
* - `figure`
  - 画像，図，処理フロー
:::

表は，ブロックの使い分けや記号表を整理するときに使う。
小さな比較は箇条書きで十分だが，列ごとに役割を持つ情報は table にすると見通しがよい。

## Figure Blocks

:::{figure} ../assets/aside-flow.svg
:alt: MyST source to GitHub Pages flow
:width: 100%

MyST source を notebook に同期し，Jupyter Book で HTML 化して GitHub Pages に出す流れ。
:::

`figure` は画像や図を本文内に置くときに使う。
このデモではローカル SVG を参照して，GitHub Pages でも同じ図が表示されるようにしている。

## Long Outline Gap

この区間には margin / aside を置かない。
直前の Formula Note が On this page の上に残ることを確認するための長い本文区間である。

### Gap Paragraph 1

最初の段落では，本文だけで読ませる区間を想定する。
授業ノートでは，導入の説明，問題設定，記号の意味を段落として連続させることがある。
このような区間では，右余白に outline が残っていると，ページ内の現在位置を把握しやすい。

### Gap Paragraph 2

次の段落では，少し長めの説明を続ける。
モデルの仮定を説明するとき，独立同分布，尤度，事前分布，目的関数の関係を順番に述べる。
読者は見出し一覧を見ながら，いまどの段階にいるかを確認できる。

### Gap Paragraph 3

さらにスクロールしても，直前の margin note は右余白に残る。
ここで On this page も同時に表示されていれば，margin / aside がページ内移動の手がかりを潰していないことを確認できる。

## Second Margin Section

:::{aside} Reading Note
長いページでは，右余白の補足を現在位置に近いものだけに絞ると，本文と補足の対応が分かりやすい。
:::

この見出し付近で Reading Note が表示される。
同じページに複数の aside があっても，現在のスクロール位置に近い補足だけを右余白に出す。

:::{admonition} Dropdown Example
:class: dropdown

折りたたみ可能な補足は，本文の密度を落とさずに追加情報を置ける。
長い証明や実装上の補足を隠しておく用途に向いている。
:::

## Summary

教材ページでは，式変形の補足や読み飛ばしてよい背景説明を aside に逃がすと，本文の主線を保ちやすい。
On this page を閉じずに残し，現在の margin note をその上に置くと，補足とページ構造を同時に確認できる。
