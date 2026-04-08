import { ref, onUnmounted } from "vue";
import type { Ref } from "vue";

interface UseRequestOptions<T> {
  immediate?: boolean;
  initialData?: T;
  debounceInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseRequestReturn<T> {
  data: Ref<T | undefined>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  run: (...args: any[]) => Promise<T>;
  cancel: () => void;
  refresh: () => Promise<T>;
  mutate: (newData: T) => void;
}

export function useRequest<T>(
  service: (...args: any[]) => Promise<T>,
  options: UseRequestOptions<T> = {},
): UseRequestReturn<T> {
  const {
    immediate = true,
    initialData,
    debounceInterval,
    onSuccess,
    onError,
  } = options;

  const data = ref<T | undefined>(initialData) as Ref<T | undefined>;
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // 竞态处理：每次请求生成唯一 id，只保留最后一次
  let requestCount = 0;
  let cancelled = false;
  let lastArgs: any[] = [];
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const run = (...args: any[]): Promise<T> => {
    lastArgs = args;

    // 防抖
    if (debounceInterval) {
      if (debounceTimer) clearTimeout(debounceTimer);
      return new Promise((resolve, reject) => {
        debounceTimer = setTimeout(() => {
          executeRequest(args).then(resolve).catch(reject);
        }, debounceInterval);
      });
    }

    return executeRequest(args);
  };

  const executeRequest = async (args: any[]): Promise<T> => {
    const currentCount = ++requestCount;
    loading.value = true;
    error.value = null;

    try {
      const result = await service(...args);

      // 竞态处理：如果不是最后一次请求，丢弃结果
      if (currentCount !== requestCount) return result;
      // 取消处理
      if (cancelled) return result;

      data.value = result;
      onSuccess?.(result);
      return result;
    } catch (err) {
      if (currentCount !== requestCount) throw err;
      if (cancelled) throw err;

      const e = err instanceof Error ? err : new Error(String(err));
      error.value = e;
      onError?.(e);
      throw e;
    } finally {
      if (currentCount === requestCount) {
        loading.value = false;
      }
    }
  };

  const cancel = () => {
    cancelled = true;
    requestCount++; // 让正在进行的请求结果被丢弃
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    loading.value = false;
  };

  const refresh = () => {
    return run(...lastArgs);
  };

  const mutate = (newData: T) => {
    data.value = newData;
  };

  // 组件卸载时自动取消
  onUnmounted(() => {
    cancel();
  });

  // 立即执行
  if (immediate) {
    run();
  }

  return { data, loading, error, run, cancel, refresh, mutate };
}
