<template>
  <Modal v-model:visible="isVisible" />
  <button @click="isVisible = !isVisible">打开弹窗</button>
</template>

<script setup>
import Modal from "./components/Modal.vue";
import { ref } from "vue";
const isVisible = ref(true);
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
