<template>
  <div
    class="virtual-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <div :style="{ height: totalHeight + 'px' }"></div>
    <div
      class="virtual-list"
      :style="{
        transform: `translateY(${offset}px)`,
      }"
    >
      <div
        class="virtual-item"
        v-for="(item, index) in visibleItems"
        :key="item.key"
        :style="{
          height: item.height + 'px',
        }"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, onMounted } from "vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  estimatedHeight: {
    type: Number,
    default: 50,
  },
  containerHeight: {
    type: Number,
    default: 500,
  },
  buffer: {
    type: Number,
    default: 5,
  },
});

const preHeight = ref([]);
const startIndex = ref(0);
const endIndex = ref(0);
const visibleCount = ref(10);
const top = ref(0);

const lists = Array.from({ length: 100 }).map((_, i) => {
  return {
    key: i,
    content: `Item ${i + 1}`,
    height: Math.floor(Math.random() * 100 + 50),
  };
});

const initHeights = () => {
  lists.forEach((list, i) => {
    preHeight.value[i] = (preHeight.value[i - 1] || 0) + list.height;
  });
};
initHeights();
const totalHeight = computed(() => {
  return preHeight.value[preHeight.value.length - 1] || 0;
});

function getCurrentIndex(scrollTop: number, arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (arr[mid] < scrollTop) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

function updateRange() {
  startIndex.value = getCurrentIndex(top.value, preHeight.value) - props.buffer;
  endIndex.value = startIndex.value + visibleCount.value + props.buffer;
}

const visibleItems = computed(() => {
  return lists.slice(startIndex.value, endIndex.value);
});

const offset = computed(() => {
  return startIndex.value * props.estimatedHeight;
});
let ticking = false;
const handleScroll = (e) => {
  if (ticking) {
    requestAnimationFrame(() => {
      ticking = false;
      top.value = e.target.scrollTop;
    });
    ticking = true;
  }
};
onMounted(() => {
  visibleCount.value =
    Math.ceil(props.containerHeight / props.estimatedHeight) + props.buffer;
  updateRange();
});
</script>

<style scoped>
.virtual-container {
  height: 500px;
  overflow-y: auto;
  border: 1px solid #000;
  position: relative;
}
.virtual-list {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}
.virtual-item {
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 10px;
}
</style>
