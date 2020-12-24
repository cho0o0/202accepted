---
title: 純粋なCSSで実現するアクセス解析
date: 2020-12-24 10:31:28
language: [japanese]
tags: [css]
category: tech
---

アクセス解析は昨今のウェブサービスを実装する上で欠かせない要件になってきています。アクセス解析を実現するのに、いろんなツールやソリューションを活用することができます。その中で最も利用されているのは恐らくGoogle Analyticsだと思います。Google Analyticsから提供してくれたスクリプトタグをHTMLファイルに埋め込むだけで来訪者のデバイス情報やブラウザ情報等を把握できてしまいます。一方で、Google Analyticsのようにスクリプトタグを埋めることはJavaScriptを使うことです。もしユーザがそのスクリプト（もしくはJavaScriptの実行自体）をブロックしたら、当然ながら情報の収集ができなくなります。そのような場合、アクセス解析が不可能になるでしょうか？簡易的ではありますが、実は純粋なCSSでもある程度代用できたりします。

## メディアクエリを使ってデバイス情報を取得する

まずHTMLファイルに見えない要素を一つ置いておきます。

```html
<p class="invisible-element"></p>
```

そして[`url`関数](https://developer.mozilla.org/ja/docs/Web/CSS/url())を活用し、こういうCSSを書けばOKです。

```css
@media screen and (orientation: portrait) {
  .invisible-element {
    background: url(https://example.org/analytics?orientation=portrait);
  }
}

@media screen and (orientation: landscape) {
  .invisible-element {
    background: url(https://example.org/analytics?orientation=landscape);
  }
}
```

ユーザのデバイスが縦長の向きになっている場合、`orientation=portrait`のGETリクエストが`https://example.org/analytics`に飛ばされるので、そちらのエンドポイントで集計することが可能になります。[メディアクエリで使えばメディア特性](https://developer.mozilla.org/ja/docs/Web/CSS/@media#Media_features)なら通用するので、ビューポートの向き以外、スクリーンのサイズやresolutionを検知することも可能です。例えば、`@media screen and (min-resolution: 2dppx)`を使えば、ユーザのデバイスがRetinaかどうかは判断できるようになります。

## @supportsを使ってブラウザの情報を取得する

メディアクエリのケースと似ていますが、下記のようなコードを使えば、ユーザが相対的に新しいブラウザを使っているか分かるようになります。

```css
@supports (display: inline-grid) {
  .invisible-element {
    background: url(https://example.org/analytics?new-browser=true);
  }
}

@supports not (display: inline-grid) {
  .invisible-element {
    background: url(https://example.org/analytics?new-browser=false);
  }
}
```

ユーザが使っているブラウザとバージョンによってCSS特性のサポートができていない、もしくは廃止されているかもしれません。よって、条件を組み合わせば、ユーザが使っているブラウザのバージョンまで特定できるでしょう。

## 疑似クラスを使ってユーザの行動を統計する

下記のような2つのリンクがあるとします。

```html
<a id="product-1" href="https://example.com/product-1">Buy Product 1</a>
<a id="product-2" href="https://example.com/product-2">Buy Product 2</a>
```

ユーザが実際にクリックした回数だけではなく、興味を示してくれた回数を統計したい要望があり得ます。以下のようなCSSコードを使えば、カーソルが載せた（Hoverの）回数を集計できるようになります。

```css
#product-1:hover::before {
    content: url('https://example.org/analytics?hover-product=1');
}
#product-2:hover::before {
    content: url('https://example.org/analytics?hover-product=2');
}
```

擬似要素を使っている為、別のDOM要素を設ける必要すらありません。もちろん、`:hover`以外に、`:focus`や`:active`に適用することが可能です。さらに、[`var()`関数](https://developer.mozilla.org/ja/docs/Web/CSS/var())を活用すれば、ユーザを特定するところまで行えます。  
やり方は簡単です。まず下記のようにHTMLをレンダリングする側がユーザIDが含まれているURLを作成し、該当要素のstyle属性に埋め込みます。

```html
<a id="product-1" href="https://example.com/product-1" style="--analytics-hover-product-1: url('https://example.org/analytics?user-id=10000&hover-product=1');">Buy Product 1</a>
<a id="product-2" href="https://example.com/product-2" style="--analytics-hover-product-2: url('https://example.org/analytics?user-id=10000&hover-product=2');">Buy Product 2</a>
```

それからCSS側で変数として使うだけで完成です。

```css
#product-1:hover::before {
    content: var(--analytics-hover-product-1);
}
#product-2:hover::before {
    content: var(--analytics-hover-product-2);
}
```

HTMLとCSSのみで実現でき、JavaScriptを一切介していないので、スクリプトをブロックしても集計ができてしまいます。しかし、流石にここまでやると、わざわざスクリプトをブロックしたユーザに怒られそうですね笑。

## まとめ

使っている技術が別に目新しくなく、実装自体もシンプルだと思います。どちらかと言いますと、こういうアイデアがなかなか思い付かないんじゃないかと思います。ただ、泥臭い部分がどうしてもありますので、Google Analyticsが使えればGoogle Analyticsを使いますけどね。
