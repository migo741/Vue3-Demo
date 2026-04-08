<template>
  <div class="optimized-list">
    <!-- 搜索框：防抖 -->
    <input :value="searchText" @input="onSearchInput" placeholder="搜索..." />

    <!-- 虚拟滚动容器 -->
    <div ref="containerRef" class="scroll-container" @scroll="onScroll">
      <!-- 撑开滚动高度 -->
      <div :style="{ height: totalHeight + 'px' }"></div>

      <!-- 只渲染可视区域的项 -->
      <div
        class="visible-area"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <ListItem
          v-for="item in visibleItems"
          :key="item.id"
          :item="item"
          @like="handleLike"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, triggerRef } from "vue";
import ListItem from "./ListItem.vue";

interface Item {
  id: number;
  name: string;
  description: string;
  avatar: string;
  createdAt: string;
  likes: number;
}

const props = defineProps<{ items: Item[] }>();

// ---- 优化 1: 搜索防抖 ----
const searchText = ref("");
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const onSearchInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchText.value = value;
  }, 300);
};

// ---- 优化 2: 使用 shallowRef 避免深层响应式 ----
// 对于大列表，shallowRef 只追踪引用变化，不深层代理每个 item
const list = shallowRef(props.items);

const filteredList = computed(() => {
  if (!searchText.value) return list.value;
  const keyword = searchText.value.toLowerCase();
  return list.value.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword),
  );
});

// ---- 优化 3: 虚拟滚动 ----
const containerRef = ref<HTMLElement | null>(null);
const ITEM_HEIGHT = 80;
const CONTAINER_HEIGHT = 600;
const BUFFER = 5;

const scrollTop = ref(0);

const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER);
});

const endIndex = computed(() => {
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);
  return Math.min(
    filteredList.value.length,
    startIndex.value + visibleCount + BUFFER * 2,
  );
});

const visibleItems = computed(() => {
  return filteredList.value.slice(startIndex.value, endIndex.value);
});

const totalHeight = computed(() => {
  return filteredList.value.length * ITEM_HEIGHT;
});

const offsetY = computed(() => {
  return startIndex.value * ITEM_HEIGHT;
});

let ticking = false;
const onScroll = (e: Event) => {
  if (!ticking) {
    requestAnimationFrame(() => {
      scrollTop.value = (e.target as HTMLElement).scrollTop;
      ticking = false;
    });
    ticking = true;
  }
};

// ---- 优化 4: 细粒度更新 ----
// 修改单个 item 时，不替换整个数组，而是修改后手动触发
const handleLike = (id: number) => {
  const item = list.value.find((i) => i.id === id);
  if (item) {
    item.likes++;
    // shallowRef 不会追踪深层变化，需要手动触发
    triggerRef(list);
  }
};
</script>

<style scoped>
.scroll-container {
  height: 600px;
  overflow-y: auto;
  position: relative;
}
.visible-area {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}
</style>
