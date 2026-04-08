import type { Directive, DirectiveBinding } from "vue";

/**
 * v-lazy 图片懒加载 — 参考答案
 */

interface LazyOptions {
  src: string;
  loading?: string;
  error?: string;
}

interface LazyElement extends HTMLImageElement {
  _lazyObserver?: IntersectionObserver;
}

const DEFAULT_LOADING =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==";

function parseOptions(binding: DirectiveBinding): LazyOptions {
  if (typeof binding.value === "string") {
    return { src: binding.value };
  }
  return binding.value as LazyOptions;
}

export const vLazy: Directive = {
  mounted(el: LazyElement, binding: DirectiveBinding) {
    const options = parseOptions(binding);

    // 设置占位图
    el.src = options.loading || DEFAULT_LOADING;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 进入可视区域，加载真实图片
            const img = new Image();
            img.src = options.src;

            img.onload = () => {
              el.src = options.src;
            };

            img.onerror = () => {
              if (options.error) {
                el.src = options.error;
              }
            };

            // 加载后取消观察
            observer.unobserve(el);
          }
        });
      },
      { rootMargin: "200px" }, // 提前 200px 开始加载
    );

    observer.observe(el);
    el._lazyObserver = observer;
  },

  updated(el: LazyElement, binding: DirectiveBinding) {
    // src 变化时重新观察
    if (binding.value !== binding.oldValue) {
      const options = parseOptions(binding);
      el.src = options.loading || DEFAULT_LOADING;

      if (el._lazyObserver) {
        el._lazyObserver.disconnect();
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.src = options.src;
              observer.unobserve(el);
            }
          });
        },
        { rootMargin: "200px" },
      );

      observer.observe(el);
      el._lazyObserver = observer;
    }
  },

  unmounted(el: LazyElement) {
    if (el._lazyObserver) {
      el._lazyObserver.disconnect();
      delete el._lazyObserver;
    }
  },
};

export default vLazy;
