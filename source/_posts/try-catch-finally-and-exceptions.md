---
title: try-catch-finally、try-with-resources、そして発生した例外たち
date: 2016-11-15 12:00:00
language: [japanese]
tags: [java]
category: tech
---

# 問題

下記のコードの出力内容はどんな感じでしょうか？  

```java
public class Test {
    public static void main (String[] args) throws Exception {
        try {
            run();
        } catch(Exception e) {
            printSuppressedExceptions(e, "-");
        }
    }

    public static void printSuppressedExceptions(Throwable t, String s) {
        System.out.println(s + t + " suppressed " + t.getSuppressed().length + " exception/exceptions.");
        if(t.getSuppressed().length != 0) {
            for (Throwable ts : t.getSuppressed()) {
                System.out.println(s + ts + "[ is suppressed by ]" + t);
                printSuppressedExceptions(ts, s + s);
            }
        }
    }
    
    public static String run() throws Exception {
        try(MyResource r = new MyResource("resource 1");
            MyResource r2 = new MyResource("resource 2");   
            ) {
            return System.out.printf("return from try\n").append("",1,2).toString();
        } catch(Exception e) {
            printSuppressedExceptions(e, "*");
            throw e;
        } catch(Throwable t) {
            System.out.println("print from 2nd catch block");
            return "return from 2nd catch block";
        } finally {         
            new MyResource("resource 3").close();
            new MyResource("resource 4").close();
        }
    }       
}

class MyResource implements AutoCloseable {
    private final String name;

    public MyResource(String name) {
        this.name = name;
    }

    @Override
    public void close() throws Exception {
        throw new Exception("exception" + " from " + this.name);
    }
}
```

# 分析
これを回答するのに、以下の内容を把握する必要があります。

