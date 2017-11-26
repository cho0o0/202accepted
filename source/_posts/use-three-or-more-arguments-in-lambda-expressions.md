---
title: ラムダ式で３つ以上の引数に対応しよう
date: 2016-08-01 14:16:00
language: [japanese]
tags: [java, functional-programming]
---

# 引数が2つ以下の場合 
Java8既存のFunctionインターフェースを使えば、うまく対応できます。  
例：  

```java
// 引数が1つしかない
Function<String, String> func1 = (str1) -> str1+"!";
System.out.println(func1.apply("Aha")); //Aha!

// 引数が2つしかない
BiFunction<String, String, String> combineStrings = (str1, str2) -> str1+str2;
System.out.println(combineStrings.apply("Hello ", "World")); //Hello World
```

なお、既存のFunctionインターフェースを分かりやすくまとめてくれた図表を見つけましたので、[転載します](http://blog.orfjackal.net/2014/07/java-8-functional-interface-naming-guide.html)。  

![Java 8 Functional Interface Naming Guide](http://2.bp.blogspot.com/-BxiAtQEbcBE/U8fX-k54krI/AAAAAAAAAR4/ke6Ccy4xf0Y/s4000/Java+8+Functional+Interface+Naming+Guide.png)


# 引数が3つ以上の場合 
## 解決法1:　自作関数型インターフェース 

Java8のFunctionインターフェースにはインプットが3つ以上のインターフェースが提供されていません。  
ならば、Functionインターフェースを自作してみましょう。  
実は、ありがたいことに、Java8がただ単純にインプットが3つ以上の関数型インターフェースを提供してないだけで、(少なくてもOracleとOpenJDKのJavaでは)複数の引数へ対応する準備が整っています。どういうことでしょうか？まず、BiFunctionのソースを見てみましょう。  

```java

@FunctionalInterface
public interface BiFunction<T, U, R> {

    /**
     * Applies this function to the given arguments.
     *
     * @param t the first function argument
     * @param u the second function argument
     * @return the function result
     */
    R apply(T t, U u);

    /**
     * Returns a composed function that first applies this function to
     * its input, and then applies the {@code after} function to the result.
     * If evaluation of either function throws an exception, it is relayed to
     * the caller of the composed function.
     *
     * @param <V> the type of output of the {@code after} function, and of the
     *           composed function
     * @param after the function to apply after this function is applied
     * @return a composed function that first applies this function and then
     * applies the {@code after} function
     * @throws NullPointerException if after is null
     */
    default <V> BiFunction<T, U, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t, U u) -> after.apply(apply(t, u));
    }
}
```

肝心なのは`R apply(T t, U u);`だけです。このapply関数が`java.lang.reflect.Proxy.KeyFactory#apply`で実装されています。  

```java
    private static final class KeyFactory
        implements BiFunction<ClassLoader, Class<?>[], Object>
    {
        @Override
        public Object apply(ClassLoader classLoader, Class<?>[] interfaces) {
            switch (interfaces.length) {
                case 1: return new Key1(interfaces[0]); // the most frequent
                case 2: return new Key2(interfaces[0], interfaces[1]);
                case 0: return key0;
                default: return new KeyX(interfaces);
            }
        }
    }
```
 
ご覧のように、KeyXが存在していて、その中でfor文を使って、interfaceごとに読み込み、レファレンスを作っています。なので、自作関数型インターフェース内でFunctionやBiFunctionと似ている感じでapplyを使えば良いでしょう。  

```java
@FunctionalInterface
public interface TriFunction<T, U, V, R> {
	R apply(T t, U u, V v); // KeyX should be called
}
```

そして、このTriFunctionを使って、３つ以上の引数が存在するケースに対応すると、  

```java
TriFunction<String, Integer, Integer, String> newSubString = (str, start, number) -> 
  str.substring(start-1, str.length() <= start-1+number? str.length(): start-1+number);

String f = newSubString.apply("Hello World", 2, 7);
System.out.println(f); // ello Wo
```

うーん、悪くありません。しかし、もし単純な処理を行いたいだけであれば、わざわざインターフェースを作るなんか少し面倒臭いでしょう。他に方法ないでしょうか。  

## 解決法２：　カリー化 
JavaScriptの経験者であれば、既に思い付いたかもしれません。カリー化すればいいです。では、カリー化とは何でしょうか？ 
>カリー化 (currying, カリー化された=curried) とは、複数の引数をとる関数を、引数が「もとの関数の最初の引数」で戻り値が「もとの関数の残りの引数を取り結果を返す関数」であるような関数にすること（あるいはその関数のこと）である。  

*Wikipediaより*

要するに、Java 8では、関数が変数のように扱うことができますので、戻り値で関数を返す手法が利用できます。  

```java
Function<String, Function<Integer, Function<Integer, String>>> newSubString = (str) -> (start) -> (number) 
  -> str.substring(start-1, str.length() <= start-1+number? str.length(): start-1+number);

		
String f = newSubString.apply("Hello World").apply(2).apply(7);
System.out.println(f); // ello Wo
```

一回目、二回目では関数が返され、そして実行スコップから出ていない為、前の変数がクロージャーで持っていて、次の処理でも使用されます。
こんな感じで既存インターフェースを使うだけで、複数の引数へ対応できるようになりました。  
