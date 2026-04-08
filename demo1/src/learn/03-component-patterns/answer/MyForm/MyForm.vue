<template>
  <form @submit.prevent class="my-form">
    <slot />
  </form>
</template>

<script setup lang="ts">
import { provide, reactive, toRaw } from "vue";

interface Rule {
  required?: boolean;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string;
  message?: string;
}

interface FormContext {
  model: Record<string, any>;
  rules: Record<string, Rule[]>;
  validateField: (prop: string) => Promise<string | null>;
}

const props = defineProps<{
  model: Record<string, any>;
  rules?: Record<string, Rule[]>;
}>();

const fieldValidators = new Map<string, () => Promise<string | null>>();

// 注册子组件的校验函数
const registerField = (
  prop: string,
  validateFn: () => Promise<string | null>,
) => {
  fieldValidators.set(prop, validateFn);
};

const unregisterField = (prop: string) => {
  fieldValidators.delete(prop);
};

// 校验单个字段
const validateField = async (prop: string): Promise<string | null> => {
  const validator = fieldValidators.get(prop);
  if (!validator) return null;
  return validator();
};

// 全量校验
const validate = async (): Promise<boolean> => {
  const results = await Promise.all(
    Array.from(fieldValidators.values()).map((fn) => fn()),
  );
  return results.every((r) => r === null);
};

// 重置表单
const resetFields = () => {
  // 通知所有 FormItem 重置
  fieldValidators.forEach((_, prop) => {
    // 重置为初始值（简化处理）
  });
};

// 通过 provide 向下传递
provide("formContext", {
  model: props.model,
  rules: props.rules || {},
  registerField,
  unregisterField,
});

// 暴露给父组件
defineExpose({
  validate,
  validateField,
  resetFields,
});
</script>
