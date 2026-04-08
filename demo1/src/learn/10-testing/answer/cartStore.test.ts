/**
 * Pinia Store 测试 — 参考答案
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia, defineStore } from "pinia";

// ---- 定义 Cart Store（被测对象） ----
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
  }),
  getters: {
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
  },
  actions: {
    addItem(item: Omit<CartItem, "quantity">) {
      const existing = this.items.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push({ ...item, quantity: 1 });
      }
    },
    removeItem(id: number) {
      this.items = this.items.filter((i) => i.id !== id);
    },
    clearCart() {
      this.items = [];
    },
    async checkout() {
      // 模拟 API 调用
      const response = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify(this.items),
      });
      if (!response.ok) throw new Error("Checkout failed");
      this.clearCart();
    },
  },
});

// ---- 测试 ----
describe("useCartStore", () => {
  beforeEach(() => {
    // 每个测试前创建新的 Pinia 实例
    setActivePinia(createPinia());
  });

  it("应该添加商品到购物车", () => {
    const store = useCartStore();
    store.addItem({ id: 1, name: "商品A", price: 100 });

    expect(store.items).toHaveLength(1);
    expect(store.items[0]).toEqual({
      id: 1,
      name: "商品A",
      price: 100,
      quantity: 1,
    });
  });

  it("添加已存在的商品应该增加数量", () => {
    const store = useCartStore();
    store.addItem({ id: 1, name: "商品A", price: 100 });
    store.addItem({ id: 1, name: "商品A", price: 100 });

    expect(store.items).toHaveLength(1);
    expect(store.items[0].quantity).toBe(2);
  });

  it("应该正确计算总价", () => {
    const store = useCartStore();
    store.addItem({ id: 1, name: "商品A", price: 100 });
    store.addItem({ id: 2, name: "商品B", price: 200 });
    store.addItem({ id: 1, name: "商品A", price: 100 }); // 数量 +1

    // 100*2 + 200*1 = 400
    expect(store.totalPrice).toBe(400);
  });

  it("应该正确移除商品", () => {
    const store = useCartStore();
    store.addItem({ id: 1, name: "商品A", price: 100 });
    store.addItem({ id: 2, name: "商品B", price: 200 });
    store.removeItem(1);

    expect(store.items).toHaveLength(1);
    expect(store.items[0].id).toBe(2);
  });

  it("清空购物车应该重置状态", () => {
    const store = useCartStore();
    store.addItem({ id: 1, name: "商品A", price: 100 });
    store.clearCart();

    expect(store.items).toHaveLength(0);
    expect(store.totalPrice).toBe(0);
  });

  it("checkout 应该调用 API 并清空购物车", async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const store = useCartStore();
    store.addItem({ id: 1, name: "商品A", price: 100 });

    await store.checkout();

    expect(fetch).toHaveBeenCalledWith("/api/checkout", expect.any(Object));
    expect(store.items).toHaveLength(0);
  });

  it("checkout 失败应该保留购物车状态", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    const store = useCartStore();
    store.addItem({ id: 1, name: "商品A", price: 100 });

    await expect(store.checkout()).rejects.toThrow("Checkout failed");
    expect(store.items).toHaveLength(1); // 购物车未清空
  });
});
