/**
 * h 函数 / JSX 重写 Button — 参考答案
 */
import { defineComponent, h, type PropType, type Component } from "vue";

// ============ 方式 1：h() 函数版本 ============

export const ButtonH = defineComponent({
  name: "ButtonH",
  props: {
    type: {
      type: String as PropType<"primary" | "danger" | "default">,
      default: "default",
    },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    icon: { type: Object as PropType<Component>, default: null },
    text: { type: String, default: "" },
  },
  setup(props, { slots }) {
    return () => {
      const children = [];

      // icon
      if (props.icon) {
        children.push(h("span", { class: "btn-icon" }, [h(props.icon)]));
      }

      // text / slot
      children.push(
        h("span", { class: "btn-text" }, slots.default?.() ?? props.text),
      );

      // loading
      if (props.loading) {
        children.push(h("span", { class: "btn-loading" }, "⏳"));
      }

      return h(
        "div",
        {
          class: [
            "btn",
            `btn-${props.type}`,
            { "btn-disabled": props.disabled },
          ],
        },
        children,
      );
    };
  },
});

// ============ 方式 2：JSX 版本 ============
// 注意：需要安装 @vitejs/plugin-vue-jsx

export const ButtonJSX = defineComponent({
  name: "ButtonJSX",
  props: {
    type: {
      type: String as PropType<"primary" | "danger" | "default">,
      default: "default",
    },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    icon: { type: Object as PropType<Component>, default: null },
    text: { type: String, default: "" },
  },
  setup(props, { slots }) {
    return () => {
      const Icon = props.icon;

      return (
        <div
          class={[
            "btn",
            `btn-${props.type}`,
            { "btn-disabled": props.disabled },
          ]}
        >
          {Icon && (
            <span class="btn-icon">
              <Icon />
            </span>
          )}
          <span class="btn-text">{slots.default?.() ?? props.text}</span>
          {props.loading && <span class="btn-loading">⏳</span>}
        </div>
      );
    };
  },
});

/**
 * 三种写法对比：
 *
 * Template:
 * - 优点：直观、IDE 支持好、编译优化（静态提升、patch flag）
 * - 缺点：动态性差，复杂逻辑需要大量 v-if/v-for
 * - 适用：90% 的常规组件
 *
 * h() 函数:
 * - 优点：完全的 JS 表达力，适合高度动态的渲染逻辑
 * - 缺点：可读性差，嵌套深时难以维护
 * - 适用：HOC、动态组件、库/框架开发
 *
 * JSX:
 * - 优点：兼顾可读性和动态性，React 开发者友好
 * - 缺点：需要额外配置，无法享受 template 的编译优化
 * - 适用：复杂渲染逻辑、从 React 迁移的项目
 */
