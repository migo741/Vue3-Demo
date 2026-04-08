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
  throw new Error("Not implemented");
}
