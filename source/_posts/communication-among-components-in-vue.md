---
title: コンポーネント間イベント通信の方法を変更しよう
date: 2016-08-30 12:50:00
language: [japanese]
tags: [vue.js, javascript]
---

# 背景
今までVue.jsのコンポーネント間のイベント通信を行わせる時に、`$dispatch()`と`$broadcast()`を用いたことが多いです（Vue.js及びコンポーネントについては[公式ページ](http://vuejs.org/guide/)をご参考ください）。しかし、これらはVue.js 2.0で廃止される予定です[^1]。コンポーネントのツリー構造の膨大化によって追跡が難しくなることと兄弟コンポーネントの通信がやりにくいことが理由として挙げられています。その代わりに、Node.jsのEventEmitterパターンが推奨されています[^2]。このやり方はVue.js 1.0のAPIを使って実現できます[^3]ので、まだ2.0に移行していなくても、これからイベント通信を書く時に使用すべきでしょう。

# 移行の手順
下記のコードを2.0の書き方に移行するとしましょう。

```html
<div id="app">
<div @click="clicked">
{{ text }}
</div>
<comp-a></comp-a>
<comp-b></comp-b>
</div>
```

```js
var CompA = Vue.extend({
  template: '<div @click="clicked">{{text}}</div>',
  data() {
    return {
      name: 'Component A',
      text: 'Component A'
    };
  },
  methods: {
    clicked() {
      console.log('component a clicked');
      this.$dispatch('DISPATCHED', this.name);
    }
  },
  events: {
    BROADCASTED(name) {
      console.log(name);
      this.text = 'broadcasted from ' + name;
    }
  }
});

var CompB = Vue.extend({
  template: '<div @click="clicked">{{text}}</div>',
  data() {
    return {
      name: 'Component B',
      text: 'Component B'
    };
  },
  methods: {
    clicked() {
      console.log('component b clicked');
      this.$dispatch('DISPATCHED', this.name);
    }
  },
  events: {
    BROADCASTED(name) {
      console.log(name);
      this.text = 'broadcasted from ' + name;
    }
  }
});

var App = new Vue({
  el: '#app',
  components: {
    CompA, CompB
  },
  data: {
    name: 'app',
    text: 'app'
  },
  methods: {
    clicked() {
      console.log('app clicked');
      this.$broadcast('BROADCASTED', this.name);
    }
  },
  events: {
    DISPATCHED(name) {
      console.log(name);
      this.text = 'dispatched from ' + name; 
    }
  }
});
```

## 1. まず、新しいVueインスタンスを作成し、イベントハブの役割を担わせます。  

```js
var bus = new Vue();
```

## 2. 送信側は`$dispatch`か`$broadcast`を使用してイベントを発信していましたが、イベントハブに一旦送信するので、全てを`$emit`に書き換えます。

```js
  // old
  this.$dispatch('DISPATCHED', this.name);
  // new  
  bus.$emit('DISPATCHED', this.name);
```

## 3. 受信側において、今まではリッスンしたいイベントをeventsで定義していましたが、その内容をcreatedでイベントハブの`$on`に結びつけ、リッスンしてもらいます。

```js
  // old
  events: {
    DISPATCHED(name) {
      console.log(name);
      this.text = 'dispatched from ' + name; 
    }
  }
  // new
  created() {
    const self = this;
    bus.$on('DISPATCHED', function(name) {
      console.log(name);
      self.text = 'dispatched from ' + name; 
    })
  }
```

## 4. 最終的なコードはこんな感じになります。

```js
var bus = new Vue();

var CompA = Vue.extend({
  template: '<div @click="clicked">{{text}}</div>',
  data() {
    return {
      name: 'Component A',
      text: 'Component A'
    };
  },
  methods: {
    clicked() {
      console.log('component a clicked');
      //this.$dispatch('DISPATCHED', this.name);
      bus.$emit('DISPATCHED', this.name);
    }
  },
//  events: {
//    BROADCASTED(name) {
//      console.log(name);
//      this.text = 'broadcasted from ' + name;
//    }
//  }
  created() {
    const self = this;
    bus.$on('BROADCASTED', function(name) {
      console.log(name);
      self.text = 'broadcasted from ' + name;
    });
  }
});

var CompB = Vue.extend({
  template: '<div @click="clicked">{{text}}</div>',
  data() {
    return {
      name: 'Component B',
      text: 'Component B'
    };
  },
  methods: {
    clicked() {
      console.log('component b clicked');
      //this.$dispatch('DISPATCHED', this.name);
      bus.$emit('DISPATCHED', this.name);
    }
  },
//  events: {
//    BROADCASTED(name) {
//      console.log(name);
//      this.text = 'broadcasted from ' + name;
//    }
//  }
  created() {
    const self = this;
    bus.$on('BROADCASTED', function(name) {
      console.log(name);
      self.text = 'broadcasted from ' + name;
    });
  }
});

var App = new Vue({
  el: '#app',
  components: {
    CompA, CompB
  },
  data: {
    name: 'app',
    text: 'app'
  },
  methods: {
    clicked() {
      console.log('app clicked');
      //this.$broadcast('BROADCASTED', this.name);
      bus.$emit('BROADCASTED', this.name);
    }
  },
//  events: {
//    DISPATCHED(name) {
//      console.log(name);
//      this.text = 'dispatched from ' + name; 
//    }
//  }
  created() {
    const self = this;
    bus.$on('DISPATCHED', function(name) {
      console.log(name);
      self.text = 'dispatched from ' + name; 
    })
  }
});
```

# まとめ
移行のイメージは下記の図のようにまとめられると思います。  

![ComponentsEventCommunication.png](https://qiita-image-store.s3.amazonaws.com/0/129176/b29e4e37-4017-fc2e-045c-fcc08d123b7a.png)

全てのイベントを一旦Busというハブに送り、そしてハブからリッスンしているところにイベントを送信します。イメージ図だけを観察したら、やや複雑になってきましたが、前に挙げた2つの欠点が確かに解消できました。  
しかし、全てのイベントがまとめられて同じところに送信する必要があるため、間違って意図しなかったコンポーネントに送ってしまう可能性も高くなってきていますので、気をつける必要があります。また、この設計にしたら、Vuexとほぼ変わらない感覚になってしまいます[^4]ので、Vuexを面倒くさがらず、いっそ導入してしまえばとも思いますね。

# Vuexを使って実装してみよう
Vuexを使用して実装するのに、Vuexのstoreを追加してインスタンスに入れ、stateとmutationを配置し、getterとactionを作成する必要があります。また、今回においてコンポーネントに表示すべきなテキストは最初から決められているわけでないため、computeを使ってtextを計算した方が妥当でしょう。Vuexを使った実装は下記のようになります。

```js
// -- Vuex --
const state = {
  dispatched: '',
  broadcasted: ''
};

const mutations = {
  DISPATCHED(state, name) {
    state.dispatched = 'dispatched from ' + name;
  },
  BROADCASTED(state, name) {
    state.broadcasted = 'broadcasted from ' + name;
  }
};

const store = new Vuex.Store({
  state,
  mutations
});
// -- Vuex --

var CompA = Vue.extend({
  template: '<div @click="clicked">{{text}}</div>',
  data() {
    return {
      name: 'Component A',
    };
  },
  methods: {
    clicked() {
      console.log('component a clicked');
      this.dispatch_(this.name);
    }
  },
  computed: {
    text() {
      return this.broadcasted || this.name;
    }
  },
  vuex: {
    getters: {
      broadcasted() {
        return state.broadcasted;
      }
    },
    actions: {
      dispatch_({dispatch}, name) {
        dispatch('DISPATCHED', name);
      }
    }
  }
});

var CompB = Vue.extend({
  template: '<div @click="clicked">{{text}}</div>',
  data() {
    return {
      name: 'Component B',
    };
  },
  methods: {
    clicked() {
      console.log('component b clicked');
      this.dispatch_(this.name);
    }
  },
  computed: {
    text() {
      return this.broadcasted || this.name;
    }
  },
  vuex: {
    getters: {
      broadcasted() {
        return state.broadcasted;
      }
    },
    actions: {
      dispatch_({dispatch}, name) {
        dispatch('DISPATCHED', name);
      }
    }
  }
});

var App = new Vue({
  el: '#app',
  store,
  components: {
    CompA, CompB
  },
  data: {
    name: 'app'
  },
  methods: {
    clicked() {
      console.log('app clicked');
      this.broadcast_(this.name);
    }
  },
  computed: {
    text() {
      return this.dispatched || this.name;
    }
  },
  vuex: {
    getters: {
      dispatched() {
        return state.dispatched;
      }
    },
    actions: {
      broadcast_({dispatch}, name) {
        dispatch('BROADCASTED', name);
      }
    }
  }
});
```

基本的な考え方は送信がactionで行い、受信がgetterでやることです。  

# 真・まとめ
Vue.jsの発達によって、Vueで大規模なサービスを構築するケースも増えてきていますので、従来のdispatch/broadcastの考え方が追いつけなくなりました。dispatch/broadcastのようなやり方より、ハブのようなものを利用し、データの保存・転送を行うことが望ましくなってきました。なので、Vue.js 2.0においてdispatchとbroadcastを廃止してしまってもおかしくありません。今からVue.jsでサービスを作り始めたい場合、早々からVuexを導入してもいいかもしれませんね。  

[^1]: https://github.com/vuejs/vue/issues/2873
[^2]: https://nodejs.org/api/events.html#events_class_eventemitter
[^3]: http://jp.vuejs.org/guide/components.html#カスタムイベント
[^4]: http://vuex.vuejs.org/ja/data-flow.html
