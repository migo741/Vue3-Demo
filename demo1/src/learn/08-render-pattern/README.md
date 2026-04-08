# 08 - 渲染模式（JSX / Render / HOC）

## 题目：掌握 Vue3 的高级渲染模式

---

### 🟡 练习 1：h 函数与 JSX

将以下 template 组件改写为 render 函数 / JSX 版本：

```vue
<!-- 原始 template 版本 -->
<template>
  <div :class="['btn', `btn-${type}`, { 'btn-disabled': disabled }]">
    <span v-if="icon" class="btn-icon">
      <component :is="icon" />
    </span>
    <span class="btn-text">
      <slot>{{ text }}</slot>
    </span>
    <span v-if="loading" class="btn-loading">
      <LoadingIcon />
    </span>
  </div>
</template>
```

#### 要求

- 用 `h()` 函数重写（纯 render 函数）
- 用 JSX 重写（需要配置 `@vitejs/plugin-vue-jsx`）
- 对比三种写法的优劣，写出各自适用场景

---

### 🔴 练习 2：高阶组件（HOC）

实现以下 3 个 HOC：

#### HOC 1: withLoading — 给任意组件添加 loading 状态

```ts
const EnhancedTable = withLoading(MyTable)

// 使用
<EnhancedTable :loading="isLoading" :data="tableData" />
// loading 为 true 时显示 loading 遮罩，false 时正常显示 MyTable
```

#### HOC 2: withAuth — 权限控制 HOC

```ts
const ProtectedPage = withAuth(AdminPage, {
  roles: ['admin'],
  fallback: ForbiddenPage, // 无权限时显示的组件
})

// 使用
<ProtectedPage />
// 自动检查当前用户角色，无权限显示 ForbiddenPage
```

#### HOC 3: withLogger — 开发调试 HOC

```ts
const DebugComponent = withLogger(MyComponent, {
  logProps: true, // 打印 props 变化
  logEmits: true, // 打印 emit 事件
  logLifecycle: true, // 打印生命周期
});
```

#### 要求

- 使用 `h()` 函数实现 HOC
- HOC 需要正确透传 props、slots、emit
- 理解 Vue3 中 HOC 的局限性（对比 React HOC）
- 说明什么场景用 HOC，什么场景用 Composable 更合适

---

### 🟡 练习 3：Renderless Component（无渲染组件）

实现一个无渲染的 `MouseTracker` 组件：

```vue
<!-- 使用方式 -->
<MouseTracker v-slot="{ x, y, isInside }">
  <div>
    鼠标位置：{{ x }}, {{ y }}
    <span v-if="isInside">鼠标在区域内</span>
  </div>
</MouseTracker>
```

再实现一个无渲染的 `FetchData` 组件：

```vue
<FetchData url="/api/users" v-slot="{ data, loading, error, refresh }">
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <ul v-else>
    <li v-for="user in data" :key="user.id">{{ user.name }}</li>
  </ul>
  <button @click="refresh">刷新</button>
</FetchData>
```

#### 要求

- 组件本身不渲染任何 DOM，只通过作用域插槽暴露数据和方法
- 对比 Renderless Component 和 Composable 的优劣
- 说明什么场景下 Renderless Component 仍然有价值

---

### 🔴 练习 4：动态组件与组件缓存

```vue
<template>
  <!-- 标签页切换场景 -->
  <div class="tabs">
    <button v-for="tab in tabs" :key="tab.name" @click="activeTab = tab.name">
      {{ tab.label }}
    </button>
  </div>

  <keep-alive :include="cachedTabs" :max="5">
    <component :is="currentTabComponent" :key="activeTab" />
  </keep-alive>
</template>
```

#### 要求

- 实现一个完整的标签页系统
- 支持动态添加/关闭标签页
- 关闭标签页时清除对应缓存
- 使用 `activated` / `deactivated` 生命周期做数据刷新
- 实现 `keep-alive` 的 `max` 属性的 LRU 淘汰策略理解

---

### 知识点覆盖

- h() 函数 API
- JSX in Vue3
- 高阶组件（HOC）模式
- Renderless Component 模式
- 动态组件（component :is）
- keep-alive 原理与使用
- slots 在 render 函数中的使用
- HOC vs Composable 的选择
