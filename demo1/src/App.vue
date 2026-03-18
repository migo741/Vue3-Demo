<template>
  <VirtualList :items="items" />
</template>

<script setup>
import VirtualList from "./components/VirtualList2.vue";
const items = Array.from({ length: 100 }, (_, index) => ({
  key: index,
  estimatedHeight: 10 + index * 10,
  content: `Item ${index + 1}`,
}));
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
}
</style>
