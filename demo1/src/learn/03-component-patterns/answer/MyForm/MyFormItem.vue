<template>
  <div class="my-form-item" :class="{ 'has-error': errorMsg }">
    <label v-if="label" class="my-form-item__label">{{ label }}</label>
    <div class="my-form-item__content">
      <slot />
      <p v-if="errorMsg" class="my-form-item__error">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed } from "vue";

interface Rule {
  required?: boolean;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string;
  message?: string;
}

const props = defineProps<{
  label?: string;
  prop?: string;
}>();

const formContext = inject<any>("formContext");
const errorMsg = ref<string | null>(null);

// 获取当前字段的值
const fieldValue = computed(() => {
  if (!props.prop || !formContext) return undefined;
  return formContext.model[props.prop];
});

// 获取当前字段的校验规则
const fieldRules = computed<Rule[]>(() => {
  if (!props.prop || !formContext) return [];
  return formContext.rules[props.prop] || [];
});

// 校验当前字段
const validate = async (): Promise<string | null> => {
  errorMsg.value = null;
  const value = fieldValue.value;

  for (const rule of fieldRules.value) {
    // required 校验
    if (
      rule.required &&
      (value === "" || value === null || value === undefined)
    ) {
      errorMsg.value = rule.message || `${props.label || props.prop} 不能为空`;
      return errorMsg.value;
    }

    // pattern 校验
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errorMsg.value =
        rule.message || `${props.label || props.prop} 格式不正确`;
      return errorMsg.value;
    }

    // 自定义校验
    if (rule.validator) {
      const result = rule.validator(value);
      if (result !== true && typeof result === "string") {
        errorMsg.value = result;
        return errorMsg.value;
      }
      if (result === false) {
        errorMsg.value =
          rule.message || `${props.label || props.prop} 校验失败`;
        return errorMsg.value;
      }
    }
  }

  return null;
};

// 注册到 Form
onMounted(() => {
  if (props.prop && formContext) {
    formContext.registerField(props.prop, validate);
  }
});

onUnmounted(() => {
  if (props.prop && formContext) {
    formContext.unregisterField(props.prop);
  }
});
</script>

<style scoped>
.my-form-item {
  margin-bottom: 16px;
}
.my-form-item__label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}
.my-form-item__error {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}
.has-error :deep(input) {
  border-color: #e53e3e;
}
</style>
