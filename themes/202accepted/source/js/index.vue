<template>
  <div id="index">    
    <h1 class="title"></h1>
    <ul class="links">
      <entry v-if="theme.menu.Blog" :url="theme.menu.Blog" :new-window="false"
       @focus.native="replaceTitle($event)" @mouseover.native="replaceTitle($event)">
        Blog
      </entry>
      <entry v-if="theme.github" :url="theme.github" :new-window="true"
       @focus.native="replaceTitle($event)" @mouseover.native="replaceTitle($event)">
        GitHub
      </entry>
      <entry v-if="theme.stackoverflow" :url="theme.stackoverflow" :new-window="true"
       @focus.native="replaceTitle($event)" @mouseover.native="replaceTitle($event)">
        Stack Overflow
      </entry>
      <entry v-if="theme.rss" :url="theme.rss" :new-window="true"
       @focus.native="replaceTitle($event)" @mouseover.native="replaceTitle($event)"> 
        RSS
      </entry>
    </ul>
  </div>  
</template>

<script>
import Typed from "typed.js";
import entry from "./link.vue";

export default {
  components: {
    entry
  },
  props: {
    theme: Object
  },
  data() {
    return {
      title: "202 Accepted",
      typed: null
    };
  },
  mounted() {
    this.typed = new Typed(".title", {
      strings: [this.title],
      typeSpeed: 80,
      showCursor: false
    });
  },
  methods: {
    replaceTitle(e) {
      const el = e.target;
      this.typed.strings[0] = el.innerHTML;
      this.typed.reset(true);
    }
  }
};
</script>

<style lang="stylus">
#index
  height: 100%
  display: flex
  justify-content: center
  align-items: center
  flex-direction: column
</style>

