<template>
  <Suspense fallback="加载中...">
    <template #default>
      <AsyncChild />
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from "vue";
const AsyncChild = defineAsyncComponent(() => {
  return new Promise((r) => {
    setTimeout(() => {
      r(import("./AsyncChild.vue"));
    }, 5000);
  });
});
</script>
