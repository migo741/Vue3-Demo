/**
 * Toast 插件 — 参考答案
 *
 * 使用方式：
 *   app.use(ToastPlugin, { position: 'top-right', duration: 3000 })
 *
 *   // Composition API
 *   const toast = useToast()
 *   toast.success('操作成功')
 *
 *   // Options API
 *   this.$toast.success('操作成功')
 *
 *   // 直接导入
 *   import { toast } from './ToastPlugin'
 *   toast.success('操作成功')
 */
import {
  createApp,
  ref,
  type App,
  type ComponentPublicInstance,
  inject,
  type InjectionKey,
} from "vue";
import ToastComponent from "./Toast.vue";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

interface ToastOptions {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  duration?: number;
  maxCount?: number;
}

interface ToastApi {
  success: (content: string, duration?: number) => () => void;
  error: (content: string, duration?: number) => () => void;
  info: (content: string, duration?: number) => () => void;
  warning: (content: string, duration?: number) => () => void;
  loading: (content: string) => () => void;
  closeAll: () => void;
}

const TOAST_KEY: InjectionKey<ToastApi> = Symbol("toast");

let toastInstance: ComponentPublicInstance | null = null;
let defaultOptions: ToastOptions = {};

function getToastInstance(): ComponentPublicInstance {
  if (toastInstance) return toastInstance;

  const container = document.createElement("div");
  document.body.appendChild(container);

  const app = createApp(ToastComponent, {
    position: defaultOptions.position || "top-right",
    maxCount: defaultOptions.maxCount || 5,
  });

  toastInstance = app.mount(container);
  return toastInstance;
}

function createToastMethod(type: ToastType) {
  return (content: string, duration?: number): (() => void) => {
    const instance = getToastInstance() as any;
    const dur =
      type === "loading" ? 0 : (duration ?? defaultOptions.duration ?? 3000);
    return instance.add(type, content, dur, true);
  };
}

// 可直接导入使用的 toast 对象
export const toast: ToastApi = {
  success: createToastMethod("success"),
  error: createToastMethod("error"),
  info: createToastMethod("info"),
  warning: createToastMethod("warning"),
  loading: createToastMethod("loading"),
  closeAll: () => {
    const instance = getToastInstance() as any;
    instance.clear();
  },
};

// Composition API: useToast()
export function useToast(): ToastApi {
  // 优先从 inject 获取（确保使用同一个实例）
  const injected = inject(TOAST_KEY, null);
  return injected || toast;
}

// Vue 插件
export const ToastPlugin = {
  install(app: App, options: ToastOptions = {}) {
    defaultOptions = options;

    // 1. provide 注入（支持 useToast）
    app.provide(TOAST_KEY, toast);

    // 2. 全局属性（支持 this.$toast）
    app.config.globalProperties.$toast = toast;
  },
};

// 类型声明（让 this.$toast 有类型提示）
declare module "vue" {
  interface ComponentCustomProperties {
    $toast: ToastApi;
  }
}

export default ToastPlugin;
