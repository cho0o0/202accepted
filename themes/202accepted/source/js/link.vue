<template>
  <li class="link">
    <a v-if="newWindow" :href="url" target="_blank" rel="noopener"><slot></slot></a>
    <a v-if="!newWindow" :href="url"><slot></slot></a>
  </li>
</template>

<script>
export default {
  props: {
    url: String,
    newWindow: Boolean
  }
};
</script>

