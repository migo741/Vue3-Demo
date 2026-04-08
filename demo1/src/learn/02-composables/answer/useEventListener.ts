import { watch, onUnmounted, unref, isRef } from "vue";
import type { Ref } from "vue";

type MaybeRef<T> = T | Ref<T>;
type EventTarget = Window | Document | HTMLElement;

export function useEventListener(
  target: MaybeRef<EventTarget | null | undefined>,
  event: string | string[],
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): () => void {
  const events = Array.isArray(event) ? event : [event];
  let cleanups: (() => void)[] = [];

  const cleanup = () => {
    cleanups.forEach((fn) => fn());
    cleanups = [];
  };

  const bindEvents = (el: EventTarget | null | undefined) => {
    cleanup();
    if (!el) return;

    events.forEach((evt) => {
      el.addEventListener(evt, handler, options);
      cleanups.push(() => el.removeEventListener(evt, handler, options));
    });
  };

  // 如果 target 是 Ref，watch 它的变化
  if (isRef(target)) {
    watch(
      target,
      (newTarget) => {
        bindEvents(newTarget as EventTarget);
      },
      { immediate: true },
    );
  } else {
    // 普通值，直接绑定
    bindEvents(target as EventTarget);
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    cleanup();
  });

  // 返回手动清理函数
  return cleanup;
}
