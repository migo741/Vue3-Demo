/**
 * Mini Vue3 Reactivity System — 参考答案
 */

// ============ 核心：依赖收集系统 ============

const targetMap = new WeakMap();
let activeEffect = null;
const effectStack = [];

export function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const deps = depsMap.get(key);
  if (!deps) return;
  // 复制一份避免无限循环
  const effectsToRun = new Set(deps);
  effectsToRun.forEach((fn) => {
    // 避免递归触发自身
    if (fn !== activeEffect) {
      if (fn.scheduler) {
        fn.scheduler();
      } else {
        fn();
      }
    }
  });
}

// ============ reactive ============

const reactiveMap = new WeakMap();

export function reactive(target) {
  if (typeof target !== "object" || target === null) return target;
  // 避免重复代理
  if (reactiveMap.has(target)) return reactiveMap.get(target);

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      // 深层响应式：访问嵌套对象时递归代理
      if (typeof result === "object" && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hadKey && result) {
        trigger(target, key);
      }
      return result;
    },
  });

  reactiveMap.set(target, proxy);
  return proxy;
}

// ============ ref ============

export function ref(value) {
  const wrapper = {
    get value() {
      track(wrapper, "value");
      return value;
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue;
        trigger(wrapper, "value");
      }
    },
  };
  // 标记为 ref（Vue 源码中用 __v_isRef）
  Object.defineProperty(wrapper, "__v_isRef", { value: true });
  return wrapper;
}

// ============ effect ============

export function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    effectStack.push(effectFn);
    try {
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  };
  // 立即执行一次，收集依赖
  effectFn();
  return effectFn;
}

// ============ computed ============

export function computed(getter) {
  let cachedValue;
  let dirty = true;

  const effectFn = effect(() => {
    // 这里不直接执行 getter，而是标记 dirty
    // 但我们需要收集 getter 的依赖
    return getter();
  });

  // 重新实现：用 scheduler 标记 dirty
  // 先清理上面的 effect，用带 scheduler 的版本
  dirty = true;
  cachedValue = undefined;

  const runner = () => {
    activeEffect = runner;
    effectStack.push(runner);
    try {
      return getter();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  };
  runner.scheduler = () => {
    if (!dirty) {
      dirty = true;
      // 当 computed 依赖变化时，触发依赖了这个 computed 的 effect
      trigger(obj, "value");
    }
  };

  // 首次不执行，惰性
  const obj = {
    get value() {
      if (dirty) {
        cachedValue = runner();
        dirty = false;
      }
      track(obj, "value");
      return cachedValue;
    },
  };

  return obj;
}

// ============ watch ============

export function watch(source, callback, options = {}) {
  let getter;
  if (source && source.__v_isRef) {
    getter = () => source.value;
  } else if (typeof source === "function") {
    getter = source;
  } else {
    // reactive 对象，需要深度遍历触发 track
    getter = () => traverse(source);
  }

  let oldValue;
  let cleanup;

  const onCleanup = (fn) => {
    cleanup = fn;
  };

  const job = () => {
    if (cleanup) cleanup();
    const newValue = effectFn();
    callback(newValue, oldValue, onCleanup);
    oldValue = newValue;
  };

  const effectFn = () => {
    activeEffect = effectFn;
    effectStack.push(effectFn);
    try {
      return getter();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  };
  effectFn.scheduler = job;

  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}

// 深度遍历对象，触发所有属性的 track
function traverse(value, seen = new Set()) {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
