# 响应式陷阱 — 参考答案

## Bug 1: 解构导致响应式丢失

```js
const { address } = user.value;
address.city = "Shanghai"; // 视图不更新
```

**原因**：`user.value.address` 本身是响应式的，但 `const { address } = user.value` 把 address 这个引用赋值给了一个普通变量。此时 `address` 只是一个普通对象引用，修改它不会触发 ref 的 setter，Vue 无法追踪到变化。

**修复方案**：

```js
// 方案 1：直接通过 user.value 修改
user.value.address.city = "Shanghai";

// 方案 2：替换整个对象
user.value = { ...user.value, address: { city: "Shanghai" } };

// 方案 3：如果需要解构，用 toRefs（但 ref 嵌套对象不适用 toRefs，toRefs 用于 reactive）
// 最佳实践：对于嵌套对象，始终通过原始 ref/reactive 路径访问
```

---

## Bug 2: 数组索引赋值和 length 修改

```js
state.list[10] = 999; // ✅ Vue3 中可以触发更新（Proxy 能拦截索引赋值）
state.list.length = 2; // ✅ Vue3 中也可以触发更新
```

**注意**：这在 Vue2 中是经典 bug（Object.defineProperty 无法拦截），但 Vue3 基于 Proxy 已经解决了。如果面试官问的是 Vue2，答案不同：

- Vue2 中需要用 `Vue.set(state.list, 10, 999)` 或 `state.list.splice(10, 1, 999)`

---

## Bug 3: computed 缓存问题

```js
const double = computed(() => {
  console.log("computed 执行了");
  return count.value * 2;
});
```

**分析**：

- 在 template 中多次使用 `{{ double }}`：只执行 1 次（同一次渲染中 computed 有缓存）
- 在 `watchEffect` 中访问 `double.value`：也只执行 1 次（computed 的缓存在依赖未变化时生效）
- 只有当 `count.value` 变化后，下次访问 `double.value` 才会重新计算

**如果你发现 computed 每次都执行**，可能的原因：

1. getter 中访问了非响应式的变化值（如 `Date.now()`）
2. getter 中每次返回新对象引用（`return { value: count.value }`），虽然 getter 本身有缓存，但下游可能因为引用变化而重新渲染

---

## Bug 4: watch 监听 reactive 的属性

```js
watch(state.user, (newVal) => { ... })
state.user = { name: 'Jerry' }
```

**原因**：`state.user` 在传给 watch 时就被求值了，watch 实际监听的是 `{ name: 'Tom' }` 这个对象的引用。当 `state.user` 被替换为新对象时，watch 仍然监听的是旧对象。

**修复方案**：

```js
// 方案 1：使用 getter 函数
watch(
  () => state.user,
  (newVal) => {
    console.log("user changed", newVal);
  },
);

// 方案 2：监听整个 state，deep: true
watch(
  state,
  (newVal) => {
    console.log("state changed", newVal);
  },
  { deep: true },
);

// 方案 3：如果只想监听 user.name
watch(
  () => state.user.name,
  (newName) => {
    console.log("name changed", newName);
  },
);
```

---

## Bug 5: toRefs 使用场景

**必须用 toRefs 的场景**：

```js
// 从 reactive 解构时
const state = reactive({ x: 1, y: 2 });
const { x, y } = toRefs(state); // ✅ 保持响应式

// Composable 返回 reactive 对象时
function useMouse() {
  const state = reactive({ x: 0, y: 0 });
  return toRefs(state); // 让调用方可以解构
}
const { x, y } = useMouse(); // ✅ 响应式
```

**不需要 toRefs 的场景**：

```js
// 直接使用 ref
const x = ref(0); // 本身就是 ref，不需要 toRefs

// 不解构 reactive
const state = reactive({ x: 1, y: 2 });
// 在 template 中直接用 state.x，不需要 toRefs
```

---

## 响应式使用最佳实践

1. **统一使用 ref**：ref 可以处理所有类型，解构不会丢失响应式（只要记得 .value），比 reactive 更不容易出错
2. **不要解构 reactive 对象**：如果必须解构，用 `toRefs()`
3. **watch reactive 属性时用 getter 函数**：`watch(() => state.xxx, cb)` 而不是 `watch(state.xxx, cb)`
4. **大型只读数据用 shallowRef**：避免深层响应式的性能开销
5. **不要在 reactive 对象上替换整个嵌套对象后期望旧引用仍然有效**
