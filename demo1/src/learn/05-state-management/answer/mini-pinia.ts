import { reactive, computed, toRaw } from "vue";

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
  const { id, state: stateFn, getters = {} as G, actions = {} as A } = options;

  return function useStore() {
    // 单例：如果已经创建过，直接返回
    if (storeMap.has(id)) {
      return storeMap.get(id);
    }

    // 1. 创建响应式 state
    const initialState = stateFn();
    const state = reactive({ ...initialState }) as S;

    // 2. 创建 computed getters
    const computedGetters: Record<string, any> = {};
    for (const key in getters) {
      computedGetters[key] = computed(() => (getters as any)[key](state));
    }

    // 3. 绑定 actions 的 this
    const boundActions: Record<string, any> = {};
    for (const key in actions) {
      boundActions[key] = (...args: any[]) => {
        return (actions as any)[key].apply(store, args);
      };
    }

    // 4. $reset：重置到初始状态
    const $reset = () => {
      const fresh = stateFn();
      Object.keys(fresh).forEach((key) => {
        (state as any)[key] = (fresh as any)[key];
      });
    };

    // 5. $patch：批量更新
    const $patch = (partialOrFn: Partial<S> | ((state: S) => void)) => {
      if (typeof partialOrFn === "function") {
        partialOrFn(state);
      } else {
        Object.keys(partialOrFn).forEach((key) => {
          (state as any)[key] = (partialOrFn as any)[key];
        });
      }
    };

    // 组装 store 对象
    // 使用 Proxy 让 store.count 直接访问 state.count
    // store.double 访问 computedGetters.double.value
    const store = new Proxy(
      { $reset, $patch, $id: id },
      {
        get(target, key: string) {
          // 内置方法优先
          if (key in target) return (target as any)[key];
          // actions
          if (key in boundActions) return boundActions[key];
          // getters（返回 .value）
          if (key in computedGetters) return computedGetters[key].value;
          // state
          if (key in state) return (state as any)[key];
          return undefined;
        },
        set(target, key: string, value) {
          if (key in state) {
            (state as any)[key] = value;
            return true;
          }
          return false;
        },
      },
    );

    storeMap.set(id, store);
    return store;
  };
}
