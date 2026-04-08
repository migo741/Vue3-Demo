# 11 - 综合实战：Mini 后台管理系统

## 题目：从零搭建一个麻雀虽小五脏俱全的后台管理系统

> 这道综合题将前面所有知识点串联起来，模拟真实大厂项目开发流程。
> 预计耗时：8-10 小时（Day 11-14）

---

### 项目要求

搭建一个包含以下功能的后台管理系统：

#### 核心功能

1. **登录/登出**
   - 登录表单（使用你在 03 中实现的 Form 组件）
   - Token 管理（存储/刷新/过期处理）
   - 登出时清理状态

2. **动态路由与权限**
   - 使用 04 中实现的 RBAC 路由方案
   - 两个角色：admin / editor
   - admin 可以访问所有页面，editor 只能访问部分页面

3. **布局系统**
   - 侧边栏（根据动态路由自动生成菜单，递归组件）
   - 顶部导航栏（用户信息、登出）
   - 标签页导航（多标签 + keep-alive 缓存）
   - 面包屑（根据路由自动生成）

4. **用户管理页（CRUD）**
   - 用户列表（使用 07 中的 DataTable 组件）
   - 搜索/筛选（使用 useRequest）
   - 分页
   - 新增/编辑用户（Modal + Form）
   - 删除用户（确认弹窗）

5. **仪表盘页**
   - 数据卡片（异步加载 + Suspense）
   - 使用 ErrorBoundary 处理加载失败

---

### 技术要求

```
技术栈：
- Vue 3.5+ (Composition API + <script setup>)
- TypeScript
- Vue Router 4
- Pinia
- Vite

项目结构：
src/
├── api/              # API 请求（使用 mock）
├── components/       # 通用组件（Form、DataTable、Message 等）
├── composables/      # 组合式函数
├── directives/       # 自定义指令（v-permission）
├── layout/           # 布局组件
├── plugins/          # 插件（Toast）
├── router/           # 路由配置 + 守卫
├── stores/           # Pinia stores
├── views/            # 页面组件
├── types/            # TypeScript 类型定义
└── utils/            # 工具函数
```

---

### Mock API

不需要真实后端，使用以下方式 mock：

```ts
// api/mock.ts
// 使用 setTimeout 模拟网络延迟

export function mockLogin(credentials: { username: string; password: string }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (
        credentials.username === "admin" &&
        credentials.password === "123456"
      ) {
        resolve({ token: "mock-admin-token", role: "admin" });
      } else if (
        credentials.username === "editor" &&
        credentials.password === "123456"
      ) {
        resolve({ token: "mock-editor-token", role: "editor" });
      } else {
        reject(new Error("用户名或密码错误"));
      }
    }, 500);
  });
}

export function mockGetUserList(params: {
  page: number;
  size: number;
  keyword?: string;
}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 生成 mock 数据
      const total = 86;
      const list = Array.from({ length: params.size }, (_, i) => ({
        id: (params.page - 1) * params.size + i + 1,
        name: `用户${(params.page - 1) * params.size + i + 1}`,
        email: `user${(params.page - 1) * params.size + i + 1}@example.com`,
        role: i % 3 === 0 ? "admin" : "editor",
        status: i % 5 === 0 ? "disabled" : "active",
        createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
      }));
      resolve({ list, total });
    }, 300);
  });
}
```

---

### 验收清单

#### 功能验收

- [ ] 登录/登出流程完整
- [ ] 不同角色看到不同菜单
- [ ] 未登录访问受保护页面跳转到登录页
- [ ] 登录后跳转到之前想访问的页面
- [ ] 用户列表 CRUD 功能完整
- [ ] 分页、搜索正常工作
- [ ] 标签页切换保持页面状态（keep-alive）
- [ ] 关闭标签页清除缓存

#### 代码质量验收

- [ ] TypeScript 类型完整，无 any
- [ ] 组件职责单一，合理拆分
- [ ] Composable 复用合理
- [ ] 自定义指令使用正确
- [ ] 错误处理完善
- [ ] 无内存泄漏（组件卸载时清理）

#### 加分项

- [ ] 暗色模式切换
- [ ] 国际化（i18n）基础支持
- [ ] 响应式布局（移动端适配）
- [ ] 单元测试覆盖核心逻辑

---

### 提示

- 不要追求 UI 美观，重点是代码架构和模式运用
- 可以使用简单的 CSS，不需要引入 UI 框架
- 优先完成核心功能，加分项量力而行
- 遇到问题先思考，这是最好的学习机会

### 知识点覆盖（全部串联）

- 响应式系统（ref / reactive / computed / watch）
- 组合式函数（Composables）
- 组件设计模式（递归组件、命令式组件、异步组件）
- Vue Router（动态路由、守卫、缓存）
- Pinia（Store 设计、插件、持久化）
- TypeScript 集成
- 自定义指令
- 插件开发
- 性能优化（keep-alive、代码分割）
- 错误处理（ErrorBoundary、Suspense）
