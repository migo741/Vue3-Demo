import { h, defineComponent, type Component } from "vue";

/**
 * HOC: withLoading
 *
 * 给任意组件添加 loading 遮罩层
 *
 * TODO: 实现这个高阶组件
 *
 * 使用方式：
 *   const EnhancedTable = withLoading(MyTable)
 *   <EnhancedTable :loading="isLoading" :data="tableData" />
 *
 * 要求：
 * 1. loading 为 true 时，在原组件上方显示 loading 遮罩
 * 2. 透传所有 props（除了 loading）给原组件
 * 3. 透传所有 slots 给原组件
 * 4. 透传所有 emit 事件
 *
 * 提示：
 * - 使用 h() 函数创建 VNode
 * - 使用 $attrs 透传属性
 * - 使用 $slots 透传插槽
 */

export function withLoading(WrappedComponent: Component): Component {
  return defineComponent({
    name: `WithLoading(${(WrappedComponent as any).name || "Anonymous"})`,
    props: {
      loading: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { slots, attrs }) {
      // TODO: 实现
      return () => h("div", "Not implemented");
    },
  });
}
