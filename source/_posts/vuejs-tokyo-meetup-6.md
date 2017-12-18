---
title: 「Vue.js Tokyo v-meetup ＃6」参加レポート
date: 2017-12-14 23:05:16
language: [japanese]
tags: [vue.js]
category: tech
---

![Vue.js Tokyo v-meetup #6](https://connpass-tokyo.s3.amazonaws.com/thumbs/ec/c6/ecc6672d65b7f4e1c1562d6681bb9a29.png)

12月13日に開催された「[Vue.js Tokyo v-meetup #6](https://vuejs-meetup.connpass.com/event/69761/)」に参加してきました。前回のMeetupがVue.jsを用いたサーバーサイドレンダリングの魅力を見せてくれたと言えるなら、今回のMeetupは2017年、Vue.jsのエコシステムがますます繁栄してきたアピールになった年と言えるのではないでしょうか。開発環境、テストツール、コーディング規約、UIフレームワーク、強力な公式サポートのおかげでWebのフロントエンド開発における欠かせないものを全部用意してくれています。一年前と比べて、今のVue.jsはすでにフロントエンドのギークたちのオモチャから、プロダクションレディで成熟したフレームワークになってきていると実感しています。  

# TypeScriptサポート  

![TypeScript + Vue.js](https://cdn-images-1.medium.com/max/1600/1*vB-z-t961mJnd4a6re02Iw.png)

Vue.jsのバージョン2.4まで、Vue.jsにおけるTypeScriptのサポートは不足していました。TypeScriptでVue.jsプロジェクトを作成すること自体は問題ないですが、型定義の恩恵は受けにくい状況だったように感じます。@maeharinさんが[発表](https://speakerdeck.com/maeharin/10nian-qian-falseregasisisutemuwovue-dot-js-typescript-elementdehururiniyuarusiteiruhua-number-vuejs-meetup6)の中で紹介して頂いたように、Vue.js2.5以前、object型構文の内ではthisの型推論はできませんでした。そもそも、TypeScriptはこのような推論をサポートしていませんでしたので、Vue.js側のサポートも厳しかったでしょう。とは言え、Vue.jsの場合、「[vue-class-component](https://github.com/vuejs/vue-class-component)」を利用しない限り、object型構文は基本なので、かなり致命的な問題だったと考えられます。めでたいことに、TypeScriptのプルリクエスト[#14141](https://github.com/Microsoft/TypeScript/pull/14141)によって、objectリテラル内のthisの型推論が可能になりました。そして、Vue.jsのプルリクエスト[#6391](https://github.com/vuejs/vue/pull/6391)において、型定義の追加を含み、TypeScript向けの改善が行われた為、バージョン2.5以降、Vue.js+TypeScript開発が一気に便利になってきました。例えば、プロパティの補完とタイプミスを避けるために、@maeharinさんがプロジェクトの中にAPIの型定義を入れました。[swagger-codegen](https://github.com/swagger-api/swagger-codegen)というツールを使い、RubyクライアントとTypeScriptの定義を自動生成できました。自動生成されたTypeScriptの型定義はフロントの開発で利用されていますので、非常に効率の良い開発を行ったようです。ちなみに、swagger-codegenで使用されるAPI定義ファイルも[SpringFox](https://github.com/springfox/springfox)によって自動生成されているため、無駄な重複作業がかなり排除できたんじゃないかと思います。  

# Visual Studio Code + Vetur

![Visual Studio Code](https://upload.wikimedia.org/wikipedia/commons/f/f3/Visual_Studio_Code_0.10.1_icon.png)

Web開発を行う際に、使いやすい開発環境は非常に大事な要素になっています。Vue.js0.1Xの時代からAtomやSublime Text上のプラグインがすでに提供されて来ましたが、自動補完が足りなかったり、Lintができなかったり、とても使いやすいとは言えないでしょう。しかし、これらの問題はVSCodeの素早い進化とプラグイン[Vetur](https://github.com/vuejs/vetur)の登場によって解消されました。今回の会場提供者でもある、マイクロソフトの井上さんがデモの中に見せて頂いたように、VSCode+VeturコンビでVue.jsの開発を行えば、デバッグを含み、IDE並の開発体験ができるはずです。VSCodeがデフォルトでサポートしているEmmetと前述のTypeScript（実は、マイクロソフトは[TypeScript-Vue-Starter](https://github.com/Microsoft/TypeScript-Vue-Starter)というテンプレートを提供していますよ）を使えば、さらにスムーズな開発が期待できますね。  

# UIフレームワーク

![Element UI](http://element.eleme.io/static/guide.0a8462c.png)

TypeScriptの話と別に、@maeharinさんがスライドの中で、UIフレームワークである[Element](http://element.eleme.io/)を絶賛していました。Elementは中国のウェブベンチャーElemeが主導して開発したVue.jsのUIフレームワークです。デザインがシンプルで、多くのUIコンポーネントが提供されているため、人気を博し、Vue.jsのUIフレームワークの中で、もっとも人気があるフレームワークのひとつです。`Vue.use`の中にロケールの設定と一緒に入れるだけで日本語がサポートされるし、Veturの自動補完にも対応しています。さらに、各コンポーネントの設定項目が豊富で、バリデーションもかなりやりやすいそうです。Vue.jsのプロジェクトを試しに作りたい場合、Elementと組み合わせれば、素早く開発できそうな予感がしますね。当然ながら、Vue.jsのUIフレームワークはこの一つだけではありません。例えばスライドの中に挙げて頂いた、グーグルのマテリアルデザインに従っている[vuetify](https://vuetifyjs.com/)や、Bootstrapスタイルの[bootstrap-vue](https://bootstrap-vue.js.org/)などもそれなりに成熟できているので、迷ってしまうほど多くの選択肢があると思います。  


# コーディング規約とリンター

[![eslint-plugin-vue](https://lh4.googleusercontent.com/xEOUw3_WrT-HnGqwrMuS9NdwKdNeqwMF953FieE50GkCBSsGSgBW4feQfgNrSxUC3RpjRA=w1200-h630-p)](https://docs.google.com/presentation/d/1nJ8gsRr_-lxzCprLu8CU0FwloXSNdU0QKk-kP42k40k/)

複数人による大規模な開発の場合、可読性やメンテナンスのしやすさは重要なポイントです。そのため、ソフトウェア開発工程の中で、コーディング規約は欠かせないものです。当然ながら、プロントエンドのプロジェクトも例外ではありません。純粋なJavaScriptなら、[Airbnb](https://github.com/airbnb/javascript)と[Standard JS](https://standardjs.com/)は最も高い人気を誇っていますが、フレームワークの場合、Reactが圧倒的な優位に立っています。AirbnbがReactを採用しているため、2015年に「[Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/blob/master/react/README.md)」を公開し、すでに多くの開発現場で使用されているそうです。また、ESlintのプラグインである「[eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react)」も同時期に登場したため、「[eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb)」と合わせて利用すれば、コーディング規約とリンターの設定を心配する必要がありません。それに対し、Vue.js界ではそれほど優れたプラグインや普及できている規約がなく、羨むしかできませんでした。しかし、こんな状況は改善されつつあります。まず、公式スタイルガイドがつい最近[リリース](https://jp.vuejs.org/v2/style-guide/)しました（まだBeta版ですが・・）。必須、強く推奨、推奨、使用注意、四段階に分けて様々なルールが盛り込まれています。それに、わざわざ静岡からお越しになった@mysticateaさんが自ら開発している「[eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)」も公開になりました。ルールはまだ追加中ではありますが、すでに数十種類を備えているため、十分に使えると思います。例えば、「no-parsing-error」というルールはHTMLやテンプレートの埋込式に構文エラーが無いかチェックしてくれますので、JavaScriptじゃなくてもeslintの恩恵が受けられます。公式スタイルガイド内のルールをサポートする予定なので、かなり期待できますね。ちなみに、現在開発リソースがまだ足りていない状況のようですので、興味ある方ぜひ参加してみてください。  

# ユニットテスト

![テスト](https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Creative-Tail-test_tube_2.svg/128px-Creative-Tail-test_tube_2.svg.png)

実はVue.jsのユニットテストに関して、「v-meetup #4」の時、@hypermktさんが一回[発表](https://speakerdeck.com/hypermkt/vuekonponentofalseyunitutotesuto)を行っていました。しかし、公式テストツールはまだ開発段階だった為、@hypermktさんはavoiazの紹介をしていました。約半年後の今、公式テストツールであるvue-test-utilsはすでに[v1.0.0-beta.8](https://github.com/vuejs/vue-test-utils/releases/tag/v1.0.0-beta.8)になり、だいぶ安定して来ました。@lmiller1990さんが[発表](https://github.com/lmiller1990/lt-demo)の中で、コンポーネントの分離（shallow機能）、イベントのシミュレーション（trigger機能）、データの設定（setData機能）およびvuexのサポートを実演しながら紹介して頂きました。開発の中で、コンポーネント間の依存が複雑になるケースが多々あると思いますので、コンポーネントを切り離すことはユニットテストを行う際に不可欠な一歩だと考えています。これらの機能を使えば、その作業がある程度便利になります。vue-test-utilsの開発はavoiazの作者が主導している為、avoiazの良いところを継承しています。今Vue.jsのユニットテストツールを検討しているのであれば、vue-test-utilsは恐らく一番妥当な選択だと思います。

# その他

<script async class="speakerdeck-embed" data-slide="19" data-id="7d437d38c31b46318998d120b2d9c929" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

Vue.jsのエコーシステムはこれだけではありません。上記のプロジェクト以外にも、注目すべきなプロジェクトがたくさんあります。例えば、私が気になっている「[vue-component-compiler](https://github.com/vuejs/vue-component-compiler)」はもうすぐ世に出るそうです。今までVue.jsシングルファイルコンポーネントのコンパイルロジックはプロジェクト依存でした。その為、単独利用が難しく、コンパイルロジックを使ったちょっとした拡張がやりにくかったです。「vue-component-compiler」が使えるようになれば、バンドルツールに依存せずコンポーネントのコンパイラの使用が可能になり、[Parcel](https://parceljs.org/)のような新しいバンドルツールにも迅速に対応できるようになるでしょう。また、@kazuponさんの発表の中にもあったように、公式クックブックとvue-cliの刷新プロジェクトもすでに動き出したそうで、Vue.js本体のメインバージョンアップも予定されているようです。Vue.jsのさらなる進歩が楽しみですね。

# まとめ
2017年のウェブ開発において、JSフレームワークの利用はようやく定着化してきたと思います。特に、Vue.jsは直感的で理解しやすいというメリットを持ち、多くの支持を得ることができました。今回のMeetupの中で、@lovalottaplusさんがデザイナーさんにVue.jsを使用してもらう[事例](https://docs.google.com/presentation/d/1s1clv2XmtQRI6izjbsWJjpkYrfk0ALUEuKVoaPVwjwg/)を紹介して頂きました。コンポーネントを活用し、内部ロジックをうまく隠蔽すれば、プログラミング知識がそれほど豊富じゃないデザイナーでも開発できることはとても印象的でした。これはまさにVue.jsがずっと提唱して来たプログレッシブの好例だと思います。触りくらいなら、既存コンポーネントを使用すればすぐ開発できる、遠くまで行きたければ、TSなりRxJSなり使ってもよし・・・多種多様なケースに対応できることはVue.jsの長所であり、それに加え、エコシステムのより一層の充実により、2018年のVue.jsには更に期待できそうですね。  
今回のMeetupは本当に有益でした、次回のMeetupも楽しみにしています。頑張ってLT枠を取りたいですね（笑）

_今回の記事は同僚のこうめいさんに査読して下さいました。本当にありがとうございました。_