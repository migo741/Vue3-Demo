import type { Directive, DirectiveBinding } from "vue";

/**
 * v-permission — 参考答案
 */

// 实际项目中从 Pinia store 获取
function getCurrentPermissions(): string[] {
  return ["user:view", "user:edit", "article:view", "article:edit"];
}

export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const permissions = getCurrentPermissions();

    // 支持字符串和数组
    const requiredPermissions = Array.isArray(value) ? value : [value];

    // OR 逻辑：满足其一即可
    const hasPermission = requiredPermissions.some((perm: string) =>
      permissions.includes(perm),
    );

    if (!hasPermission) {
      // 移除 DOM 元素（比 display:none 更安全，因为用户无法通过 DevTools 修改样式来显示）
      el.parentNode?.removeChild(el);
    }
  },
};

export default vPermission;
