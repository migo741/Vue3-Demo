import { ref, onUnmounted } from "vue";
import type { Ref } from "vue";

/**
 * 通用请求 Hook
 *
 * TODO: 实现以下功能
 * 1. loading / error / data 三态管理
 * 2. 防抖（debounceInterval）
 * 3. 取消请求（组件卸载时自动取消）
 * 4. 竞态处理（只保留最后一次请求的结果）
 * 5. refresh（用上次参数重新请求）
 * 6. mutate（手动修改 data）
 */

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
  // TODO: 实现
  const { immediate, initialData, debounceInterval, onSuccess, onError } =
    options;
  const data = ref(initialData);
  const loading = ref(false);
  const error = ref(null);

  let requestId = 0;
  let currentPromise = null;
  let aborted = false;
  let timer: any = null;
  let lastArgs: any[] = [];

  const run = (...args: any[]) => {
    lastArgs = args;
    if (timer) {
      clearTimeout(timer);
    }
    return new Promise((resolve, reject) => {
      const exec = () => {
        const id = ++requestId;
        loading.value = true;
        error.value = null;
        const p = service(...args);
        currentPromise = p;

        p.then((res) => {
          if (id !== requestId || aborted) return;
          data.value = res;
          onSuccess?.(res);
          resolve(res);
        }).catch((err) => {
          if (id !== requestId) return;
          error.value = err;
          onError?.(err);
          reject(err);
        });
      };
      if (debounceInterval > 0) {
        timer = setTimeout(exec, debounceInterval);
      } else {
        exec();
      }
    });
  };
  const cancel = () => {
    aborted = true;
    loading.value = false;
  };
  const refresh = () => {
    return run(...lastArgs);
  };
  const mutate = (newVal) => {
    data.value = newVal;
  };
  onUnmounted(() => {
    cancel();
    if (timer) {
      clearTimeout(timer);
    }
    if (immediate) {
      run();
    }
  });

  throw new Error("Not implemented");
}
