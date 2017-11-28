---
title: ポリモーフィズムクイズ
date: 2016-12-26 14:12:00
language: [japanese]
tags: [java]
category: tech
---

# 問題

```java
class MyTest
{
	private static class A {
		String message = "hello";
		Consumer<String> hello = s -> System.out.print(message + s);
		void hello(String s) { this.hello.accept(s); }
	}
	
	private static class B extends A {
		String message = "ハロー";
		void hello(String s) { this.hello.accept(s); }
	}

	public static void main(String[] args) {
		A b = (A) new B();
		b.hello(" world");
		System.out.print("/");
		b.hello.accept(" world");
	}
}
```

上記のコードの実行結果は

- [ ] A. ハロー world/hello world
- [ ] B. ハロー world/ハロー world
- [ ] C. hello world/ハロー world
- [ ] D. hello world/hello world
- [ ] E. コンパイルエラー


# 正解
答えは

- [x] D. hello world/hello world


# 説明
一見複雑そうですが、実はポリモーフィズムをちゃんと理解できれば、すぐ解けるはずです。それでは、`main`メソッドの処理を追って見ましょう。  
- `main`メソッドの一行目では`A`型`B`実装の変数`b`を宣言しました。`(A)`というアップキャストの処理が書かれていますが、実はコンパイラが自動的に行ってくれる作業なので、ただの目障りで意味がありません（勿論エラーにもなりませんが・・）。
- `b`のメソッドを利用する際に、コンパイラはまず実装型にそのメソッドがあるかどうかを見ます（二行目）。クラス`B`に`hello`というメソッドがありましたね。オーバーライドが明記されていませんが、シグネチャに違いがない為、親クラスの`hello`メソッドがオーバーライドされていることは分かります。ポリモーフィズムのルールによりクラス`B`の`hello`メソッドが実行されます。
- `hello`いうメソッドは`hello`というコンシューマー関数のフィールドを呼んでいますが、残念ながら`A`クラスにしか`hello`が存在しません。その為、やむを得ず`A`クラス内の`hello`関数を利用することになります。（ちなみに、メソッド名とフィールド名の重複は許されますので、コンパイルエラーになりません）
- `hello`という関数は`message`というフィールドを使います。クラス`A`の`message`は`hello`ですので、出力結果は`hello world`になります。クラス`B`にも`message`というフィールドが存在しますが、今使っている`hello`関数とは無関係ですね。
- さらに`main`の四行目ですが、`b`オブジェクトの`hello`関数を利用しているように見えますね。しかし、フィールド変数のオーバーライドが存在しないことを忘れてはいけません。`hello`関数は`hello`メソッドと同じく処理手続きを定義するものですが、本質的には`message`のようなフィールド変数です。その為、どのフィールドが利用されるかは宣言時の参照型によります。`A`として宣言された為、クラス`A`の`hello`関数が利用され、二行目の出力結果と同じようになります。

# 参考
- https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html
- https://docs.oracle.com/javase/jp/8/docs/api/java/util/function/Consumer.html

