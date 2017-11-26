---
title: Hexoブログのカスタムホームページの作り方
date: 2017-11-26 22:14:22
language: [japanese]
tags: [hexo]
---

# 背景
デフォルトの設定でHexoのブログを作っている場合、ホームページ(index)がすでに存在しています。かなり便利でありがたい機能ですが、カスタマイズしようとしたら、手数がやや掛ってしまいます。  
具体的に言うと、テーマ内の`index.ejs`ファイルに記入されているコードは`layout.ejs`の`<%- body %>`に入ります。すなわち、indexページのレイアウトは`index.ejs`のほか、layoutフォルダ内の`layout.ejs`にも左右されます。別に悪い仕様とは全然言えませんが、ホームページだけは通常のテンプレートに適用されたくないというユースケースもあるでしょう。  
それを回避するために、HexoのGitHub上のIssueを調査したり、何回か試したりして、ようやく分かりましたので、ここで整理してみたいと思います。  

# 手順
1. `hexo-generator-index`というプラグインを削除します。自分でインデックスページを作るので、当然ながら自動生成の機能は不要になります。Hexoプロジェクトのルートディレクトリに行って、`npm uninstall hexo-generator-index`を打てば問題ないはずです。  
2. sourceフォルダーの中で`index.md`というファイルを作ります。こちらのファイルはエントリーポイントになります。
3. `layout.ejs`内に以下のような条件分岐を加えます。  


```ERB
    <% if (page.source == 'index.md') { %>
      <span>こちらはホームページのテンプレート</span>
    <% } else{ %>
      <span>こちらはその他のページのテンプレート</span>
    <% } %>
```

# 参考リンク
- https://github.com/hexojs/hexo/issues/887
- https://github.com/hexojs/hexo/issues/959
- https://github.com/hexojs/hexo/issues/1491
