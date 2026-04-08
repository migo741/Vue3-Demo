import type { Directive, DirectiveBinding } from "vue";

/**
 * v-permission 指令
 *
 * TODO: 实现权限控制指令
 *
 * 使用方式：
 *   <button v-permission="'user:delete'">删除用户</button>
 *   <button v-permission="['user:edit', 'user:admin']">编辑</button>
 *
 * 要求：
 * 1. 从全局状态（或 provide/inject）获取当前用户权限列表
 * 2. 如果用户没有对应权限，移除该 DOM 元素
 * 3. 支持字符串和数组两种传参方式
 * 4. 数组时满足其一即可（OR 逻辑）
 *
 * 提示：
 * - 使用 el.parentNode.removeChild(el) 移除元素
 * - 或者使用 el.style.display = 'none'（但这种方式不够安全）
 * - 思考：为什么移除 DOM 比隐藏更安全？
 */

// 模拟获取当前用户权限（实际项目中从 store 获取）
function getCurrentPermissions(): string[] {
  // TODO: 替换为从 Pinia store 获取
  return ["user:view", "user:edit", "article:view", "article:edit"];
}

export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // TODO: 实现
  },
};

export default vPermission;
