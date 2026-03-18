<template>
  <div
    class="virtual-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <div :style="{ height: estimatedHeight * items.length + 'px' }"></div>
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
          height: estimatedHeight + 'px',
          lineHeight: estimatedHeight + 'px',
        }"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from "vue";

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
const top = ref(0);
const startIndex = computed(() =>
  Math.max(0, Math.floor(top.value / props.estimatedHeight) - props.buffer),
);
const visibleItems = computed(() =>
  props.items.slice(startIndex.value, endIndex.value),
);
const endIndex = computed(() =>
  Math.min(
    props.items.length,
    Math.ceil((props.containerHeight + top.value) / props.estimatedHeight) +
      props.buffer,
  ),
);
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
