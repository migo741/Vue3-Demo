import { computed, ref, watch } from "vue";
import type { Ref } from "vue";

/**
 * 简化组件 v-model 的 Hook
 *
 * TODO: 实现以下功能
 * 1. 返回一个可读写的 Ref
 * 2. 写入时自动 emit 对应事件
 * 3. 支持自定义 eventName
 * 4. 支持 defaultValue
 * 5. 支持 passive 模式（本地状态 + emit）
 *
 * 使用示例：
 * const value = useVModel(props, 'modelValue', emit)
 * // template 中直接 v-model="value"
 */

interface UseVModelOptions<T> {
  defaultValue?: T;
  eventName?: string;
  passive?: boolean;
}

export function useVModel<T>(
  props: Record<string, any>,
  key: string,
  emit: (event: string, value: T) => void,
  options: UseVModelOptions<T> = {},
): Ref<T> {
  // TODO: 实现
  throw new Error("Not implemented");
}
