# 07 - TypeScript + Vue3 深度集成

## 题目：用 TypeScript 重构并实现类型安全的 Vue 组件

---

### 🟡 练习 1：组件 Props 的高级类型

```vue
<script setup lang="ts">
// 练习 1a: 基础 Props 类型定义
// 用 TypeScript 接口定义以下 Props，要求类型精确

interface ButtonProps {
  // type 只能是 'primary' | 'danger' | 'default'
  // size 只能是 'small' | 'medium' | 'large'，默认 'medium'
  // disabled 可选，默认 false
  // icon 可选，是一个 Component 类型
  // onClick 可选，是一个函数，参数为 MouseEvent
}

// 练习 1b: 泛型组件 Props
// 实现一个泛型 Select 组件的类型定义
interface SelectProps<T> {
  modelValue: T;
  options: Array<{ label: string; value: T }>;
  multiple?: boolean;
  // 当 multiple 为 true 时，modelValue 应该是 T[]
  // 如何用 TypeScript 实现这种条件类型？
}

// 练习 1c: 使用 defineProps 的两种方式
// 方式 1：运行时声明
const props1 = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
});

// 方式 2：类型声明（推荐）
const props2 = defineProps<{
  title: string;
  count?: number;
}>();

// 问题：两种方式的区别是什么？什么时候用哪种？
// 类型声明方式如何设置默认值？
</script>
```

#### 要求

- 实现所有类型定义
- 解释 `withDefaults` 的使用方式和限制
- 实现泛型 Select 组件（包含 template 和完整逻辑）

---

### 🔴 练习 2：类型安全的 Emit 和 Slots

```vue
<script setup lang="ts">
// 练习 2a: 类型安全的 Emit
const emit = defineEmits<{
  change: [value: string]
  update: [id: number, data: Partial<UserInfo>]
  submit: []  // 无参数
}>()

// 练习 2b: 类型安全的 Slots
defineSlots<{
  default(props: { item: UserInfo; index: number }): any
  header(props: { title: string }): any
  footer(): any
}>()

// 练习 2c: 类型安全的 defineExpose
defineExpose({
  validate: () => Promise<boolean>,
  resetFields: () => void,
  getFormData: () => FormData,
})
</script>
```

#### 要求

- 实现一个完整的 DataTable 组件，包含类型安全的 Props、Emit、Slots、Expose
- 组件功能：表格展示、排序、分页、行选择

```vue
<DataTable
  :columns="columns"
  :data="tableData"
  :loading="loading"
  row-key="id"
  @sort-change="handleSort"
  @selection-change="handleSelect"
  @page-change="handlePage"
>
  <template #column-name="{ row }">
    <a @click="goDetail(row.id)">{{ row.name }}</a>
  </template>
  <template #column-action="{ row }">
    <button @click="edit(row)">编辑</button>
  </template>
</DataTable>
```

---

### 🟡 练习 3：Composable 的 TypeScript 类型设计

```ts
// 练习 3a: 实现类型安全的 useStorage
function useStorage<T>(key: string, defaultValue: T): Ref<T>;

// 使用时自动推断类型
const count = useStorage("count", 0); // Ref<number>
const user = useStorage("user", { name: "" }); // Ref<{ name: string }>
const list = useStorage<string[]>("list", []); // Ref<string[]>

// 练习 3b: 实现类型安全的 useEventBus
interface EventMap {
  "user:login": { userId: string; token: string };
  "user:logout": undefined;
  "cart:update": { items: CartItem[] };
}

const bus = useEventBus<EventMap>();
bus.on("user:login", (payload) => {
  // payload 自动推断为 { userId: string; token: string }
});
bus.emit("user:login", { userId: "1", token: "xxx" });
bus.emit("user:logout"); // 不需要 payload

// 练习 3c: 函数重载在 Composable 中的应用
// 实现 useFetch，根据参数不同返回不同类型
function useFetch(url: string): { data: Ref<any>; loading: Ref<boolean> };
function useFetch<T>(
  url: string,
  options: { transform: (raw: any) => T },
): { data: Ref<T>; loading: Ref<boolean> };
```

#### 要求

- 所有 Composable 都要有完整的类型定义
- 使用泛型确保类型安全
- 写出使用示例验证类型推断是否正确

---

### 知识点覆盖

- defineProps 的类型声明 vs 运行时声明
- withDefaults
- defineEmits 类型声明
- defineSlots
- defineExpose
- 泛型组件
- Composable 的类型设计
- 函数重载
- 条件类型
- 类型推断
