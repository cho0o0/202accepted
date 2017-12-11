---
title: Vue.jsでプレースホルダを用いたローディングを実装する際のトランジション
date: 2017-12-11 21:35:24
language: [japanese]
tags: [vue.js]
category: tech
---

__この記事の実装例は[こちら](https://www.webpackbin.com/bins/-L-ycPbJmEtxhmi2BOgQ)です。__

# 背景
UX向上の観点により、読み込みが遅いもの（特に大きなイメージファイルなど）が存在する場合、先に枠を表示し、ダウンロードできた後本物に置き換える設計は[最近増えてきています](https://medium.com/@shunsukematsumoto/%E3%83%97%E3%83%AC%E3%83%BC%E3%82%B9%E3%83%9B%E3%83%AB%E3%83%80%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E3%83%AD%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0ui-571f896738a6)。そのうち、下の図で示されているようなFacebookのロード画面は好例の一つだと言えるでしょう。  

![Facebookローディング画面のプレスホルダー](https://i.stack.imgur.com/ocOS7.jpg)

この設計をVue.jsで実装するのはそれほど難しくないでしょう。いくつかのVue.js製のプレスホルダーはすでに公開されている（[その一](https://github.com/StevenYuysy/vue-content-placeholder)、[その二](https://github.com/michalsnik/vue-content-placeholders)）ため、それらを[条件付きレンダリング（Conditional Rendering）](https://jp.vuejs.org/v2/guide/conditional.html)と合わせ、ディレクティブ`v-if`と`v-else`を活用するだけで実現可能です。  

```html
<placeholder v-if="content === null" />
<my-content v-else />
```

こういう風に実装してもダメとは言えませんが、コンテンツの切り替えにトランザクションが全く存在しないため、唐突の感は免れません。よって、置き換えが発生した際に、フェードイン／フェードアウト効果を追加した方がUX的に優しいと思われます。  

# トランジションモード
Vue.jsでトランジションを追加するのに、非常に簡単なやり方が存在します。そう、[`Transition`というラッパーコンポーネント](https://jp.vuejs.org/v2/guide/transitions.html#単一要素-コンポーネントのトランジション)で囲み、CSSで定義する方法です。  

![トランジションの状態定義](https://vuejs.org/images/transition.png)

```vue
<template>
<transition name="fade">
  <placeholder v-if="content === null" />
  <my-content v-else />
</transition>
</template>

<script>
// 省略
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
```

しかし、これだけでは変な動きが出てきます。一時的にプレスホルダーと本物が同時に画面上に現れるわけです。  
理由は単純です。`transition`内の子コンポーネントのアニメーションが同時に開始するため、プレスホルダーのフェードアウトアニメーションが再生されている間に、本物のコンポーネントがすでに出てきてしまいました。  
これを回避するために、Vue.jsがトランジションモードを用意してくれました。現時点では`out-in`と`in-out`2種類が提供されていて、`out-in`を利用すれば、コンポーネントAが消失した後、コンポーネントBを出現させることは可能になります。  

```vue
<template>
<transition name="fade" mode="out-in">
  <placeholder v-if="content === null" />
  <my-content v-else />
</transition>
</template>

<script>
// 省略
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
```

# より良い表現を求めて
上記の解決策は悪くないと思いますが、もう少しいい表現ができると思いました。今の場合、トランジション効果は一つずつ再生されるため、所用時間が長くなり、入れ替わる感が感じにくくなっています。その為、やはりフェードアウトとフェードインは同時に行って欲しいですね。となると、トランジションモードの使用を取りやめ、その代わりに、CSSの`position`で二つのコンポーネントの位置を同じところに固定すれば、望んでいた効果が出せるはずです。  

```vue
<template>
<transition name="fade">
  <placeholder v-if="content === null" class="my-content" />
  <my-content v-else class="my-content" />
</transition>
</template>

<script>
// 省略
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.my-content {
  position: absolute;
}
</style>
```

しかし、見た目は完璧でしょうが、この方法はトランジションモードの方法より扱いにくいはずです。なぜかと言いますと、`position: absolute;`の使用によって、コンポーネントらがドキュメントフローから出てしまうので、CSS上で配慮しなければいけないものが増えてしまいます。  

# まとめ
もっといい方法があるのではないかと思いますが、今回はただの実験なので、これ以上追求しませんでした。一見簡単そうなテーマでしたが、完璧に実現することは意外と難しいということを感じましたね。
