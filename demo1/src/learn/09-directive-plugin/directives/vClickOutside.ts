import type { Directive, DirectiveBinding } from "vue";

/**
 * v-click-outside 指令
 *
 * TODO: 实现点击元素外部时触发回调
 *
 * 使用方式：
 *   <div v-click-outside="handleClose">
 *     <Dropdown />
 *   </div>
 *
 * 要求：
 * 1. 点击元素外部时调用 binding.value（回调函数）
 * 2. 点击元素内部时不触发
 * 3. unmounted 时移除事件监听
 * 4. 处理 binding.value 更新的情况
 *
 * 提示：
 * - 在 document 上监听 click 事件
 * - 使用 el.contains(event.target) 判断是否点击在元素内部
 * - 注意事件冒泡的时机（使用 mousedown 可能比 click 更好）
 */

export const vClickOutside: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // TODO: 实现
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    // TODO: 处理回调函数更新
  },
  unmounted(el: HTMLElement) {
    // TODO: 清理事件监听
  },
};

export default vClickOutside;
