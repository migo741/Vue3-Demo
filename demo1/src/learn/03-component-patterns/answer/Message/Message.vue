<template>
  <Transition name="message-fade" @after-leave="onAfterLeave">
    <div
      v-if="visible"
      class="message"
      :class="`message--${type}`"
      :style="{ top: `${offset}px` }"
    >
      <span class="message__icon">{{ iconMap[type] }}</span>
      <span class="message__content">{{ content }}</span>
      <span v-if="closable" class="message__close" @click="close">×</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

type MessageType = "success" | "error" | "warning" | "info";

const props = withDefaults(
  defineProps<{
    type?: MessageType;
    content?: string;
    duration?: number;
    closable?: boolean;
    offset?: number;
    onClose?: () => void;
    onDestroy?: () => void;
  }>(),
  {
    type: "info",
    content: "",
    duration: 3000,
    closable: false,
    offset: 20,
  },
);

const iconMap: Record<MessageType, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const visible = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const close = () => {
  visible.value = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const onAfterLeave = () => {
  props.onDestroy?.();
};

onMounted(() => {
  visible.value = true;
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration);
  }
});

defineExpose({ close });
</script>

<style scoped>
.message {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  transition: all 0.3s;
}
.message--success {
  background: #f0fdf4;
  color: #166534;
}
.message--error {
  background: #fef2f2;
  color: #991b1b;
}
.message--warning {
  background: #fffbeb;
  color: #92400e;
}
.message--info {
  background: #eff6ff;
  color: #1e40af;
}
.message__close {
  cursor: pointer;
  margin-left: 8px;
  font-size: 16px;
}
.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
