import type { Directive, DirectiveBinding } from "vue";

/**
 * v-debounce 防抖指令 — 参考答案
 *
 * 用法：
 *   <input v-debounce:500="handleSearch" />          — input 事件防抖 500ms
 *   <button v-debounce:1000.click="handleSubmit" />  — click 事件防抖 1000ms
 */

interface DebounceElement extends HTMLElement {
  _debounceHandler?: EventListenerOrEventListenerObject;
  _debounceEvent?: string;
}

export const vDebounce: Directive = {
  mounted(el: DebounceElement, binding: DirectiveBinding) {
    const delay = parseInt(binding.arg || "300", 10);
    const callback = binding.value;

    if (typeof callback !== "function") {
      console.warn("[v-debounce] binding value must be a function");
      return;
    }

    // 判断事件类型：通过 modifiers 指定，默认 input
    const eventType = Object.keys(binding.modifiers)[0] || "input";

    let timer: ReturnType<typeof setTimeout> | null = null;

    const handler = (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        callback(...args);
      }, delay);
    };

    el.addEventListener(eventType, handler);
    el._debounceHandler = handler;
    el._debounceEvent = eventType;
  },

  unmounted(el: DebounceElement) {
    if (el._debounceHandler && el._debounceEvent) {
      el.removeEventListener(el._debounceEvent, el._debounceHandler);
      delete el._debounceHandler;
      delete el._debounceEvent;
    }
  },
};

export default vDebounce;
