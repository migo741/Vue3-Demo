import { defineComponent, ref, onMounted, onUnmounted, h } from "vue";

/**
 * Renderless Component: MouseTracker — 参考答案
 *
 * 无渲染组件：自身不渲染任何 DOM，通过作用域插槽暴露数据
 */
export const MouseTracker = defineComponent({
  name: "MouseTracker",
  setup(_, { slots }) {
    const x = ref(0);
    const y = ref(0);
    const isInside = ref(false);

    const handleMouseMove = (e: MouseEvent) => {
      x.value = e.clientX;
      y.value = e.clientY;
    };

    const handleMouseEnter = () => {
      isInside.value = true;
    };

    const handleMouseLeave = () => {
      isInside.value = false;
    };

    onMounted(() => {
      window.addEventListener("mousemove", handleMouseMove);
    });

    onUnmounted(() => {
      window.removeEventListener("mousemove", handleMouseMove);
    });

    // 不渲染自己的 DOM，只通过默认插槽暴露数据
    return () => {
      return slots.default?.({
        x: x.value,
        y: y.value,
        isInside: isInside.value,
      });
    };
  },
});

/**
 * Renderless Component: FetchData
 */
export const FetchData = defineComponent({
  name: "FetchData",
  props: {
    url: { type: String, required: true },
  },
  setup(props, { slots }) {
    const data = ref<any>(null);
    const loading = ref(false);
    const error = ref<Error | null>(null);

    const fetchData = async () => {
      loading.value = true;
      error.value = null;
      try {
        const res = await fetch(props.url);
        data.value = await res.json();
      } catch (e) {
        error.value = e instanceof Error ? e : new Error(String(e));
      } finally {
        loading.value = false;
      }
    };

    fetchData();

    return () => {
      return slots.default?.({
        data: data.value,
        loading: loading.value,
        error: error.value,
        refresh: fetchData,
      });
    };
  },
});
