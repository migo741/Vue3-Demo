/**
 * TypeScript Composable 类型设计 — 参考答案
 */
import { ref, watch, onUnmounted } from "vue";
import type { Ref } from "vue";

// ============ useStorage ============

export function useStorage<T>(key: string, defaultValue: T): Ref<T> {
  const data = ref<T>(defaultValue) as Ref<T>;

  // 从 localStorage 恢复
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      data.value = JSON.parse(saved);
    }
  } catch {}

  // 监听变化，自动保存
  watch(
    data,
    (val) => {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch {}
    },
    { deep: true },
  );

  return data;
}

// 使用示例：
// const count = useStorage('count', 0)        // Ref<number>
// const user = useStorage('user', { name: '' }) // Ref<{ name: string }>

// ============ useEventBus（类型安全） ============

type EventHandler<T> = T extends undefined ? () => void : (payload: T) => void;

interface EventBusReturn<EventMap extends Record<string, any>> {
  on<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ): void;
  off<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ): void;
  emit<K extends keyof EventMap>(
    ...args: EventMap[K] extends undefined
      ? [event: K]
      : [event: K, payload: EventMap[K]]
  ): void;
  clear(): void;
}

export function useEventBus<
  EventMap extends Record<string, any>,
>(): EventBusReturn<EventMap> {
  const listeners = new Map<keyof EventMap, Set<Function>>();

  const on = <K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(handler);
  };

  const off = <K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ) => {
    listeners.get(event)?.delete(handler);
  };

  const emit = <K extends keyof EventMap>(event: K, payload?: EventMap[K]) => {
    listeners.get(event)?.forEach((handler) => {
      (handler as any)(payload);
    });
  };

  const clear = () => {
    listeners.clear();
  };

  // 组件卸载时自动清理
  onUnmounted(() => {
    clear();
  });

  return { on, off, emit: emit as any, clear };
}

// 使用示例：
// interface MyEvents {
//   'user:login': { userId: string; token: string }
//   'user:logout': undefined
// }
// const bus = useEventBus<MyEvents>()
// bus.on('user:login', (payload) => { /* payload: { userId, token } */ })
// bus.emit('user:login', { userId: '1', token: 'xxx' })
// bus.emit('user:logout') // 不需要 payload

// ============ useFetch（函数重载） ============

// 重载签名
export function useFetch(url: string): {
  data: Ref<any>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
};
export function useFetch<T>(
  url: string,
  options: { transform: (raw: any) => T },
): {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
};

// 实现
export function useFetch<T = any>(
  url: string,
  options?: { transform: (raw: any) => T },
) {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const doFetch = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(url);
      const raw = await res.json();
      data.value = options?.transform ? options.transform(raw) : raw;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
    } finally {
      loading.value = false;
    }
  };

  doFetch();

  return { data, loading, error };
}

// 使用示例：
// const { data } = useFetch('/api/users')  // data: Ref<any>
// const { data } = useFetch<User[]>('/api/users', {
//   transform: (raw) => raw.data.map(toUser)  // data: Ref<User[] | null>
// })
