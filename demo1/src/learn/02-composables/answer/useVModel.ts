import { computed, ref, watch } from "vue";
import type { Ref } from "vue";

interface UseVModelOptions<T> {
  defaultValue?: T;
  eventName?: string;
  passive?: boolean;
}

export function useVModel<T>(
  props: Record<string, any>,
  key: string = "modelValue",
  emit: (event: string, value: T) => void,
  options: UseVModelOptions<T> = {},
): Ref<T> {
  const { defaultValue, eventName, passive = false } = options;

  const event = eventName || `update:${key}`;

  // passive 模式：维护本地状态，同时 emit
  if (passive) {
    const local = ref(props[key] ?? defaultValue) as Ref<T>;

    // 当 props 变化时同步到本地
    watch(
      () => props[key],
      (val) => {
        local.value = val;
      },
    );

    // 当本地变化时 emit
    watch(local, (val) => {
      if (val !== props[key]) {
        emit(event, val);
      }
    });

    return local;
  }

  // 非 passive 模式：直接代理 props，写入时 emit
  return computed<T>({
    get() {
      return props[key] ?? defaultValue;
    },
    set(value) {
      emit(event, value);
    },
  });
}
