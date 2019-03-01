---
title: JestでDateのコンストラクタをモックする
date: 2019-03-02 00:12:15
language: [japanese]
tags: [jest, typescript]
category: tech
---

下記の関数があるとしましょう。

```typescript
function calcDuration(date: string) {
  return Math.abs(new Date().getFullYear() - new Date(date).getFullYear());
}
```

この関数のテストを書くのに、注意しなければいけないことが1点あります。もう気づいたと思いますが、`new Date()`の結果を固定値にしないと、テストの結果が実行時の日付に依存してしまいますので、環境依存が発生し許容できないでしょう。Jestにはモジュールモックを含め、[いくつのやり方](https://jestjs.io/docs/en/mock-functions.html)がありますが、標準ビルトインオブジェクトかつコンストラクタの場合、どうモックするか、ドキュメントには詳しく書かれませんでした。ウェブで検索してみた[結果](https://stackoverflow.com/q/52828824/6279569)、`jest.spyOn(global, 'Date')`という感じで書くのは一番直感的で柔軟性が高いと感じました。よって、テストのコードはこうなるかと思います。

```typescript
test("mock", () => {
  const dateToUse = new Date("2015-01-01");
  jest.spyOn(global, "Date").mockImplementation(() => dateToUse);
  const duration = calcDuration("2011-01-01");
  expect(duration).toBe(4);
})
```

しかし、上記のコードの実行結果は`[Jest] Expected value to be (using Object.is): 4, Received: 0`というエラーになるでしょう。理由は簡単です。`calcDuration`関数内で`Date`コンストラクタは二回も呼ばれ、そして常に`dateToUse`が返ってきます。よって、差分が0になるのは正しい振る舞いです。そこを修正する為に、`mockImplementation`にて条件分岐を作ればシンプルに解決できます。引数が空の場合`dateToUse`を返し、それ以外は元々のビルドインオブジェクトを使わせます。結果は下記の感じです。

```typescript
test("mock", () => {
  const OriginalDate = Date;
  const dateToUse = new Date("2015-01-01");
  const mocked = jest.spyOn(global, "Date").mockImplementation((arg) => {
    return arg ? new OriginalDate(arg) : dateToUse;
  });
  const duration = calcDuration("2011-01-01");
  expect(mocked).toHaveBeenCalledTimes(2);
  expect(duration).toBe(4);
});
```

他に`mockImplementationOnce`でやる方法も考えられますが、実装を意識しないと書けなさそうと思いましたので、上記のやり方を採用することにしました。