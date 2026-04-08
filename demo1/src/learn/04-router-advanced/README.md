# 04 - Vue Router 进阶

## 题目：实现一个完整的路由权限系统

这道题模拟大厂后台管理系统中最核心的路由场景，一题覆盖 Router 所有高频知识点。

---

### 🔴 综合题：RBAC 动态路由权限系统

#### 场景描述

你需要为一个后台管理系统实现完整的路由方案，包含：

- 静态路由（登录页、404 页）
- 动态路由（根据用户角色动态添加）
- 路由守卫（鉴权、权限校验）
- 路由缓存（keep-alive）

#### Part A：路由配置与动态路由

```ts
// router/index.ts

// 静态路由 — 不需要权限即可访问
const constantRoutes = [
  { path: "/login", component: () => import("@/views/Login.vue") },
  { path: "/403", component: () => import("@/views/Forbidden.vue") },
  { path: "/:pathMatch(.*)*", component: () => import("@/views/NotFound.vue") },
];

// 动态路由 — 根据角色过滤后动态添加
const asyncRoutes = [
  {
    path: "/dashboard",
    component: Layout,
    meta: { title: "仪表盘", icon: "dashboard", roles: ["admin", "editor"] },
  },
  {
    path: "/user",
    component: Layout,
    meta: { title: "用户管理", roles: ["admin"] },
    children: [
      {
        path: "list",
        component: () => import("@/views/user/List.vue"),
        meta: { title: "用户列表", keepAlive: true },
      },
      {
        path: ":id",
        component: () => import("@/views/user/Detail.vue"),
        meta: { title: "用户详情" },
      },
    ],
  },
  {
    path: "/article",
    component: Layout,
    meta: { title: "文章管理", roles: ["admin", "editor"] },
    children: [
      {
        path: "list",
        component: () => import("@/views/article/List.vue"),
        meta: { title: "文章列表", keepAlive: true },
      },
      {
        path: "create",
        component: () => import("@/views/article/Edit.vue"),
        meta: { title: "创建文章" },
      },
      {
        path: "edit/:id",
        component: () => import("@/views/article/Edit.vue"),
        meta: { title: "编辑文章" },
      },
    ],
  },
];
```

#### 要求

1. 实现 `generateRoutes(roles: string[])` 函数，根据角色过滤 asyncRoutes
2. 使用 `router.addRoute()` 动态添加路由
3. 用户登出时使用 `router.removeRoute()` 清除动态路由

#### Part B：路由守卫

实现完整的导航守卫链：

```ts
// permission.ts
router.beforeEach(async (to, from, next) => {
  // 1. 获取 token
  // 2. 有 token：
  //    a. 去登录页 → 重定向到首页
  //    b. 有用户信息 → 放行
  //    c. 无用户信息 → 获取用户信息 → 生成动态路由 → addRoute → next({ ...to, replace: true })
  // 3. 无 token：
  //    a. 在白名单中 → 放行
  //    b. 不在白名单 → 重定向到登录页（携带 redirect 参数）
});
```

#### 要求

- 处理路由守卫中的异步操作
- 处理 addRoute 后的重定向问题（为什么需要 `next({ ...to, replace: true })`）
- 实现路由白名单
- 登录后跳转到之前想访问的页面（redirect 参数）

#### Part C：路由缓存（keep-alive）

```vue
<!-- Layout.vue -->
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>
```

#### 要求

- 根据 `meta.keepAlive` 决定是否缓存
- 实现 `cachedViews` 的管理（添加/移除缓存）
- 实现"关闭标签页时清除对应缓存"的逻辑
- 处理 keep-alive 与动态路由的兼容问题

#### Part D：路由过渡动画

```vue
<router-view v-slot="{ Component, route }">
  <transition :name="route.meta.transition || 'fade'" mode="out-in">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </transition>
</router-view>
```

#### 要求

- 实现 fade 和 slide 两种过渡效果
- 支持路由级别的自定义过渡
- 处理 transition 与 keep-alive 的嵌套顺序

---

### 验收标准

- 完整的路由配置文件
- 路由守卫逻辑清晰，覆盖所有边界情况
- 动态路由的添加和移除正确
- keep-alive 缓存管理正确
- 写一份简短的设计文档说明你的路由方案

### 知识点覆盖

- 路由懒加载
- 动态路由（addRoute / removeRoute）
- 导航守卫（beforeEach / beforeResolve / afterEach）
- 路由元信息（meta）
- 嵌套路由
- 命名视图
- 路由参数（params / query）
- keep-alive 与路由缓存
- 路由过渡动画
- 滚动行为
