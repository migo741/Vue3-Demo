import { reactive, computed, type ComputedRef } from "vue";

/**
 * Mini Pinia — 迷你状态管理
 *
 * TODO: 实现 createStore 函数
 *
 * 要求：
 * 1. state 是响应式的
 * 2. getters 基于 computed 实现
 * 3. actions 中的 this 指向 store 实例
 * 4. 支持 $reset() 重置到初始状态
 * 5. 支持 $patch() 批量更新
 * 6. 多次调用返回同一个实例（单例）
 *
 * 使用示例：
 *
 * const useCounterStore = createStore({
 *   id: 'counter',
 *   state: () => ({ count: 0 }),
 *   getters: {
 *     double: (state) => state.count * 2,
 *   },
 *   actions: {
 *     increment() { this.count++ },
 *   }
 * })
 *
 * const store = useCounterStore()
 * store.count       // 0
 * store.double      // 0
 * store.increment()
 * store.count       // 1
 * store.double      // 2
 * store.$reset()
 * store.count       // 0
 */

interface StoreOptions<S, G, A> {
  id: string;
  state: () => S;
  getters?: G;
  actions?: A;
}

const storeMap = new Map<string, any>();

export function createStore<
  S extends Record<string, any>,
  G extends Record<string, (state: S) => any>,
  A extends Record<string, (...args: any[]) => any>,
>(options: StoreOptions<S, G, A>) {
  return function useStore() {
    // TODO: 实现
    // 提示：
    // 1. 检查 storeMap 是否已有实例（单例）
    // 2. 用 reactive 包装 state
    // 3. 用 computed 包装 getters
    // 4. 绑定 actions 的 this
    // 5. 添加 $reset 和 $patch 方法
    throw new Error("Not implemented");
  };
}
