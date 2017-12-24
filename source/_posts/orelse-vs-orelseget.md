---
title: OptionalのorElseとorElseGet
date: 2017-12-24 22:27:45
language: [japanese]
tags: [java]
category: tech
---

最近Optionalの`orElse`と`orElseGet`の区別は社内でちょっと話題になっていました。これらは同じように見えますが、使い方に気をつけなければハマってしまうかもしれません。まあ、まずJavaDocをみてみましょう。  

# 定義
オラクルのドキュメントの中に`orElse`の定義は[下記のように](https://docs.oracle.com/javase/jp/8/docs/api/java/util/Optional.html#orElse-T-)書かれています。  

> `public T orElse(T other)`  
> 存在する場合は値を返し、それ以外の場合はotherを返します。
> 
> パラメータ:
> other - 存在する値がない場合に返される値、nullも可
> 
> 戻り値:
> 値(存在する場合)、それ以外の場合はother

一方、`orElseGet`は[こんな感じ](https://docs.oracle.com/javase/jp/8/docs/api/java/util/Optional.html#orElseGet-java.util.function.Supplier-)です。

> `public T orElseGet(Supplier<? extends T> other)`
> 値が存在する場合はその値を返し、そうでない場合はotherを呼び出し、その呼び出しの結果を返します。
> 
> パラメータ:
> other - Supplier(値が存在しない場合は、これの結果が返される)
> 
> 戻り値:
> 値(存在する場合)、それ以外の場合はother.get()の結果
> 
> 例外:
> NullPointerException - 値が存在せずotherがnullの場合

やはり説明も似ていますね。でも、nullについての説明は違います。前者の説明の中に、`nullも可`が入っていますが、後者にはそれがなく、逆に`NullPointerException`という例外の説明が入っています。すなわち、`Optional.ofNullable(null).orElse(null)`はnullを返してくれますが、`Optional.ofNullable(null).orElseGet(null)`は例外をスローしてしまいます。  
それはそうでしょう。引数は確実に違うからですね。`orElse`の引数は値で、`orElseGet`はSupplierというラムダ式を取っています。Supplierのgetメソッドに通じて値を取得するので、Supplier自体がnullになってしまったら、NullPointerExceptionがスローされてもおかしくありません。  

# 遅延実行
でしたら、下記のコードの実施結果は同じように思えますよね。

```java
public class MyTest1 {
    private final static Supplier<String> test = () -> {
        final String result = "test";
        System.out.print(result);
        return result;
    };

    public static void main(String[] args) {
        System.out.print(Optional.of("test").orElseGet(test));
    }
}
```

```java
public class MyTest2 {

    private final static String test() {
        final String result = "test";
        System.out.print(result);
        return result;
    }

    public static void main(String[] args) {
        System.out.print(Optional.of("test").orElse(test()));
    }
}
```

実行してみれば、すぐ分かりますが、前者は`test`を出力している一方、後者は`testtest`を出力しています。`test`というSupplier変数はラムダ式であることを忘れてはいけません。Cay S. Horstmannが著書[Java SE 8 実践プログラミング](http://amzn.to/2BtgGHI)の中でラムダ式を紹介する時、「すべてのラムダ式の重要な点は、遅延実行（deferred execution）です。」、「ラムダ式を使用する主な理由は、適切な時期までコードの実行を遅延させることです。」と説明しています。上記の違いはまさにそれを証明する実例になります。もしOptional内の値はnullじゃなければ、`orElseGet`内の式が評価される必要がありません。その為、`System.out.print(result);`が実行されません。当然ながら`test`の出力はありません。

# まとめ
上記のようなコードであれば、まだそんなに問題になりませんが、例えば「Optional内の値はnullの場合、データベースにレコードを挿入し、割り当てられたIDを返す」、「Optional内の値はnullの場合、某APIを叩き、データを取ってくる」みたいなロジックを実装する際に、該当ロジックは常に実行されるので、`orElse`を使ってはいけません。間違って使ってしまうと、速度が大幅に遅くなってしまう上、データの整合性が取れなくなってしまうでしょう。  
要するに、ラムダの「遅延実行」特性をちゃんと覚えようということですね。


