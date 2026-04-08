# 02 - 组合式函数（Composables）进阶

## 题目：实现 5 个生产级 Composable

大厂开发中，Composable 的设计能力是区分中级和高级 Vue 开发者的关键。
以下每个 Composable 都是真实业务中高频使用的，要求按照 VueUse 的设计标准来实现。

---

### 🟡 练习 1：useRequest — 通用请求 Hook

实现一个通用的异步请求管理 Hook：

```ts
interface UseRequestOptions<T> {
  immediate?: boolean; // 是否立即执行，默认 true
  initialData?: T; // 初始数据
  debounceInterval?: number; // 防抖间隔
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseRequestReturn<T> {
  data: Ref<T | undefined>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  run: (...args: any[]) => Promise<T>; // 手动执行
  cancel: () => void; // 取消请求
  refresh: () => Promise<T>; // 用上次参数重新请求
  mutate: (newData: T) => void; // 手动修改 data
}

function useRequest<T>(
  service: (...args: any[]) => Promise<T>,
  options?: UseRequestOptions<T>,
): UseRequestReturn<T>;
```

#### 验收标准

- 支持 loading / error / data 三态管理
- 支持防抖（连续快速调用只执行最后一次）
- 支持取消请求（组件卸载时自动取消）
- 支持竞态处理（只保留最后一次请求的结果）
- 写出至少 3 个使用示例

---

### 🟡 练习 2：useVModel — 双向绑定 Hook

实现一个简化组件 v-model 使用的 Hook：

```ts
// 使用前（传统写法）
const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
// template 中需要 :value="modelValue" @input="emit('update:modelValue', $event)"

// 使用后
const value = useVModel(props, "modelValue", emit);
// template 中直接 v-model="value" 即可
```

#### 要求

- 返回一个可读写的 Ref
- 写入时自动 emit 对应事件
- 支持自定义 eventName
- 支持 defaultValue
- 支持 passive 模式（本地状态 + emit，不依赖父组件更新 props）

---

### 🔴 练习 3：useAsyncState — 异步状态管理

```ts
const { state, isReady, isLoading, error, execute } = useAsyncState(
  async () => {
    const res = await fetch("/api/user");
    return res.json();
  },
  { name: "", age: 0 }, // 初始值
  {
    immediate: true,
    resetOnExecute: false,
    onError: (e) => console.error(e),
  },
);
```

#### 要求

- 支持 SSR 安全（onMounted 中执行）
- 支持 resetOnExecute（重新执行时是否重置为初始值）
- 支持 shallow 选项（使用 shallowRef 优化大数据）
- 正确处理组件卸载后的异步回调（避免内存泄漏）

---

### 🟡 练习 4：useEventListener — 事件监听 Hook

```ts
// 基础用法
useEventListener(window, "resize", handler);
// 自动在组件卸载时移除监听

// 支持 ref 元素
const el = ref<HTMLElement>();
useEventListener(el, "click", handler);
// el 变化时自动重新绑定

// 支持多事件
useEventListener(el, ["mouseenter", "mouseleave"], handler);
```

#### 要求

- 组件卸载自动清理
- 支持 Ref<HTMLElement> 作为 target（watch target 变化）
- 返回手动 cleanup 函数
- 支持 addEventListener 的 options 参数

---

### 🔴 练习 5：useInfiniteScroll — 无限滚动 Hook

```ts
const { list, loading, noMore, loadMore, reset } = useInfiniteScroll(
  async (page: number) => {
    const res = await fetchList({ page, size: 20 });
    return {
      data: res.list,
      total: res.total,
    };
  },
  {
    target: scrollContainer, // 滚动容器 Ref
    threshold: 100, // 距底部多少 px 触发
    initialPageSize: 20,
  },
);
```

#### 要求

- 基于 IntersectionObserver 或 scroll 事件实现
- 防止重复加载（loading 时不触发）
- 支持 reset 重新从第一页加载
- 支持自定义判断"没有更多"的逻辑
- 组件卸载自动清理

---

### 通用要求

每个 Composable 都需要：

1. 完整的 TypeScript 类型定义
2. 在 `demo.vue` 中写一个使用示例
3. 遵循 Composable 命名规范（use 前缀）
4. 正确处理组件生命周期（onMounted / onUnmounted）
5. 返回值使用 ref 而非 reactive（方便解构）

### 知识点覆盖

- Composable 设计模式与最佳实践
- 生命周期钩子在 Composable 中的使用
- 防抖/节流在 Composable 中的集成
- 竞态条件处理
- 内存泄漏防范
- TypeScript 泛型在 Composable 中的应用
