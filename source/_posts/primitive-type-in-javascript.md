---
title: JavaScript のプリミティブ型
date: 2019-08-02 23:44:30
language: [japanese]
tags: [javascript]
category: tech
---

JavaScript 言語において、データ型は恐らく基礎中の基礎だと言われてもおかしくありません。しかし、JavaScript をよく使用している方でも、データ型に関する知識が曖昧もしくは間違っているかもしれません。スコープが広がり過ぎないように、プリミティブ型に焦点を当て、JavaScript のプリミティブ型にまつわる落とし穴について解説してみたいと思います。

## JavaScript の型

### プリミティブ型

執筆時の最新パージョンである ECMAScript 2019(略称：ES2019/ES10)の中に、データ型は全部で 7 種類です。そのうちプリミティブ型は下記の 6 つです。

- Number
- String
- Boolean
- Null
- Undefined
- Symbol

C 言語のように、integer や double を区別することがなく、数字系なら Number 型一択です。ただ、Number 型に特殊な値が 3 つ存在します：`+Infinity`（無限大）、`-Infinity`（無限小）および`NaN`（Not a number/数字ではない）です。
Java でしたら、String はオブジェクトになりますが、JavaScript に String というプリミティブ型が存在します。意味は同じく文字列を表現する型です。
Boolean、Null と Undefined の値は限られています。Boolean の値は true と false 二つのみです。Null の値は[null](https://www.ecma-international.org/ecma-262/10.0/#sec-ecmascript-language-types-null-type)だけで、Undefined の値は[undefined](https://www.ecma-international.org/ecma-262/10.0/#sec-ecmascript-language-types-undefined-type)のみです。
Symbol は ES2015(通称：ES6)にて[新しく追加されたデータ型](https://www.ecma-international.org/ecma-262/6.0/#sec-terms-and-definitions-symbol-type)です。MDN を含む、Symbol は ES2016 で追加されたとの記述が散見されますが、それは間違い（タイポ？）です。
また、2019 年 6 月に開催された TC39 ミーティングにて、BigInt という新しいプリミティブ型は[Stage 4 へ進むことが許可されました](https://github.com/tc39/tc39-notes/blob/master/meetings/2019-06/june-4.md#bigint-to-stage-4)。よって、ES2020 の言語仕様へ組まれることがほぼ決定になっています。`BigInt`は文字通り、今までの Number 型だと取り扱えない大きな数字を処理する為に導入される型です。一部の資料では ES2019 の新機能だと説明されていますが、残念ながらそれは間違いです。確かに一時期 ES2019 へ入れられるんじゃないかと見られていましたが、まだ仕様へ入っていません。ただ、[Chrome](https://v8.dev/blog/bigint)や[Firefox](https://wingolog.org/archives/2019/05/23/bigint-shipping-in-firefox)、[Nodejs10.8+](https://node.green/#ESNEXT-candidate--stage-3--BigInt)ではすでに実装されていますので、JavaScript のプリミティブ型としてカウントされていることもあります。

### オブジェクト型

7 種類の中、唯一プリミティブじゃない型は Object 型ですが、恐らく普段のコーディングの中でもっともよく使われている型でしょう。`{ age: 1 }` のように作ったのは当然ながら Object ですし、クラス(class)、関数(function)、配列、Date や正規表現はすべて Object です。この記事のスコープはプリミティブ型に絞っていますので、解説は割愛します。

### プリミティブ型とオブジェクト型の違い

JavaScript において、プリミティブ型は値のみでプロパティがありません。なので、プリミティブ型の変数を識別する時は値を利用するしかありません。値を変えたら別のプリミティブ値になりますので、プリミティブ値は不変（Immutable）なんです。一方、オブジェクトはプロパティを持ち可変（Mutable）です。オブジェクトを識別する際に参照(Reference)を利用します。その為、同じ値を持っているとしても別々のオブジェクトとして識別されるかもしれません。

```JavaScript
1 === 1 // => true
[1] === [1] // => false
```

逆に、値を変えても同じオブジェクトになり得ます。下記のコードは好例です。

```JavaScript
let b = a = { i: 1 };
b === a; // => true
a.i = 0;
b === a; // => true

let d = c = 1;
d === c; // => true
c = 0;
d === c; // => false
```

## 混乱ポイント

上記の記述だけ読むと、JavaScript の型システムは他のオブジェクト指向言語とは大した差がないように感じるかもしれません。しかし、なぜ数多くのプログラマーが JavaScript の型に惑わされ・苦しめられてきたのでしょうか？主な理由は以下の三つだと思います。

### 自由過ぎる型変換

JavaScript は多くのスクリプト言語と同じく、動的型付け（Dynamic Typed）という特徴を持っています。その為、型はコンパイル時ではなく、実行時動的にチェックされます。さらに、型に関するチェックが緩く、PHP と一緒に `loosely typed`　または `weakly typed` （弱い型付け）と呼ばれています。[Python](https://wiki.python.org/moin/Why%20is%20Python%20a%20dynamic%20language%20and%20also%20a%20strongly%20typed%20language)や Ruby が loosely typed と説明している記事もありますが、恐らく動的型付けと混同していたからです。動的型付けと弱い型付け、この二つの特徴により、下記の JS コードは問題なく動作します。

```JavaScript
a = "hello";
a = 1;
b = a + "world" // => "1world"
```

Python や Java の場合、例外が発生するはずですが、JavaScript では型は自動的に判断され、暗黙的に変換されます（implicit coercion）。同じ変数へ別の型の値を代入しても上書きが発生するだけで Runtime に怒られません。そのゆえ、プログラマーにとって型を把握することが難しいです。

```JavaScript
false + null == '0' // => true
```

例えば、上記の式の評価結果は Boolean 型の true になります。強い型の言語に馴染んでいる方にとってあり得ないでしょう。なぜなら、Boolean 型の値と Null 型の値の和は String 型の値に等しいと示されているからです。  
また、プリミティブ型とオブジェクト型の相互変換もあります。先程プリミティブ型はプロパティを持っていないと説明していましたが、下記のコードはエラーになりません。

```JavaScript
"hello world".length // => 11
```

なぜなら、String 型の`"hello world"`は[ToObject](https://www.ecma-international.org/ecma-262/10.0/#sec-toobject)という抽象オペレーション（Abstract Operation）により、暗黙的に String ラッパーオブジェクト(Wrapper Object)へ[変換](https://www.ecma-international.org/ecma-262/10.0/#sec-getv)され、その後ラッパーオブジェクトの length プロパティへアクセスしに行くわけです。要するに、上記のコードは以下のように解釈されます。

```JavaScript
Object("hello world").length // => 11
```

実際に、loosely typed という特徴は非常にパワフルではありますが、上記のようなデメリットが JavaScript のコミュニティにおいても問題視されてきました。それを改善すべく、[jshint](https://jshint.com/docs/options/#eqeqeq)や[eslint](https://eslint.org/docs/rules/eqeqeq)のルールで暗黙的な型変換がない `===` が推奨されたり、強い型付けの特徴を持つ TypeScript が流行るようになりました。  
その為、ES2015 以降追加された Symbol とこれから追加される予定の BigInt もこのような暗黙的な変換に対し消極的振る舞いを見せています。例えば、`1 + 1n` という Number（`1`） と BigInt（`1n`） 型の足し算すら TypeError になり、`Cannot mix BigInt and other types, use explicit conversions` （BigInt 型は別の型と混合することができません。明示的な型変換を使ってください）とのメッセージが表示されます。

### 惑わしい `typeof`

JavaScript では、型を実行中に確認したい場合、`typeof`という演算子(operator)を使います。`typeof 'hello world'` は string になり、 `typeof false` は boolean になります。  
しかし、この演算子はいくつか直感に反するところがあります。  
まず一番よく指摘されているのは null 問題です。上記のルールに従えば、 `typeof null` は当然ながら null になるはずですが、その結果はなんと object になります。いろんな解釈が提唱されていましたが、結局[バグ説](https://2ality.com/2013/10/typeof-null.html)に落ち着きました。しかもこのバグの存在を前提とした実装がすでに世の中に広がっている為、今後も修正されない予定です。
また、上でも言及していましたが、JavaScript 内のプリミティブ型は全部で 6 つでそれ以外はすべて Object です。よって、`typeof`の結果は 7 つしかないと考えられるはずです。しかし、8 つ目、function という結果も存在します。プリミティブ型とオブジェクト型以外に、Function 型が存在するように見えそうですが、そんなことはありません。この振る舞いはただの負債です。ECMAScript の仕様によると、`[[Call]]`という内部メソッド(internal method)を持つオブジェクトに限って、評価結果は[function](https://ecma-international.org/ecma-262/10.0/#table-35)になると定義されています。
さらに、各ベンダーの実装違いが火に油を注いでいました。例えば、Chrome の早期バージョンにおいては、正規表現（`typeof /s/`）は[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#Regular_expressions)になっていたり、IE に[unknown と date](https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-es5ex/4bb7d565-d737-4ce7-a4c0-bd90c1059869)が存在していたりしていました。幸い、近年 ECMA-262 の台頭により、このような差分が無くなりつつであります。

### 不思議な `NaN`

上で紹介されている通り、`NaN` は Not a Number(数字ではない)という意味を表している Number 型の値です。しかし、他の Number 型の値と違い、比較・計算することは不可能です。

```JavaScript
NaN > 0 // => false
NaN < 0 // => false
NaN === 0 // => false

1 + NaN // => NaN
NaN / 0 // => NaN
```

上記のように比較はすべて false という結果になり、計算結果は全部 NaN です。さらに、多くの JS プログラマーを困惑させたのは、NaN は自分自身とも等しくないことです。すなわち、`NaN === NaN`の結果は false です。  
実はこれは驚くべきことではありません。ECMA-262 の仕様に[記述](https://www.ecma-international.org/ecma-262/10.0/#sec-terms-and-definitions-nan)されている通り、NaN は IEEE 754-2008 標準の Not-a-Number を表していますので、上記の振る舞いはあくまで IEEE の標準を[忠実に表現している](https://www.doc.ic.ac.uk/~eedwards/compsys/float/nan.html)だけです。とはいえ、プログラムの中で値は NaN であるかをチェックしなければいけないユースケースはきっと存在するはずです。自分自身と等しくない値は NaN しかないので、ECMAScript5(ES5)まではその特徴を利用するプラクティスが多かったです。この方法は今でも使えますが、黙示的な表現に見えますので、ECMAScript 2015(ES6)の仕様に`Number.isNaN`という[専用メソッド](https://www.ecma-international.org/ecma-262/10.0/#sec-number.isnan)が追加されました。値が`NaN`の時だけ true になり、それ以外は false を返してくれます。しかし、惑わしさはまだ残っています。なぜなら、グローバルオブジェクト(Global Object)にも`isNaN`というメソッドが[存在します](https://www.ecma-international.org/ecma-262/10.0/#sec-isnan-number)。両者の関係は下図のようです。

```text
Global Object
├───isNumber
├───Number
    └───isNumber
...
```

その上、`isNaN`はまず引数を暗黙的に Number 型へ変換してから NaN であるかを判断する為、`Number.isNaN`の振る舞いと異なります。

```JavaScript
isNaN("hello")  // => true
Number.isNaN("hello") // => false
isNaN({a: 1}) // => true
Number.isNaN({a: 1}) // => false
```

上記の理由によって、`NaN`を取り扱う時の惑わしさを減らす為に、グローバルオブジェクトの`isNaN`の使用は基本的に推奨されていません。

## まとめ

JavaScript の型チェックが緩く、暗黙的な変換が多い為、型を意識しなくてもコードを触ることができたりします。しかし、型をはっきり認識していなければ、予期に反する実行結果が出る可能性が高いです。特に歴史的な原因などによって、JavaScript の型システムが直感と相反するケースが多いです。そのため、言語仕様をしっかりと理解することが大切だと感じますね。
