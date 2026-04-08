<template>
  <!--
    优化关键：将列表项拆为独立子组件
    Vue3 中，只有 props 变化的子组件才会重新渲染
    这样修改一个 item 的 likes 不会导致其他 item 重渲染
  -->
  <div class="list-item">
    <!-- 优化 5: 图片懒加载 -->
    <img ref="imgRef" :data-src="item.avatar" class="avatar" />
    <div class="info">
      <h3>{{ formattedName }}</h3>
      <p>{{ item.description }}</p>
      <span>{{ formattedDate }}</span>
    </div>
    <button @click="$emit('like', item.id)">❤️ {{ item.likes }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";

interface Item {
  id: number;
  name: string;
  description: string;
  avatar: string;
  createdAt: string;
  likes: number;
}

const props = defineProps<{ item: Item }>();
defineEmits<{ like: [id: number] }>();

// ---- 优化 3: 计算结果缓存 ----
// 使用 computed 缓存格式化结果，只有 item.name 变化时才重新计算
const formattedName = computed(() => {
  return props.item.name.toUpperCase();
});

// 日期格式化也用 computed 缓存
const formatter = new Intl.DateTimeFormat("zh-CN");
const formattedDate = computed(() => {
  return formatter.format(new Date(props.item.createdAt));
});

// ---- 优化 5: 图片懒加载（IntersectionObserver） ----
const imgRef = ref<HTMLImageElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!imgRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || "";
          observer?.unobserve(img);
        }
      });
    },
    { rootMargin: "100px" },
  );

  observer.observe(imgRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  padding: 10px;
  height: 80px;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  background: #f0f0f0;
}
.info {
  flex: 1;
}
.info h3 {
  margin: 0 0 4px;
  font-size: 14px;
}
.info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}
.info span {
  font-size: 11px;
  color: #999;
}
</style>
