import { describe, it, expect, vi } from "vitest";
import { reactive, ref, effect, computed, watch } from "./mini-reactivity.js";

describe("mini-reactivity", () => {
  describe("reactive + effect", () => {
    it("should track and trigger basic property", () => {
      const state = reactive({ count: 0 });
      let dummy;
      effect(() => {
        dummy = state.count;
      });
      expect(dummy).toBe(0);
      state.count = 1;
      expect(dummy).toBe(1);
    });

    it("should handle nested objects", () => {
      const state = reactive({ nested: { value: 1 } });
      let dummy;
      effect(() => {
        dummy = state.nested.value;
      });
      expect(dummy).toBe(1);
      state.nested.value = 2;
      expect(dummy).toBe(2);
    });

    it("should handle multiple effects", () => {
      const state = reactive({ count: 0 });
      let dummy1, dummy2;
      effect(() => {
        dummy1 = state.count;
      });
      effect(() => {
        dummy2 = state.count * 2;
      });
      expect(dummy1).toBe(0);
      expect(dummy2).toBe(0);
      state.count = 5;
      expect(dummy1).toBe(5);
      expect(dummy2).toBe(10);
    });
  });

  describe("ref", () => {
    it("should wrap primitive value", () => {
      const count = ref(0);
      let dummy;
      effect(() => {
        dummy = count.value;
      });
      expect(dummy).toBe(0);
      count.value = 1;
      expect(dummy).toBe(1);
    });
  });

  describe("computed", () => {
    it("should compute lazily", () => {
      const state = reactive({ count: 1 });
      const getter = vi.fn(() => state.count * 2);
      const double = computed(getter);

      // 未访问 .value 时不应执行 getter
      expect(getter).not.toHaveBeenCalled();

      expect(double.value).toBe(2);
      expect(getter).toHaveBeenCalledTimes(1);

      // 再次访问，应使用缓存
      double.value;
      expect(getter).toHaveBeenCalledTimes(1);

      // 依赖变化后，再次访问才重新计算
      state.count = 2;
      expect(double.value).toBe(4);
      expect(getter).toHaveBeenCalledTimes(2);
    });
  });

  describe("watch", () => {
    it("should watch ref", () => {
      const count = ref(0);
      const cb = vi.fn();
      watch(count, cb);
      count.value = 1;
      expect(cb).toHaveBeenCalledWith(1, 0);
    });

    it("should support immediate option", () => {
      const count = ref(0);
      const cb = vi.fn();
      watch(count, cb, { immediate: true });
      expect(cb).toHaveBeenCalledTimes(1);
    });
  });
});
