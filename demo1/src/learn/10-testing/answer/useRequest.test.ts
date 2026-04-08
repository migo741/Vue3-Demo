/**
 * useRequest Composable 测试 — 参考答案
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

// 辅助函数：在 setup 上下文中测试 Composable
// @vue/test-utils 没有内置 withSetup，需要自己实现
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";

function withSetup<T>(composable: () => T): { result: T; unmount: () => void } {
  let result!: T;
  const comp = defineComponent({
    setup() {
      result = composable();
      return {};
    },
    render() {
      return null;
    },
  });
  const wrapper = mount(comp);
  return { result, unmount: () => wrapper.unmount() };
}

// 模拟 useRequest（假设已实现）
// import { useRequest } from '../composables/useRequest'

// 简化版 useRequest 用于演示测试写法
import { ref, onUnmounted } from "vue";
function useRequest<T>(
  service: (...args: any[]) => Promise<T>,
  options: any = {},
) {
  const data = ref<T>();
  const loading = ref(false);
  const error = ref<Error | null>(null);
  let lastArgs: any[] = [];
  let count = 0;

  const run = async (...args: any[]) => {
    lastArgs = args;
    const currentCount = ++count;
    loading.value = true;
    error.value = null;
    try {
      const result = await service(...args);
      if (currentCount === count) {
        data.value = result as any;
      }
      return result;
    } catch (e) {
      if (currentCount === count) {
        error.value = e as Error;
      }
      throw e;
    } finally {
      if (currentCount === count) {
        loading.value = false;
      }
    }
  };

  const cancel = () => {
    count++;
  };
  const refresh = () => run(...lastArgs);
  const mutate = (v: T) => {
    data.value = v as any;
  };

  if (options.immediate !== false) run();

  return { data, loading, error, run, cancel, refresh, mutate };
}

describe("useRequest", () => {
  const mockService = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应该正确管理 loading 状态", async () => {
    let resolve!: (v: string) => void;
    mockService.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );

    const { result } = withSetup(() => useRequest(mockService));

    expect(result.loading.value).toBe(true);

    resolve("data");
    await nextTick();
    // 等待 Promise 完成
    await new Promise((r) => setTimeout(r, 0));

    expect(result.loading.value).toBe(false);
  });

  it("应该在请求成功后更新 data", async () => {
    mockService.mockResolvedValue({ name: "test" });

    const { result } = withSetup(() => useRequest(mockService));

    await new Promise((r) => setTimeout(r, 0));
    await nextTick();

    expect(result.data.value).toEqual({ name: "test" });
    expect(result.error.value).toBeNull();
  });

  it("应该在请求失败后设置 error", async () => {
    mockService.mockRejectedValue(new Error("网络错误"));

    const { result } = withSetup(() => useRequest(mockService));

    await new Promise((r) => setTimeout(r, 0));
    await nextTick();

    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.error.value?.message).toBe("网络错误");
  });

  it("immediate: false 时不应该自动执行", () => {
    mockService.mockResolvedValue("data");

    withSetup(() => useRequest(mockService, { immediate: false }));

    expect(mockService).not.toHaveBeenCalled();
  });

  it("竞态处理：只保留最后一次请求的结果", async () => {
    let resolvers: ((v: string) => void)[] = [];
    mockService.mockImplementation(
      () =>
        new Promise((r) => {
          resolvers.push(r);
        }),
    );

    const { result } = withSetup(() =>
      useRequest(mockService, { immediate: false }),
    );

    // 发起两次请求
    result.run();
    result.run();

    // 第一次请求先返回
    resolvers[0]("first");
    await new Promise((r) => setTimeout(r, 0));

    // 第二次请求后返回
    resolvers[1]("second");
    await new Promise((r) => setTimeout(r, 0));

    // 应该只保留最后一次的结果
    expect(result.data.value).toBe("second");
  });

  it("mutate 应该手动修改 data", async () => {
    mockService.mockResolvedValue("original");

    const { result } = withSetup(() => useRequest(mockService));

    await new Promise((r) => setTimeout(r, 0));

    result.mutate("modified" as any);
    expect(result.data.value).toBe("modified");
  });
});
