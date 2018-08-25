---
title: 「Kotlin Fest 2018」参加レポート
date: 2018-08-25 21:26:51
language: [japanese]
tags: [kotlin]
category: tech
---

Kotlinは趣味でちょろっとしか書いていませんが、Kotlinの哲学である実用主義・簡潔・安全・相互運用性に魅了され、理想と現実のバランスをうまくとっているなと感心しましたので、[Kotlin Fest 2018](https://kotlin.connpass.com/event/91666/)へ参加してきました。とても楽しかったし、勉強にもなった為、レポートとしてまとめたいと思いました。

# Kotlinもう一歩

最初に参加したセッションはヤフーの森さんによる「Kotlinもう一歩」でした。Kotlinのタイプシステムを用いてGenericsとType Projectionを紹介していました。プレゼンの内容をよくまとめたのは下記の一枚です。

<script async class="speakerdeck-embed" data-slide="139" data-id="0e565744058742a0bec85809578db5c8" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

タイプシステムの観点で不変・共変・反変を説明してくれてとても印象的だと感じました。タイプシステムを一言で説明すれば、「タイプAが期待される全ての箇所で、タイプBが使用可能であれば、タイプBはサブタイプだと言える。逆に、タイプAはスーパータイプである。」になります。この一言さえ分かれば、「タイプAは自分自身のサブタイプであり、スーパータイプでもある」ということは理解できるでしょう（ちなみに、これは`isSubtypeOf`と`isSupertypeOf`で検証できる)。また、「`String`は`String?`のサブタイプ」というのもわかるはずです。

# How to Test Server-side Kotlin

実例を交えた説明でわかりやすかったです。特に技術選定時に考えたこととハマったポイントの紹介はとても参考になりました。テストコードを書きやすくする為に作られた[Factlin](https://github.com/maeharin/factlin)と[kotlin-fill-class](https://github.com/suusan2go/kotlin-fill-class)は確かに使いやすそうだなと感じました。

<script async class="speakerdeck-embed" data-id="2abdade602b34c82beb23733132a8bdb" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

全体のイメージとして、Kotlin製のテストライブラリはまだまだ少ないと感じました。ただ、Javaの資産は基本的にそのまま使えるので、それほど困らないです。クラスがFinal、Immutable、Null許容しないなどの特性によってハックしなければいけないケースがあるものの、その場合はOSSで提供されているラッパー(i.e. [mockito-kotlin](https://github.com/nhaarman/mockito-kotlin))かプラグイン(i.e. [all-open](https://kotlinlang.org/docs/reference/compiler-plugins.html))、もしくはコード上の設定(i.e. `@JvmStatic`)を使えば大体回避できます。

# Kotlin Linter

KotlinのLinterについて、一番主流の[ktlint](https://github.com/shyiko/ktlint)しか知りませんでした。実際にktlint以外、[detekt](https://github.com/arturbosch/detekt)(detectの意味?w)とアンドロイド用のandroid-lintが存在します。その比較は下記のスライドにてまとめられています。

<script async class="speakerdeck-embed" data-slide="148" data-id="7b962f63e61c42f6b42db2a8482be3d7" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

ktlintと比べてdetektは標準ルールがたくさんありますし、個別の設定ができるし、メッセージ表示も詳しいです。さらに、detekt-formattingを使えばktlintのルールすらサポートできてしまいます（formattingと言いつつも、自動フォーマットと無関係）。整形できないのは状況によって痛いかもしれませんが、選択肢として考えられますね。  
また、ktlintのカスタムルールの作成方法は以下のようになります。  

1. Rule抽象クラスを継承したカスタムルール用のクラスを作成し、visitメソッドを実装する
2. RuleSetProviderを継承したカスタムプロバイダークラスを作成し、ルールを登録する
3. カスタムプロバイダーの情報をメタファイルに記述し、Jar化する

detektの場合、issue（サマリー情報）を作成する必要があります。さらに、visitのパターンは複数存在していて選ぶ必要があります。それ以外は大体一緒です。

# Kotlinで愛でるMicroservices

<script async class="speakerdeck-embed" data-id="8b7d8bd62d2b4a64966d3762c1923678" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

こちらはFRESHLiveの実例紹介でした。マイクロサービスを採用した理由は以下の２点らしい。

1. 可用性の向上と障害の局所化
2. サービスごとに違う言語と技術が使える

FRESHLiveはほとんどGolangで書かれていましたが、APIをGoでいっぱい書いてくのは辛い（筋肉痛）らしく、gRPCサポート・高階関数／拡張関数／データクラスがある・Null安全のJavaが欲しくなったわけです。よって、Kotlinを採用し始めました。Router Function DSLでRESTful APIを書いているのは印象的でした。マイクロサービスっぽい話は少ししか触れませんでした。パッケージングは[helm](https://www.helm.sh/)を使っていて、prometheus/JVM micrometerを使って監視を行っているそうです。

# How to Kontribute

磯貝さんによるコントリビュートしかたの紹介です。Kotlinのリポジトリをクローンすることや、IDEとプラグインを用意することは特に目新しくないですが、JDK10だけじゃなく1.7、1.6まで必要だそうで、大変だなと思いました。  
[公式youtrack](https://youtrack.jetbrains.com/issues/KT)から__up-for-grabs__タグがついているIssueをとって作業し、GitHub上でPRを出すのは一般的なワークフローみたいです。わからないことがあったら、[Slack](slack.kotlinlang.org)の`#kontributors`チャンネルで聞けば良いらしいです。  
基本的には以下のステップを踏んでコントリビュートすれば挫折しなさそうです。

1. Readmeを更新する
2. [ライブラリの公式ドキュメント](https://kotlinlang.org/api/l/jvm/stdlib/index.html)を更新する
3. [サンプル](https://youtrack.jetbrains.com/issue/KT-20357)を作成する
4. プラグインを開発する(特にinspection機能の開発が多いらしいです)

Kotlinのみならず、他のOSSでも適用できそうな手順ですね。

# Kotlin コルーチンを理解しよう

このセッションは残念ながら聞けませんでしたが、とても気になっていたので、スライドをチェックしてみました。

<script async class="speakerdeck-embed" data-id="237e32d7cf2a40e19e84951de4804f7d" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

紹介編かなと思っていましたが思ったより深く触れていたようです。ただ、KotlinConf 2017のプレゼン（[Introduction to Coroutines by Roman Elizarov](https://youtu.be/_hfBv0a09Jc)、[Deep Dive into Coroutines on JVM by Roman Elizarov](https://youtu.be/YrrUCSi72E8)）と被ってそうな内容だと感じました。

# その他

![Kotlin Fest 2018](https://i.imgur.com/VoOCxa7.jpg)

各スポンサーのノベルティはすごく豪華でした。サーバーエージェントさんとミクシィさんがKotlinのクイズゲームを企画していたのは新鮮で面白かったです。特にミクシィさんから頂いたプランニングポーカーは今後使えそうですね（[ここ](https://kotlinquiz.com/)より抜粋した問題らしい）。  
食事が美味しかった上、お菓子、デザート、飲み物まで無料で提供されていたのは最高でした。  
唯一の不満で言えば、Wifiですかね。こういう大規模なイベントでWifiの接続が不安定になったり、繋がりにくくなったりしますよね。施設より提供しているWifiと別に、イベントの為に用意する必要がありそうと思いました。  
今年のKotlinConfはアムステルダムで行うようでチェックしてみましたが、チケットはすでに完売になったみたいです。来年の今、実務でKotlinを使えて、KotlinConfに参加できたらいいなと思いましたね。  