## １．System.out.printf(String)に戻り値が存在します？
[Javadoc](https://docs.oracle.com/javase/jp/8/docs/api/java/io/PrintStream.html)を調べれば分かりますが、`PrintStream#printf`は`PrintStream#print`や`PrintStream#println`と違い、戻り値はPrintStreamになっています。  
一見あんまり意味がなさそうですが、コンソールへの出力が可能でありながら**式**として扱える為、**文**としてしか扱えない`System.out.println`なんかより用途が多いはずです。

```java
class Test
{
	public static void main (String[] args)
	{
		if(System.out.printf("hello, ") != null) {
			System.out.println("world");
		}
	}
}
```

例えば、上記のコードの出力値は`Hello, world`になりますね。

そして、PrintStream型である為、appendメソッドを使用することが可能です。しかし、二つ目の引数と3つ目の引数の大きさに気をつけなければ、お馴染みのStringBuilderと同じく、StringIndexOutOfBoundsExceptionが発生してしまうかもしれません。

## ２．try-with-resources文で宣言したリソースのクローズ順番は？
tryブロック内に例外が発生した場合、try-with-resources文の内で宣言したリソースは閉じられるのでしょうか？答えはYesになります。
そうじゃなければ、データベースに関する処理を行う時に例外が発生してしまったら、データベースのコネクションなどが開かれたままになる恐れがありますね。  
どういう順番で閉じられるかといいますと、宣言時の**逆順**で行います。例えば、下記の文では、r2が先に閉じられ、r1がその次になります。

```java
public class Test {
    public static void main (String[] args) {
        run();
    }
    
    public static void run() {
        try(MyResource r = new MyResource("resource 1");
            MyResource r2 = new MyResource("resource 2");
            ) {
           
        } catch(Exception e) {

        }
    }       
}

class MyResource implements AutoCloseable {
    private final String name;

    public MyResource(String name) {
        this.name = name;
    }

    @Override
    public void close() throws Exception {
        System.out.println(this.name);
    }
}
```

そのため、この例の出力は以下のようになります。

```
resource 2
resource 1
```

## ３．try-with-resources内のリソースが閉じられる時に、例外が発生したらどうなります？
例外を一旦置いといて、次のリソースを閉じに行きます。すなわち、リソースの宣言さえすれば、**必ず**閉じてくれます（バーチャルマシンが死んでしまったなど、異常な状況を除く）。では、次のリソースを閉じる時に、例外がまた発生してしまったらどうなります？この時は1.7より導入されたSuppressed Exceptions（抑制済み例外）の出番です。二つ目の例外が一つ目の例外に抑制られ、一つ目の例外の「抑制済み例外リスト」に加えられます。この「抑制済み例外リスト（Throwableの配列）」は[getSuppressed](https://docs.oracle.com/javase/jp/8/docs/api/java/lang/Throwable.html#getSuppressed--)というメソッドより呼び出されられます。

```java
class Test
{
	public static void main (String[] args) throws java.lang.Exception
	{
		try(
			MyResource r1 = new MyResource("resource 1");
			MyResource r2 = new MyResource("resource 2");
		){
			
		} catch(Exception e) {
			System.out.println(e);
			for(Throwable t: e.getSuppressed())
				System.out.println("**" + t + "**");
		}
	}
}

class MyResource implements AutoCloseable {
    private final String name;

    public MyResource(String name) {
        this.name = name;
    }

    @Override
    public void close() throws Exception {
        throw new Exception("exception" + " from " + this.name);
    }
}
```

となると、上記のコードの実行結果がこのようになることは容易に理解できるはずですね。

```
java.lang.Exception: exception from resource 2
**java.lang.Exception: exception from resource 1**
```

## ４．tryのブロックに例外が発生したらどうなります？
tryブロック内に例外が発生する可能性は一番高いですね（じゃないと、そもそもなぜtryを使うでしょう）。  
tryブロック内に例外が発生したら、まずtry-with-resourcesのリソースが閉じられます。それからcatchブロック内の文が順番に実行されます。  
「try-with-resources」のブロックと「try」のブロックから例外が飛んできた場合、「try-with-resources」で発生した例外が抑制されます。今の例を少し改造して実行してみれば一目瞭然ですね。  

例：  

```java
class Test
{
	public static void main (String[] args) throws java.lang.Exception
	{
		try(
			MyResource r1 = new MyResource("resource 1");
			MyResource r2 = new MyResource("resource 2");
		){
			System.getProperty("");			
		} catch(Exception e) {
			System.out.println(e);
			for(Throwable t: e.getSuppressed())
				System.out.println("**" + t + "**");
		}
	}
}

class MyResource implements AutoCloseable {
    private final String name;

    public MyResource(String name) {
        this.name = name;
    }

    @Override
    public void close() throws Exception {
        throw new Exception("exception" + " from " + this.name);
    }
}
```

  
結果：
```
java.lang.IllegalArgumentException: key can't be empty
**java.lang.Exception: exception from resource 2**
**java.lang.Exception: exception from resource 1**
```

## ５．複数のcatchブロックが存在する時、そいつらの関係は？
下のcatchが上のcatchブロック内に発生した例外をキャッチすることはできません。catch文はtryの例外を処理するもので、お互いに例外を投げられません。catchブロック内で例外が発生したら、一層上に投げられます。  
しかし、上のcatchがハンドリングできない例外は下に任せることができます。その逆は不可です。

```java
・・・
try {
   System.out.println("0");
} catch(Excption e) {
   System.out.println("1");
} catch(IOException ioe) {
   System.out.println("2");
}
・・・
```

はコンパイルエラーになります。下のcatchブロックは到達不可能だからです。

## ６．finallyを加えたらどうなります？
まず、tryの下に、finallyを加えたら、finallyブロック内の文は実行するのでしょうか？答えはYesです。  
スレッドが死んだ時や`System#exit`が呼ばれたなど、とても珍しい状況じゃなければ、finallyは必ず実行されます。  
そしたら、finallyブロックに例外が発生した場合、tryブロックとtry-with-resourcesから投げられてきた例外はどうなるでしょう？  
finallyで発生した例外以外の例外は無視されます。つまり、**消えてしまいます**。try-with-resourcesの場合、例外は「抑制済み例外リスト」に入れられますが、それは1.7以降から導入された内容で、従来のtry-catch-finallyはそれを使用していません。  

```java
class Test
{
	public static void main (String[] args) {
		try {
			run();
		} catch(Exception e) {
			System.out.println(e);
			System.out.println(e.getSuppressed().length);
		}
	}
	
	private static void run() throws Exception {
		try(
			MyResource r1 = new MyResource("resource 1");
			MyResource r2 = new MyResource("resource 2");
		){
			System.getProperty("");
		} finally {
			new MyResource("resource 3").close();
		}
	}
}

class MyResource implements AutoCloseable {
    private final String name;

    public MyResource(String name) {
        this.name = name;
    }

    @Override
    public void close() throws Exception {
        throw new Exception("exception" + " from " + this.name);
    }
}
```

というコードの実行結果は下記のようになります。

```
java.lang.Exception: exception from resource 3
0
```

それに、finallyは最後に実行する為、finallyブロック内で発生した例外は上へ投げられます。つまり、例外が発生したら、それ以降のコードは実行されない恐れがあります。finallyは必ず実行されますが、**finally内の全ての文は必ず実行されるわけではありません**。その為、finallyの中でtry-catchを行うコードが良く見かけます。  

# 回答
以上の内容を理解できたら、最初に出てきた問題の結果がわかるようになるでしょう。

```
return from try
*java.lang.StringIndexOutOfBoundsException: String index out of range: 2 suppressed 2 exception/exceptions.
*java.lang.Exception: exception from resource 2[ is suppressed by ]java.lang.StringIndexOutOfBoundsException: String index out of range: 2
**java.lang.Exception: exception from resource 2 suppressed 0 exception/exceptions.
*java.lang.Exception: exception from resource 1[ is suppressed by ]java.lang.StringIndexOutOfBoundsException: String index out of range: 2
**java.lang.Exception: exception from resource 1 suppressed 0 exception/exceptions.
-java.lang.Exception: exception from resource 3 suppressed 0 exception/exceptions.
```

# ボーナス
抑制されたのに、その情報が揉み消されるなんてイヤですね。[addSuppressed](https://docs.oracle.com/javase/jp/8/docs/api/java/lang/Throwable.html#addSuppressed-java.lang.Throwable-)というメソッドを利用すれば、自ら抑制済み例外リストに追加することが可能です。

```java
public class Test {
    public static void main (String[] args) throws Exception {
        try {
            run();
        } catch(Exception e) {
            printSuppressedExceptions(e, "-");
        }
    }

	public static void printSuppressedExceptions(Throwable t, String s) {
		System.out.println(s + t + " suppressed " + t.getSuppressed().length + " exception/exceptions.");
		if(t.getSuppressed().length != 0) {
			for (Throwable ts : t.getSuppressed()) {
    			System.out.println(s + ts + "[ is suppressed by ]" + t);
    			printSuppressedExceptions(ts, s + s);
			}
		}
	}
	
    public static String run() throws Exception {
        Exception ex = null;
        try(MyResource r = new MyResource("resource 1");
        	MyResource r2 = new MyResource("resource 2");	
        	) {
        	return System.out.printf("return from try\n").append("",1,2).toString();
        } catch(Exception e) {
        	ex = e;
        	throw ex;
        } finally {
        	try(
        		MyResource r3 = new MyResource("my resource 3");
                MyResource r4 = new MyResource("my resource 4");
        		) {
        		
        	} catch(Exception e) {
        		if(ex != null) e.addSuppressed(ex);
        		throw e;
        	}
        }
    }   	
}

class MyResource implements AutoCloseable {
    private final String name;

    public MyResource(String name) {
        this.name = name;
    }

    @Override
    public void close() throws Exception {
        throw new Exception("exception" + " from " + this.name);
    }
}
```

上記のコードの実行結果はこんな感じです。

```
return from try
-java.lang.Exception: exception from my resource 4 suppressed 2 exception/exceptions.
-java.lang.Exception: exception from my resource 3[ is suppressed by ]java.lang.Exception: exception from my resource 4
--java.lang.Exception: exception from my resource 3 suppressed 0 exception/exceptions.
-java.lang.StringIndexOutOfBoundsException: String index out of range: 2[ is suppressed by ]java.lang.Exception: exception from my resource 4
--java.lang.StringIndexOutOfBoundsException: String index out of range: 2 suppressed 2 exception/exceptions.
--java.lang.Exception: exception from resource 2[ is suppressed by ]java.lang.StringIndexOutOfBoundsException: String index out of range: 2
----java.lang.Exception: exception from resource 2 suppressed 0 exception/exceptions.
--java.lang.Exception: exception from resource 1[ is suppressed by ]java.lang.StringIndexOutOfBoundsException: String index out of range: 2
----java.lang.Exception: exception from resource 1 suppressed 0 exception/exceptions.
```

finallyのtry-with-resourcesブロック内の例外は同じブロック内の例外とtryブロック内を例外を抑制し、tryブロック内の例外はrunメソッド内のtry-with-resourcesブロックから出てきた例外を抑制していることが分かります。

# 終わりに
長文になりましたが、

- 実行順番：  
try-with-resources内の宣言文（上から下へ）⇒try内の文⇒try-with-resourcesのcloseメソッド（下から上へ）⇒catch内の文⇒finally内の文
- 例外優先度：  
finally内の例外⇒_消化_⇒try内の例外⇒_抑制_⇒try-with-resources内の例外
- finallyは取扱注意：  
tryとcatchブロック内の例外か戻り値を上書きする為、returnのようなものを入れることは論外です。

と覚えればいいかと思います。

# 参考になったページ
1. https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html
2. http://stackoverflow.com/questions/40503733/suppressed-exception-disappeared-when-using-finally
3. http://stackoverflow.com/questions/10736238/in-a-finally-block-can-i-tell-if-an-exception-has-been-thrown
4. http://stackoverflow.com/questions/2309964/multiple-returns-which-one-sets-the-final-return-value
