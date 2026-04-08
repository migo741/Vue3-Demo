/**
 * Pinia 持久化插件 — 参考答案
 */
import type { PiniaPluginContext } from "pinia";

interface PersistedOptions {
  enabled?: boolean;
  key?: string;
  paths?: string[];
  storage?: Storage;
}

// 在 store 的 $options 上声明持久化配置
declare module "pinia" {
  export interface DefineStoreOptionsBase<S, Store> {
    persisted?: PersistedOptions;
  }
}

// 从嵌套对象中按路径取值
function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

// 按路径设置值
function setByPath(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  const last = keys.pop()!;
  const target = keys.reduce((acc, key) => {
    if (!(key in acc)) acc[key] = {};
    return acc[key];
  }, obj);
  target[last] = value;
}

export function piniaPersistedPlugin(context: PiniaPluginContext) {
  const { store, options } = context;
  const persisted = (options as any).persisted as PersistedOptions | undefined;

  // 未配置或未启用，跳过
  if (!persisted || persisted.enabled === false) return;

  const {
    key = `pinia-${store.$id}`,
    paths,
    storage = localStorage,
  } = persisted;

  // ---- 恢复状态 ----
  try {
    const saved = storage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);

      if (paths && paths.length > 0) {
        // 只恢复指定字段
        const partial: Record<string, any> = {};
        paths.forEach((path) => {
          const value = getByPath(parsed, path);
          if (value !== undefined) {
            setByPath(partial, path, value);
          }
        });
        store.$patch(partial);
      } else {
        store.$patch(parsed);
      }
    }
  } catch (e) {
    console.warn(
      `[pinia-persisted] Failed to restore state for "${store.$id}":`,
      e,
    );
  }

  // ---- 监听变化，自动保存 ----
  store.$subscribe(
    (_mutation, state) => {
      try {
        let toSave: any;

        if (paths && paths.length > 0) {
          // 只保存指定字段
          toSave = {};
          paths.forEach((path) => {
            const value = getByPath(state, path);
            if (value !== undefined) {
              setByPath(toSave, path, value);
            }
          });
        } else {
          toSave = state;
        }

        storage.setItem(key, JSON.stringify(toSave));
      } catch (e) {
        console.warn(
          `[pinia-persisted] Failed to save state for "${store.$id}":`,
          e,
        );
      }
    },
    { detached: true }, // 组件卸载后仍然监听
  );
}

/**
 * 使用示例：
 *
 * import { createPinia } from 'pinia'
 * import { piniaPersistedPlugin } from './pinia-persisted-plugin'
 *
 * const pinia = createPinia()
 * pinia.use(piniaPersistedPlugin)
 *
 * // 在 store 中配置
 * export const useCartStore = defineStore('cart', {
 *   state: () => ({ items: [], total: 0 }),
 *   persisted: {
 *     enabled: true,
 *     paths: ['items'],           // 只持久化 items
 *     storage: localStorage,      // 默认 localStorage
 *   },
 * })
 */
