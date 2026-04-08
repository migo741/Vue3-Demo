# Vue3 中高级知识点速查表

> 做题时遇到不确定的知识点，先查这里，再查官方文档

## 响应式 API 选择指南

| 场景                              | 推荐 API                 | 原因                                  |
| --------------------------------- | ------------------------ | ------------------------------------- |
| 基本类型（string/number/boolean） | `ref`                    | reactive 不支持基本类型               |
| 对象/数组                         | `ref` 或 `reactive` 都可 | ref 更统一，reactive 解构会丢失响应式 |
| 大型对象（只需替换引用）          | `shallowRef`             | 避免深层响应式的性能开销              |
| 从 reactive 解构                  | `toRefs(state)`          | 保持响应式                            |
| 只读数据                          | `readonly(state)`        | 防止意外修改                          |
| 模板中不需要的响应式              | `markRaw(obj)`           | 跳过响应式转换                        |

## Composable 设计清单

```
✅ use 前缀命名
✅ 返回 ref 而非 reactive（方便解构）
✅ 接受 ref 或 getter 作为参数（灵活性）
✅ 在 onUnmounted 中清理副作用
✅ 处理 SSR 兼容（避免在 setup 外访问 DOM）
✅ 完整的 TypeScript 类型
❌ 不要在 Composable 内部使用 await（除非有 Suspense）
❌ 不要假设组件一定已挂载
```

## 组件通信方式对照

| 方式             | 适用场景           | 方向          |
| ---------------- | ------------------ | ------------- |
| props / emit     | 父子组件           | 父→子 / 子→父 |
| v-model          | 父子双向绑定       | 双向          |
| provide / inject | 跨层级             | 祖先→后代     |
| Pinia            | 全局/跨组件        | 任意          |
| EventBus         | 兄弟组件（不推荐） | 任意          |
| expose / ref     | 父调用子方法       | 父→子         |

## 性能优化速查

```
渲染优化：
- v-once: 只渲染一次的静态内容
- v-memo: 有条件地跳过更新（配合 v-for）
- shallowRef: 大对象只监听引用变化
- 组件拆分: 减少不必要的子组件重渲染

加载优化：
- 路由懒加载: () => import('./Page.vue')
- 组件懒加载: defineAsyncComponent(() => import('./Heavy.vue'))
- 图片懒加载: IntersectionObserver

列表优化：
- 虚拟滚动: 只渲染可视区域
- key 的正确使用: 唯一且稳定的 id
```

## 常见面试题快速回答

Q: ref 和 reactive 的区别？
A: ref 用 .value 访问，支持基本类型；reactive 直接访问，只支持对象。ref 底层对象类型也是用 reactive 实现的。

Q: watch 和 watchEffect 的区别？
A: watch 需要指定监听源，可以获取新旧值，默认懒执行；watchEffect 自动收集依赖，立即执行，无法获取旧值。

Q: Vue3 的 diff 算法？
A: 双端对比 + 最长递增子序列（LIS），比 Vue2 的双端对比更高效。

Q: Composition API 相比 Options API 的优势？
A: 更好的逻辑复用（Composable）、更好的类型推断、更灵活的代码组织、更小的打包体积（tree-shaking）。
