/**
 * Mini Vue3 Reactivity System
 *
 * 请实现以下所有函数，不要使用 Vue 的任何 API
 * 提示：先实现 effect 和 reactive，再实现 ref、computed、watch
 */

// ============ 核心：依赖收集系统 ============

// TODO: 定义全局变量
// targetMap: WeakMap<target, Map<key, Set<effect>>>
// activeEffect: 当前正在执行的 effect
// effectStack: effect 栈（处理嵌套）
let activeEffect = null;
const effectStack = [];
const targetMap = new WeakMap();

/**
 * 收集依赖
 */
export function track(target, key) {
  // TODO
  if (activeEffect) {
    const depMap = targetMap.get(target);
    if (!depMap) {
      depMap = new Map();
      targetMap.set(target, depMap);
    }
    const deps = depMap.get(key);
    if (!deps) {
      deps = new Set();
      depMap.set(key, deps);
    }
    deps.add(activeEffect);
  }
}

/**
 * 触发更新
 */
export function trigger(target, key) {
  // TODO
  const depMap = targetMap.get(target);
  const deps = depMap.get(key);
  const effectsToRun = new Set(deps);
  effectsToRun.forEach((fn) => {
    if (fn !== activeEffect) {
      if (fn.scheduler) {
        fn.scheduler();
      } else {
        {
          fn();
        }
      }
    }
  });
}

// ============ reactive ============

/**
 * 将普通对象转为响应式对象（基于 Proxy）
 * 要求：支持嵌套对象的深层响应式
 */
const reactiveMap = new WeakMap();
export function reactive(target) {
  // TODO
  if (target === null && typeof target !== "object") return target;
  if (reactiveMap.has(target)) return reactiveMap.get(target);
  const proxy = new Proxy(target, {
    get(target, key) {
      const res = Reflect.get(target, key);
      track(target, key);
      if (typeof res === "object" && res !== null) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, val) {
      const oldValue = target[key];
      const res = Reflect.set(target, key, val);
      if (oldValue !== val) {
        trigger(target, key);
      }
      return res;
    },
  });
  reactiveMap.set(target, proxy);
  return proxy;
}

// ============ ref ============

/**
 * 将基本类型包装为响应式
 * 通过 .value 访问和修改
 */
export function ref(value) {
  // TODO
  const wrapper = {
    __v_isRef: true,
    get value() {
      track(wrapper, "value");
      return value;
    },
    set value(val) {
      value = val;
      trigger(wrapper, "value", val);
    },
  };
}

// ============ effect ============

/**
 * 副作用函数，自动收集依赖，依赖变化时重新执行
 */
export function effect(fn) {
  // TODO
}

// ============ computed ============

/**
 * 计算属性
 * 要求：惰性求值 + 缓存（dirty 标记）
 */
export function computed(getter) {
  // TODO
}

// ============ watch ============

/**
 * 侦听器
 * 要求：支持监听 ref 和 reactive 对象
 * options: { immediate?: boolean }
 */
export function watch(source, callback, options = {}) {
  // TODO
}
