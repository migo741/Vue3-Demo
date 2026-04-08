<template>
  <TransitionGroup
    name="toast"
    tag="div"
    :class="['toast-container', `toast-${position}`]"
  >
    <div
      v-for="item in toasts"
      :key="item.id"
      :class="['toast-item', `toast-item--${item.type}`]"
    >
      <span class="toast-icon">{{ iconMap[item.type] }}</span>
      <span class="toast-content">{{ item.content }}</span>
      <span v-if="item.closable" class="toast-close" @click="remove(item.id)"
        >×</span
      >
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref } from "vue";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

interface ToastItem {
  id: number;
  type: ToastType;
  content: string;
  closable: boolean;
}

const props = withDefaults(
  defineProps<{
    position?: string;
    maxCount?: number;
  }>(),
  {
    position: "top-right",
    maxCount: 5,
  },
);

const iconMap: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
  loading: "⏳",
};

const toasts = ref<ToastItem[]>([]);
let seed = 0;

const add = (
  type: ToastType,
  content: string,
  duration = 3000,
  closable = false,
): (() => void) => {
  const id = seed++;

  // 超出最大数量时移除最早的
  if (toasts.value.length >= props.maxCount) {
    toasts.value.shift();
  }

  toasts.value.push({ id, type, content, closable });

  // 自动关闭
  let timer: ReturnType<typeof setTimeout> | null = null;
  if (duration > 0) {
    timer = setTimeout(() => remove(id), duration);
  }

  // 返回手动关闭函数
  return () => {
    if (timer) clearTimeout(timer);
    remove(id);
  };
};

const remove = (id: number) => {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const clear = () => {
  toasts.value = [];
};

defineExpose({ add, remove, clear });
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast-container.toast-top-right {
  top: 20px;
  right: 20px;
}
.toast-container.toast-top-left {
  top: 20px;
  left: 20px;
}
.toast-container.toast-bottom-right {
  bottom: 20px;
  right: 20px;
}
.toast-container.toast-bottom-left {
  bottom: 20px;
  left: 20px;
}

.toast-item {
  padding: 10px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  min-width: 200px;
}
.toast-item--success {
  background: #f0fdf4;
  color: #166534;
}
.toast-item--error {
  background: #fef2f2;
  color: #991b1b;
}
.toast-item--info {
  background: #eff6ff;
  color: #1e40af;
}
.toast-item--warning {
  background: #fffbeb;
  color: #92400e;
}
.toast-item--loading {
  background: #f5f5f5;
  color: #333;
}

.toast-close {
  cursor: pointer;
  margin-left: auto;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
