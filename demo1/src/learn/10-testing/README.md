# 10 - 组件测试

## 题目：Vue 组件的单元测试与集成测试

使用 Vitest + @vue/test-utils 编写测试

---

### 🟡 练习 1：组件单元测试

为以下组件编写完整的测试用例：

#### 待测组件：TodoList

```vue
<!-- TodoList.vue -->
<template>
  <div class="todo-list">
    <input
      v-model="newTodo"
      @keyup.enter="addTodo"
      placeholder="添加待办..."
      data-testid="todo-input"
    />
    <ul>
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        :class="{ completed: todo.done }"
        data-testid="todo-item"
      >
        <input
          type="checkbox"
          :checked="todo.done"
          @change="toggleTodo(todo.id)"
          data-testid="todo-checkbox"
        />
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)" data-testid="todo-remove">
          删除
        </button>
      </li>
    </ul>
    <div class="filters">
      <button
        v-for="f in ['all', 'active', 'completed']"
        :key="f"
        :class="{ active: filter === f }"
        @click="filter = f"
        :data-testid="`filter-${f}`"
      >
        {{ f }}
      </button>
    </div>
    <p data-testid="todo-count">{{ activeTodos.length }} 项待完成</p>
  </div>
</template>
```

#### 要求编写的测试用例

```ts
describe("TodoList", () => {
  // 渲染测试
  it("应该正确渲染初始状态");
  it("应该显示传入的初始 todos");

  // 交互测试
  it("输入文本并按回车应该添加新 todo");
  it("点击 checkbox 应该切换 todo 状态");
  it("点击删除按钮应该移除 todo");
  it("空输入不应该添加 todo");

  // 过滤测试
  it("点击 active 应该只显示未完成的 todo");
  it("点击 completed 应该只显示已完成的 todo");
  it("点击 all 应该显示所有 todo");

  // 计数测试
  it("应该正确显示待完成数量");

  // 边界情况
  it("列表为空时应该显示空状态");
});
```

---

### 🟡 练习 2：测试异步组件和 Composable

#### 测试 Composable

```ts
// 为 useRequest 编写测试
describe("useRequest", () => {
  it("应该正确管理 loading 状态");
  it("应该在请求成功后更新 data");
  it("应该在请求失败后设置 error");
  it("immediate: false 时不应该自动执行");
  it("cancel 应该取消正在进行的请求");
  it("竞态处理：只保留最后一次请求的结果");
});
```

#### 测试包含异步操作的组件

```ts
describe("AsyncComponent", () => {
  it("应该在加载时显示 loading");
  it("加载完成后应该显示数据");
  it("加载失败应该显示错误信息");
  it("点击重试应该重新加载");
});
```

#### 要求

- 使用 `vi.fn()` mock API 请求
- 使用 `flushPromises` 处理异步
- 使用 `vi.useFakeTimers()` 测试防抖/定时器
- 测试组件的 emit 事件

---

### 🔴 练习 3：测试 Pinia Store

```ts
import { setActivePinia, createPinia } from "pinia";

describe("useCartStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("应该添加商品到购物车");
  it("添加已存在的商品应该增加数量");
  it("应该正确计算总价");
  it("应该正确移除商品");
  it("清空购物车应该重置状态");

  // 测试 action 中的异步操作
  it("checkout 应该调用 API 并清空购物车");
  it("checkout 失败应该保留购物车状态");
});
```

---

### 验收标准

- 所有测试用例通过
- 测试覆盖率 > 80%
- 正确使用 mock、stub、spy
- 异步测试正确处理

### 知识点覆盖

- @vue/test-utils 的 mount / shallowMount
- wrapper.find / findAll / get
- wrapper.trigger / setValue
- wrapper.emitted()
- vi.fn() / vi.spyOn() / vi.mock()
- flushPromises
- vi.useFakeTimers()
- 测试 Composable（使用 withSetup 辅助函数）
- 测试 Pinia Store
- data-testid 最佳实践
