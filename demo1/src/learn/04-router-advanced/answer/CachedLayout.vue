<template>
  <!-- 路由缓存 + 过渡动画 — 参考答案 -->
  <router-view v-slot="{ Component, route }">
    <!--
      注意嵌套顺序：transition 在外，keep-alive 在内
      如果反过来，过渡动画不会生效
    -->
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const cachedViews = ref<string[]>([]);

// 监听路由变化，根据 meta.keepAlive 管理缓存
watch(
  () => route.name,
  (name) => {
    if (!name) return;
    const nameStr = name as string;

    if (route.meta.keepAlive && !cachedViews.value.includes(nameStr)) {
      cachedViews.value.push(nameStr);
    }
  },
  { immediate: true },
);

// 关闭标签页时调用此方法清除缓存
const removeCachedView = (viewName: string) => {
  const index = cachedViews.value.indexOf(viewName);
  if (index > -1) {
    cachedViews.value.splice(index, 1);
  }
};

// 清除所有缓存
const clearCachedViews = () => {
  cachedViews.value = [];
};

defineExpose({
  cachedViews,
  removeCachedView,
  clearCachedViews,
});
</script>

<style>
/* fade 过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* slide 过渡 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
