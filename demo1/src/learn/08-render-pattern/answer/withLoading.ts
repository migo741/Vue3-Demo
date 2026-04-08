import { h, defineComponent, type Component } from "vue";

/**
 * HOC: withLoading — 参考答案
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
      return () => {
        const wrappedVNode = h(WrappedComponent, { ...attrs }, slots);

        const loadingOverlay = props.loading
          ? h(
              "div",
              {
                style: {
                  position: "absolute",
                  inset: "0",
                  background: "rgba(255, 255, 255, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: "10",
                },
              },
              "加载中...",
            )
          : null;

        return h("div", { style: { position: "relative" } }, [
          wrappedVNode,
          loadingOverlay,
        ]);
      };
    },
  });
}
