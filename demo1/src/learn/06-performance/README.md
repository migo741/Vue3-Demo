# 06 - 性能优化

## 题目：Vue3 性能优化全链路实践

---

### 🔴 练习 1：大列表渲染优化

给你一个有严重性能问题的组件，逐步优化它：

```vue
<!-- SlowList.vue — 这是有性能问题的版本，请优化 -->
<template>
  <div>
    <input v-model="searchText" placeholder="搜索..." />
    <div v-for="item in filteredList" :key="item.id" class="item">
      <img :src="item.avatar" />
      <div>
        <h3>{{ formatName(item.name) }}</h3>
        <p>{{ item.description }}</p>
        <span>{{ formatDate(item.createdAt) }}</span>
      </div>
      <button @click="handleLike(item)">❤️ {{ item.likes }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const searchText = ref("");
const list = ref([]); // 假设有 10000 条数据

// 问题 1: 每次 searchText 变化都会重新过滤全部数据
const filteredList = computed(() => {
  return list.value.filter(
    (item) =>
      item.name.includes(searchText.value) ||
      item.description.includes(searchText.value),
  );
});

// 问题 2: 每次渲染都会重新执行
function formatName(name) {
  // 假设这是一个耗时操作
  return name.toUpperCase().split("").reverse().join("");
}

// 问题 3: 每次渲染都创建新的 Date 对象
function formatDate(date) {
  return new Intl.DateTimeFormat("zh-CN").format(new Date(date));
}

// 问题 4: 修改单个 item 导致整个列表重新渲染
function handleLike(item) {
  item.likes++;
}
</script>
```

#### 要求：逐步优化

1. **搜索防抖**：输入时不立即过滤，使用 debounce
2. **虚拟滚动**：只渲染可视区域的 DOM（可复用你之前写的 VirtualList）
3. **计算缓存**：formatName / formatDate 使用缓存避免重复计算
4. **细粒度更新**：使用 `shallowRef` + 手动 `triggerRef`，或将列表项拆为子组件
5. **图片懒加载**：使用 IntersectionObserver 实现图片懒加载
6. **Web Worker**：将搜索过滤逻辑放到 Worker 中执行（可选加分项）

#### 验收标准

- 优化前后使用 Chrome DevTools Performance 面板对比
- 写出每个优化点的原理说明（为什么这样做能提升性能）

---

### 🟡 练习 2：组件渲染优化

理解并实践以下优化手段：

```vue
<!-- 练习 2a: v-once / v-memo -->
<template>
  <!-- 什么时候用 v-once？ -->
  <div v-once>{{ staticContent }}</div>

  <!-- v-memo 的使用场景和原理 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.selected]">
    <HeavyComponent :data="item" />
  </div>
</template>

<!-- 练习 2b: 正确使用 shallowRef / shallowReactive -->
<script setup>
import { shallowRef, triggerRef } from "vue";

// 场景：大型对象/数组，只需要替换引用而非深层监听
const bigData = shallowRef({ nested: { deep: { value: 1 } } });

// 错误：不会触发更新
bigData.value.nested.deep.value = 2;

// 正确方式 1：替换整个引用
bigData.value = { ...bigData.value, nested: { deep: { value: 2 } } };

// 正确方式 2：手动触发
bigData.value.nested.deep.value = 2;
triggerRef(bigData);
</script>

<!-- 练习 2c: 合理拆分组件减少重渲染 -->
<!-- 问题：父组件的 count 变化会导致 HeavyChild 重新渲染吗？ -->
<template>
  <div>
    <span>{{ count }}</span>
    <HeavyChild :data="staticData" />
  </div>
</template>
```

#### 要求

- 写出 v-once、v-memo、shallowRef 各自的适用场景（各 2 个以上）
- 解释 Vue3 的组件更新机制：什么时候子组件会重新渲染？
- 实现一个 demo 展示 shallowRef 的正确使用

---

### 🟡 练习 3：代码分割与懒加载

```ts
// 路由级别的代码分割
const routes = [
  {
    path: "/dashboard",
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "./views/Dashboard.vue"),
  },
];

// 组件级别的懒加载
const HeavyChart = defineAsyncComponent(
  () => import("./components/HeavyChart.vue"),
);

// 条件加载
const AdminPanel = computed(() => {
  if (isAdmin.value) {
    return defineAsyncComponent(() => import("./components/AdminPanel.vue"));
  }
  return null;
});
```

#### 要求

- 实现路由级别的代码分割
- 实现组件级别的按需加载
- 使用 `vite-plugin-compression` 配置 gzip 压缩（了解即可）
- 分析打包产物，识别大体积依赖

---

### 知识点覆盖

- 虚拟滚动原理
- 防抖/节流在 UI 中的应用
- shallowRef / shallowReactive
- v-once / v-memo
- 组件拆分策略
- 代码分割（dynamic import）
- 图片懒加载
- Web Worker
- Chrome DevTools Performance 分析
