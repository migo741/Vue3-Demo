import { describe, it, expect } from "vitest";
import { createStore } from "./mini-pinia";
import { nextTick } from "vue";

const useCounterStore = createStore({
  id: "counter",
  state: () => ({ count: 0, name: "test" }),
  getters: {
    double: (state) => state.count * 2,
    greeting: (state) => `hello ${state.name}`,
  },
  actions: {
    increment() {
      this.count++;
    },
    incrementBy(amount: number) {
      this.count += amount;
    },
    setName(name: string) {
      this.name = name;
    },
  },
});

describe("mini-pinia", () => {
  it("state should be reactive", () => {
    const store = useCounterStore();
    expect(store.count).toBe(0);
    store.count = 5;
    expect(store.count).toBe(5);
  });

  it("getters should work as computed", () => {
    const store = useCounterStore();
    store.count = 3;
    expect(store.double).toBe(6);
    expect(store.greeting).toBe("hello test");
  });

  it("actions should work with correct this", () => {
    const store = useCounterStore();
    store.count = 0;
    store.increment();
    expect(store.count).toBe(1);
    store.incrementBy(5);
    expect(store.count).toBe(6);
  });

  it("$reset should restore initial state", () => {
    const store = useCounterStore();
    store.count = 100;
    store.name = "changed";
    store.$reset();
    expect(store.count).toBe(0);
    expect(store.name).toBe("test");
  });

  it("$patch should batch update", () => {
    const store = useCounterStore();
    store.$patch({ count: 10, name: "patched" });
    expect(store.count).toBe(10);
    expect(store.name).toBe("patched");
  });

  it("$patch should support function", () => {
    const store = useCounterStore();
    store.count = 0;
    store.$patch((state) => {
      state.count += 10;
    });
    expect(store.count).toBe(10);
  });

  it("should return singleton", () => {
    const store1 = useCounterStore();
    const store2 = useCounterStore();
    expect(store1).toBe(store2);
  });
});
