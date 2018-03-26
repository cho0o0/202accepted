---
title: ある条件を満たすDOM要素を抽出するコード
date: 2018-03-26 20:37:31
language: [japanese]
tags: [javascript]
category: tech
---

週末にデモプログラムを作成する時、ある要素の中から、指定された条件を満たすDOM要素を抽出する機能が必要だった為、下記のようなコードを作りました。

```js
const selectAll = el => condition => [el,
  ...Array.from(el.children)
    .map(child => selectAll(child)(condition))
    .reduce((arr, i) => arr.concat(i), [])
].filter(condition)
```

# 考え方
実は、主な作業は２つだけです。

1. 全ての要素を羅列します。
2. 条件に満たしている要素をフィルターリングで抽出します。

コードを書けばこうなります。(allElements=全ての要素、condition=条件)

```js
const selectAll = (allElements, condition) => allElements.filter(condition)
```

関数の再利用を考えたら、[コンポジション](https://en.wikipedia.org/wiki/Function_composition_(computer_science))を採用した方がいいでしょう。

```js
const selectAll = allElements => condition => allElements.filter(condition)
```

1つ目の作業はどう実現するかは問題です。DOMはツリー構造なので、親要素の元に要素があり、その要素の中に、さらに子要素が存在する。ツリー構造のケースに対処する場合、再帰を使用することは一般的です。関数型風に書きたかったので、Array.prototye.mapと[スプレッド構文](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)を利用することにしました。DOM要素のchildrenはHTMLCollection型で、map関数が備えていません。よって、まず`Array.from()`で配列に変換する必要があります。

```js
const selectAll = el => condition => [el, ...Array.from(el.children).map(child => selectAll(child)(condition))]
```

しかし、上記のコードだと関数`selectAll`の戻り値は配列になります。そのまま再帰してしまうと、配列内に配列が格納されることになります。reduceを使って、[flatten効果](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)を果たさせます。

```js
const selectAll = el => condition => [el,
  ...Array.from(el.children)
    .map(child => selectAll(child)(condition))
    .reduce((arr, i) => arr.concat(i), [])
].filter(condition)
```

こんな考え方で、今回のコードを完成させました。

# 使用例

```js
// 全てのdiv要素を抽出する
console.log(selectAll(document.querySelector('body'))(el => el.tagName === 'DIV'));

// IDはappの要素の中から高さが300px以上になっている要素を抽出する
console.log(selectAll(document.querySelector('#app'))(el => el.clientHeight >= 300));
```

# 結論
やはりJSで関数型プログラミングするのは気持ちいいw