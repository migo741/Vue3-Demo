import { ref, onMounted, onUnmounted, watch } from "vue";
import type { Ref } from "vue";

interface FetchResult<T> {
  data: T[];
  total: number;
}

interface UseInfiniteScrollOptions {
  target: Ref<HTMLElement | null>;
  threshold?: number;
  initialPageSize?: number;
}

interface UseInfiniteScrollReturn<T> {
  list: Ref<T[]>;
  loading: Ref<boolean>;
  noMore: Ref<boolean>;
  loadMore: () => Promise<void>;
  reset: () => Promise<void>;
}

export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<FetchResult<T>>,
  options: UseInfiniteScrollOptions,
): UseInfiniteScrollReturn<T> {
  const { target, threshold = 100, initialPageSize = 20 } = options;

  const list = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const noMore = ref(false);
  const page = ref(1);
  const total = ref(0);

  let observer: IntersectionObserver | null = null;
  let sentinel: HTMLElement | null = null;

  const loadMore = async () => {
    if (loading.value || noMore.value) return;

    loading.value = true;
    try {
      const result = await fetchFn(page.value);
      list.value = [...list.value, ...result.data];
      total.value = result.total;
      page.value++;

      // 判断是否还有更多
      if (list.value.length >= result.total || result.data.length === 0) {
        noMore.value = true;
      }
    } catch (err) {
      console.error("useInfiniteScroll: fetch error", err);
    } finally {
      loading.value = false;
    }
  };

  const reset = async () => {
    list.value = [];
    page.value = 1;
    noMore.value = false;
    total.value = 0;
    await loadMore();
  };

  const setupObserver = (el: HTMLElement | null) => {
    // 清理旧的
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (sentinel && sentinel.parentNode) {
      sentinel.parentNode.removeChild(sentinel);
      sentinel = null;
    }

    if (!el) return;

    // 创建哨兵元素放在容器底部
    sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    el.appendChild(sentinel);

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        root: el,
        rootMargin: `0px 0px ${threshold}px 0px`,
      },
    );

    observer.observe(sentinel);
  };

  // 监听 target 变化
  watch(target, (el) => {
    setupObserver(el);
  });

  onMounted(() => {
    if (target.value) {
      setupObserver(target.value);
    }
    // 首次加载
    loadMore();
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
    if (sentinel && sentinel.parentNode) {
      sentinel.parentNode.removeChild(sentinel);
    }
  });

  return { list, loading, noMore, loadMore, reset };
}
