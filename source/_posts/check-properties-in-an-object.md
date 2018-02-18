---
title: オブジェクトにあるプロパティが存在するかをチェックする
date: 2018-02-18 15:38:25
language: [japanese]
tags: [javascript]
category: tech
---

# 手法

JSのオブジェクトを扱う際に、あるプロパティが存在するかをチェックする作業はしばしば発生します。実は、この一見簡単そうな作業を実施する為に、いくつかのやり方が存在します。考え方で分けて見れば、以下の2種類になるかと思います。  

## 該当プロパティの値をチェックする

よく見かける手法は`undefined !== obj[prop]`もしくは`undefined !== obj.prop`でしょう（`obj` = オブジェクト、`prop` = プロパティ）。まずオブジェクトからプロパティを出して値をみます。もしオブジェクトに該当プロパティが存在しなければ、値は`undefined`になりますので、この特性を利用する手法ですね。  
この手法の異種として、`void(0) !== obj[prop]`があります。void演算子が分かればすぐ理解できるでしょう。`void(0)`の戻り値が`undefined`になるからですね。  
また、`'undefined' !== typeof obj[prop]`という書き方もあります。値の型を取得し、`undefined`型であるかを判別する考えです。
更に、もっとお洒落な書き方も存在します。`!!obj[prop]`です。下記のように書くことが可能になります。  

```javascript
if(!!obj.prop) return 'OK';
```

エクスクラメーションマークを2つ先頭に追加することで、結果の反転を二回行います。「False→True→False」みたいに、元の結果に戻すやり方ですね。  

`undefined !== obj[prop]`がもっと直感的なのに、なぜわざわざ`void(0) !== obj[prop]`や`'undefined' !== typeof obj[prop]`を使うか、疑問を感じたので、[ベンチマックを行ってみました](https://www.measurethat.net/Benchmarks/ShowResult/9195)。実は後二者の効率は前者の３倍程になります。なるほど〜  
あともう一つ気を付けなければいけないのは元々プロパティの値は`undefined`になっているケースです。上記の手法を使ってしまったら、該当プロパティが存在していても、`false`が出てしまいます。  
特に`!!obj[prop]`を使用する時、もっと注意を払わなければなりません。`0`や`null`の反転結果は`true`になるから、該当プロパティに入る値の型を100％把握していなければ、使用するのをやめておいた方が安全でしょう。  

## 該当プロパティの存在を確認する

抽出を行わず、直接チェックする方法もあります。`in`もしくは`hasOwnProperty`の使用です。

```javascript
// in
if(prop in obj) return 'OK';

// Object.prototype.hasOwnProperty
if(obj.hasOwnProperty(prop)) return 'OK';
```

両者の一番の違いはプロトタイプチェーンを辿るかどうかです。`in`の場合、プロトタイプチェーンを遡って親のプロパティまで確認する一方、`hasOwnProperty`は名前通り、自分自身のプロパティを見るだけです。どっちを使用するかはケースバイケースかもしれませんが、「辿らなくてもいい」・「辿らないでほしい」ケースが多い印象です。  
もう一つ細かい違いは実装されたバージョンです。`in`はJavaScript 1.4から使用可能になりましたが、`hasOwnProperty`は一歩遅れて、1.5になります。ただし、ES5さえ古いと感じている今、ES3時代の違いは流石に考えなくても良いでしょう。  

また、[underscore.jsのソースコード](http://underscorejs.org/docs/underscore.html)を読んだことがある方でしたら気づいてたかもしれませんが、`hasOwnProperty`の使い方は下記のようになります。

```javascript
// underscore.jsのソースコードより
_.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
};
```

わざわざ`call`を使っていますね。理由は簡単です。`var obj = {}`の書き方で生成されたオブジェクトでしたら、`Object`のメソッドをそのまま継承していますが、`var obj = Object.create(null)`みたいに生成すると、[そんな継承が発生しません](https://stackoverflow.com/a/12017703/6279569)。当然ながら、`hasOwnProperty`というメソッドを持ちません。こんなケースに対応する為に、`call`を使ったわけです。  

# まとめ
じゃ、結局何を使えばいいでしょうか。ケースバイケースのような定番フレーズを避けたいので、**できれば`hasOwnProperty`の利用を推奨します。** 理由は三つ。  
1. プロパティの値は何であろうと、一切関係ないです。
2. メソッド名でやりたいことが自己解釈できます。
3. 速いです。

以上です。

# リンク
- 機能テストのために作成したデモ：https://jsfiddle.net/0j16gm2u/
- 作成したベンチマークテスト：https://www.measurethat.net/Benchmarks/ShowResult/9195