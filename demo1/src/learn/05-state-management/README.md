# 05 - 状态管理

## 题目：Pinia 深度实践 + 手写迷你状态管理

---

### 🟡 Part A：手写 mini-pinia

不使用 Pinia，基于 Vue3 的 reactive + provide/inject 实现一个迷你状态管理：

```ts
// mini-pinia.ts
export function createStore(options) {
  // options: { id, state, getters, actions }
}

// 使用方式应该和 Pinia 一致：
const useCounterStore = createStore({
  id: "counter",
  state: () => ({ count: 0 }),
  getters: {
    double: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++;
    },
    async fetchCount() {
      const res = await fetch("/api/count");
      this.count = await res.json();
    },
  },
});

// 在组件中使用
const store = useCounterStore();
store.count; // 响应式
store.double; // 计算属性
store.increment(); // action
```

#### 要求

1. state 是响应式的
2. getters 基于 computed 实现
3. actions 中的 this 指向 store 实例
4. 支持 `$reset()` 重置到初始状态
5. 支持 `$patch()` 批量更新
6. 多次调用 `useCounterStore()` 返回同一个实例（单例）

---

### 🔴 Part B：Pinia 高级模式实战

使用真正的 Pinia 实现以下场景：

#### 练习 1：Store 组合（Store 互相引用）

```ts
// stores/user.ts
export const useUserStore = defineStore("user", () => {
  const token = ref("");
  const userInfo = ref(null);

  async function login(credentials) {
    const res = await loginApi(credentials);
    token.value = res.token;
    // 登录后需要获取权限信息
    const permStore = usePermissionStore();
    await permStore.generateRoutes();
  }

  return { token, userInfo, login };
});

// stores/permission.ts
export const usePermissionStore = defineStore("permission", () => {
  const routes = ref([]);

  async function generateRoutes() {
    const userStore = useUserStore();
    // 根据用户角色生成路由
    const role = userStore.userInfo?.role;
    routes.value = filterRoutes(asyncRoutes, role);
  }

  return { routes, generateRoutes };
});
```

#### 要求

- 正确处理 Store 之间的循环依赖
- 理解为什么要在函数内部调用 useXxxStore() 而不是顶层

#### 练习 2：Pinia 插件

实现一个持久化插件：

```ts
function piniaPersistedPlugin(context) {
  const { store } = context;

  // 从 localStorage 恢复状态
  const saved = localStorage.getItem(`pinia-${store.$id}`);
  if (saved) {
    store.$patch(JSON.parse(saved));
  }

  // 监听状态变化，自动保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(state));
  });
}

// 注册插件
const pinia = createPinia();
pinia.use(piniaPersistedPlugin);
```

#### 要求

- 实现上述持久化插件
- 支持配置哪些 store 需要持久化
- 支持配置持久化哪些字段（paths 选项）
- 支持自定义 storage（localStorage / sessionStorage）
- 处理 JSON 序列化的边界情况（Date、Map、Set 等）

#### 练习 3：Store 设计最佳实践

为一个电商场景设计 Store 结构：

```
stores/
├── modules/
│   ├── user.ts        # 用户信息、登录状态
│   ├── cart.ts        # 购物车
│   ├── product.ts     # 商品列表、商品详情
│   └── order.ts       # 订单
├── plugins/
│   └── persisted.ts   # 持久化插件
└── index.ts           # 统一导出
```

#### 要求

- cart store 需要持久化
- product store 需要缓存策略（5 分钟内不重复请求）
- user store 登出时需要清空其他 store 的敏感数据
- 实现 `$subscribe` 监听状态变化用于数据上报/日志

---

### 验收标准

- mini-pinia 通过提供的测试用例
- Pinia 插件功能完整
- Store 设计合理，职责清晰
- 理解 Setup Store vs Options Store 的区别和选择

### 知识点覆盖

- reactive / computed 实现状态管理
- Pinia Setup Store（组合式写法）
- Store 组合与循环依赖处理
- Pinia 插件系统
- $patch / $reset / $subscribe
- 状态持久化
- Store 设计模式
