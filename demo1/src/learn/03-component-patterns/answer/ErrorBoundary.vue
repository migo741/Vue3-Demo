<template>
  <slot v-if="!error" />
  <slot v-else name="error" :error="error" :retry="retry" />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";

const emit = defineEmits<{
  error: [error: Error];
}>();

const error = ref<Error | null>(null);
// key 变化会强制重新创建子组件
const retryKey = ref(0);

onErrorCaptured((err: Error) => {
  error.value = err;
  emit("error", err);
  // 返回 false 阻止错误继续向上传播
  return false;
});

const retry = () => {
  error.value = null;
  retryKey.value++;
};

defineExpose({ retry });
</script>
