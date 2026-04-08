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

/**
 * 收集依赖
 */
export function track(target, key) {
  // TODO
}

/**
 * 触发更新
 */
export function trigger(target, key) {
  // TODO
}

// ============ reactive ============

/**
 * 将普通对象转为响应式对象（基于 Proxy）
 * 要求：支持嵌套对象的深层响应式
 */
export function reactive(target) {
  // TODO
}

// ============ ref ============

/**
 * 将基本类型包装为响应式
 * 通过 .value 访问和修改
 */
export function ref(value) {
  // TODO
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
