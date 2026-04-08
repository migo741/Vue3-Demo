import { ref, shallowRef, onMounted, type Ref } from "vue";

interface UseAsyncStateOptions<T> {
  immediate?: boolean;
  resetOnExecute?: boolean;
  shallow?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncStateReturn<T> {
  state: Ref<T>;
  isReady: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  execute: (...args: any[]) => Promise<T>;
}

export function useAsyncState<T>(
  promise: (...args: any[]) => Promise<T>,
  initialState: T,
  options: UseAsyncStateOptions<T> = {},
): UseAsyncStateReturn<T> {
  const {
    immediate = true,
    resetOnExecute = false,
    shallow = false,
    onSuccess,
    onError,
  } = options;

  const state = (shallow ? shallowRef : ref)(initialState) as Ref<T>;
  const isReady = ref(false);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  let isUnmounted = false;
  let requestId = 0;

  const execute = async (...args: any[]): Promise<T> => {
    const currentId = ++requestId;
    isLoading.value = true;
    error.value = null;

    if (resetOnExecute) {
      state.value = initialState;
    }

    try {
      const result = await promise(...args);

      // 组件已卸载或不是最新请求，不更新状态
      if (isUnmounted || currentId !== requestId) return result;

      state.value = result;
      isReady.value = true;
      onSuccess?.(result);
      return result;
    } catch (err) {
      if (isUnmounted || currentId !== requestId) throw err;

      const e = err instanceof Error ? err : new Error(String(err));
      error.value = e;
      onError?.(e);
      throw e;
    } finally {
      if (currentId === requestId) {
        isLoading.value = false;
      }
    }
  };

  // SSR 安全：在 onMounted 中执行
  if (immediate) {
    onMounted(() => {
      execute();
    });
  }

  // 组件卸载标记（防止卸载后更新状态）
  // 注意：这里不用 onUnmounted 因为可能在 setup 外调用
  // 实际项目中可以用 getCurrentInstance 判断
  try {
    const { onUnmounted: onUnmountedHook } = require("vue");
    onUnmountedHook(() => {
      isUnmounted = true;
    });
  } catch {
    // 在 setup 外调用时忽略
  }

  return { state, isReady, isLoading, error, execute };
}
