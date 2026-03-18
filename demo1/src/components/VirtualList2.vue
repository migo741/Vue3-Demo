<template>
  <div ref="containerRef" class="virtual-container" @scroll="handleScroll">
    <!-- 占位撑开总高度 -->
    <div :style="{ height: totalHeight + 'px' }"></div>

    <!-- 实际渲染区 -->
    <div
      class="virtual-list"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.index"
        :style="{ height: item.data.height + 'px' }"
      >
        {{ item.data.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";

interface Item {
  index: number;
  data: { text: string };
}

// 模拟数据
const list = ref(
  Array.from({ length: 100 }, (_, i) => ({
    text: "item " + i,
    height: 30 + Math.floor(Math.random() * 70), // 30~100px
  })),
);

const containerRef = ref<HTMLElement | null>(null);

const estimateHeight = 50;
const buffer = 5;

// 高度缓存
const heights = ref<number[]>([]);
const prefixSum = ref<number[]>([]);

// 初始化
function initHeights() {
  heights.value = list.value.map(() => estimateHeight);

  prefixSum.value = [];
  for (let i = 0; i < heights.value.length; i++) {
    prefixSum.value[i] = (prefixSum.value[i - 1] || 0) + heights.value[i];
  }
}

initHeights();

// 总高度
const totalHeight = computed(() => {
  return prefixSum.value[prefixSum.value.length - 1] || 0;
});

// scrollTop
const scrollTop = ref(0);

// 二分查找
function getStartIndex(scroll: number) {
  let left = 0;
  let right = prefixSum.value.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (prefixSum.value[mid] < scroll) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

// 可视数量
const visibleCount = ref(10);

const startIndex = ref(0);
const endIndex = ref(0);

function updateRange() {
  startIndex.value = getStartIndex(scrollTop.value);

  endIndex.value = startIndex.value + visibleCount.value + buffer;
}

// 偏移
const offsetY = computed(() => {
  return prefixSum.value[startIndex.value - 1] || 0;
});

// 可见数据
const visibleItems = computed(() => {
  return list.value.slice(startIndex.value, endIndex.value).map((item, i) => ({
    index: startIndex.value + i,
    data: item,
  }));
});

// scroll
function handleScroll(e: Event) {
  const el = e.target as HTMLElement;
  scrollTop.value = el.scrollTop;
  updateRange();
}

// ref 收集
const itemRefs = new Map<number, HTMLElement>();

function setItemRef(el: HTMLElement | null, index: number) {
  if (el) {
    itemRefs.set(index, el);
    measure(index);
  }
}

// 更新 prefixSum（局部）
function updatePrefixSum(start: number) {
  for (let i = start; i < heights.value.length; i++) {
    prefixSum.value[i] = (prefixSum.value[i - 1] || 0) + heights.value[i];
  }
}

// 测量高度（核心）
function measure(index: number) {
  nextTick(() => {
    const el = itemRefs.get(index);
    if (!el) return;

    const newHeight = el.offsetHeight;
    const oldHeight = heights.value[index];

    if (newHeight !== oldHeight) {
      const diff = newHeight - oldHeight;

      heights.value[index] = newHeight;

      updatePrefixSum(index);

      // ✅ 关键：修正 scrollTop（防抖动）
      if (containerRef.value) {
        containerRef.value.scrollTop += diff;
      }
    }
  });
}

onMounted(() => {
  visibleCount.value =
    Math.ceil((containerRef.value?.clientHeight || 500) / estimateHeight) +
    buffer;

  updateRange();
});
</script>

<style scoped>
.virtual-container {
  height: 500px;
  overflow-y: auto;
  position: relative;
  border: 1px solid #ccc;
}

.virtual-list {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.item {
  padding: 10px;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}
</style>
