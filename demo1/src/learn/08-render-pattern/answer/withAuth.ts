import { h, defineComponent, type Component } from "vue";

/**
 * HOC: withAuth — 权限控制高阶组件 — 参考答案
 */

interface AuthOptions {
  roles: string[];
  fallback?: Component;
}

// 模拟获取当前用户角色（实际从 store 获取）
function getCurrentRole(): string {
  return "editor"; // 模拟
}

export function withAuth(
  WrappedComponent: Component,
  options: AuthOptions,
): Component {
  return defineComponent({
    name: `WithAuth(${(WrappedComponent as any).name || "Anonymous"})`,
    setup(_, { slots, attrs }) {
      return () => {
        const currentRole = getCurrentRole();
        const hasPermission = options.roles.includes(currentRole);

        if (hasPermission) {
          // 有权限：渲染原组件，透传 props 和 slots
          return h(WrappedComponent, { ...attrs }, slots);
        }

        // 无权限：渲染 fallback 或默认提示
        if (options.fallback) {
          return h(options.fallback);
        }

        return h("div", { style: { padding: "40px", textAlign: "center" } }, [
          h("h2", "403"),
          h("p", "你没有权限访问此页面"),
        ]);
      };
    },
  });
}
