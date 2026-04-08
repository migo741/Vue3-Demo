import type { Directive, DirectiveBinding } from "vue";

/**
 * v-click-outside — 参考答案
 */

interface ClickOutsideElement extends HTMLElement {
  _clickOutsideHandler?: (e: MouseEvent) => void;
}

export const vClickOutside: Directive = {
  mounted(el: ClickOutsideElement, binding: DirectiveBinding) {
    const handler = (e: MouseEvent) => {
      // 判断点击是否在元素外部
      if (!el.contains(e.target as Node) && el !== e.target) {
        binding.value?.(e);
      }
    };

    el._clickOutsideHandler = handler;
    // 使用 mousedown 而非 click，避免拖拽选中文本时误触发
    // 使用 setTimeout 延迟绑定，避免触发当前点击事件
    setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 0);
  },

  updated(el: ClickOutsideElement, binding: DirectiveBinding) {
    // 回调函数更新时，替换 handler
    if (el._clickOutsideHandler) {
      document.removeEventListener("mousedown", el._clickOutsideHandler);
    }

    const handler = (e: MouseEvent) => {
      if (!el.contains(e.target as Node) && el !== e.target) {
        binding.value?.(e);
      }
    };

    el._clickOutsideHandler = handler;
    document.addEventListener("mousedown", handler);
  },

  unmounted(el: ClickOutsideElement) {
    if (el._clickOutsideHandler) {
      document.removeEventListener("mousedown", el._clickOutsideHandler);
      delete el._clickOutsideHandler;
    }
  },
};

export default vClickOutside;
