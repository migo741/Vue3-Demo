# 01 - 响应式原理深入

## 题目：手写迷你响应式系统 + 解决实际响应式陷阱

### 🔴 Part A：手写 mini-reactivity

从零实现一个迷你版 Vue3 响应式系统，包含以下 API：

```js
// 你需要实现以下函数
export function reactive(target) {}
export function ref(value) {}
export function computed(getter) {}
export function effect(fn) {}
export function watch(source, callback) {}
```

#### 要求

1. `reactive` 基于 Proxy 实现，支持嵌套对象的深层响应式
2. `ref` 支持基本类型的响应式包装
3. `effect` 实现依赖收集和触发更新（track / trigger）
4. `computed` 实现惰性求值 + 缓存（dirty 标记）
5. `watch` 支持监听 reactive 对象和 ref，支持 immediate 选项

#### 验收标准

```js
// 以下代码应该正确运行
const state = reactive({ count: 0, nested: { value: 1 } });
effect(() => {
  console.log("count:", state.count); // 应自动执行
});
state.count++; // 应触发上面的 effect 重新执行

const double = computed(() => state.count * 2);
console.log(double.value); // 2
state.count++;
console.log(double.value); // 4（惰性求值，只在访问时计算）

const name = ref("hello");
watch(name, (newVal, oldVal) => {
  console.log(`changed: ${oldVal} -> ${newVal}`);
});
name.value = "world"; // 触发 watch 回调
```

#### 提示

- 核心数据结构：`WeakMap<target, Map<key, Set<effect>>>`
- effect 栈用于处理嵌套 effect
- computed 本质是一个带 dirty 标记的特殊 effect

---

### 🟡 Part B：响应式陷阱大全（Debug 题）

以下代码都有 bug 或不符合预期，找出问题并修复：

```vue
<!-- Bug 1: 为什么修改 user.address.city 视图不更新？ -->
<script setup>
import { ref } from "vue";
const user = ref({
  name: "Tom",
  address: { city: "Beijing" },
});
// 某处代码
const { address } = user.value;
address.city = "Shanghai"; // 视图不更新，为什么？如何修复？
</script>

<!-- Bug 2: 为什么 list 添加元素后视图不更新？ -->
<script setup>
import { reactive } from "vue";
const state = reactive({ list: [1, 2, 3] });
// 某处代码
state.list[10] = 999; // 这样可以触发更新吗？
state.list.length = 2; // 这样呢？
</script>

<!-- Bug 3: computed 为什么没有缓存效果？ -->
<script setup>
import { ref, computed } from "vue";
const count = ref(0);
const double = computed(() => {
  console.log("computed 执行了"); // 每次访问都打印
  return count.value * 2;
});
// 在 template 中多次使用 {{ double }} 会执行几次？
// 如果在 watchEffect 中访问 double.value 呢？
</script>

<!-- Bug 4: 为什么 watch 没有触发？ -->
<script setup>
import { reactive, watch } from "vue";
const state = reactive({ user: { name: "Tom" } });
watch(state.user, (newVal) => {
  console.log("user changed", newVal); // 永远不触发
});
state.user = { name: "Jerry" }; // 替换整个对象
</script>

<!-- Bug 5: toRefs 的正确使用场景 -->
<script setup>
import { reactive, toRefs } from "vue";
const state = reactive({ x: 1, y: 2 });
const { x, y } = state; // 丢失响应式
// vs
const { x: rx, y: ry } = toRefs(state); // 保持响应式
// 问题：什么时候必须用 toRefs？什么时候不需要？
</script>
```

#### 验收标准

- 每个 Bug 写出原因分析（不少于 2 句话）
- 给出修复方案
- 总结出 3 条以上"响应式使用最佳实践"

---

### 知识点覆盖

- Proxy / Reflect
- 依赖收集（track）与触发更新（trigger）
- effect 作用域与嵌套
- computed 惰性求值与缓存
- ref vs reactive 的选择
- toRefs / toRef 的使用场景
- 响应式丢失的常见场景
