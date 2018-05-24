---
title: Vuex Plugin 101
date: 2018-05-23 23:12:20
language: [japanese]
tags: [vue.js, vuex]
category: tech
---

「[Vue.js Tokyo v-meetup #7](https://vuejs-meetup.connpass.com/event/82065/)」にて発表させて頂きました。
スライドは[こちら](https://speakerdeck.com/cho0o0/vuex-plugin-101-full-ver-dot/)です。

<script async class="speakerdeck-embed" data-id="3ea698ce58a24bd7a5137a32a69794cc" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

# 発表したこと
- Vuexのプラグインは簡単に作れますよ。
- VuexのプラグインはよくsubscribeというストアインスタンスのAPIを使ってます。
- ただし、subscribeのコールバックはmutate後呼ばれますので、もっと早い段階で処理を加えたければ、2.5.0から導入されたAPI(subscribeAction)を使いましょう。
- Vuexのプラグインを探したければ、[awesome-vue](https://github.com/vuejs/awesome-vue)リポジトリはいいところです。

# 尺の関係で話せなかったこと(スライドに入れました)
- 名前通りあくまでsubscribeなんで、いわゆるAOPのような使い方は期待しないでください。
- [vuex-shared-mutations](https://www.npmjs.com/package/vuex-shared-mutations)というタブ間の状態を同期してくれる素晴らしいVuexプラグインがあるが、実は考え方はとてもシンプルです。
- 他にも色んな有用なプラグインがありますよ。
