/**
 * TodoList 组件测试 — 参考答案
 */
import { describe, it, expect, beforeEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import TodoList from "../TodoList.vue";

// 注意：这里假设 TodoList.vue 已经实现
// 如果你还没实现 TodoList，先按照 README 中的模板实现

describe("TodoList", () => {
  let wrapper: VueWrapper;

  const initialTodos = [
    { id: 1, text: "学习 Vue3", done: false },
    { id: 2, text: "写单元测试", done: false },
    { id: 3, text: "已完成的任务", done: true },
  ];

  beforeEach(() => {
    wrapper = mount(TodoList, {
      props: { initialTodos },
    });
  });

  // ---- 渲染测试 ----
  it("应该正确渲染初始状态", () => {
    expect(wrapper.find('[data-testid="todo-input"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-testid="todo-item"]')).toHaveLength(3);
  });

  it("应该显示传入的初始 todos", () => {
    const items = wrapper.findAll('[data-testid="todo-item"]');
    expect(items[0].text()).toContain("学习 Vue3");
    expect(items[1].text()).toContain("写单元测试");
    expect(items[2].text()).toContain("已完成的任务");
  });

  // ---- 交互测试 ----
  it("输入文本并按回车应该添加新 todo", async () => {
    const input = wrapper.find('[data-testid="todo-input"]');
    await input.setValue("新任务");
    await input.trigger("keyup.enter");

    const items = wrapper.findAll('[data-testid="todo-item"]');
    expect(items).toHaveLength(4);
    expect(items[3].text()).toContain("新任务");
  });

  it("空输入不应该添加 todo", async () => {
    const input = wrapper.find('[data-testid="todo-input"]');
    await input.setValue("");
    await input.trigger("keyup.enter");

    expect(wrapper.findAll('[data-testid="todo-item"]')).toHaveLength(3);
  });

  it("点击 checkbox 应该切换 todo 状态", async () => {
    const checkbox = wrapper.findAll('[data-testid="todo-checkbox"]')[0];
    await checkbox.setValue(true);

    // 验证 class 变化
    const firstItem = wrapper.findAll('[data-testid="todo-item"]')[0];
    expect(firstItem.classes()).toContain("completed");
  });

  it("点击删除按钮应该移除 todo", async () => {
    const removeBtn = wrapper.findAll('[data-testid="todo-remove"]')[0];
    await removeBtn.trigger("click");

    expect(wrapper.findAll('[data-testid="todo-item"]')).toHaveLength(2);
  });

  // ---- 过滤测试 ----
  it("点击 active 应该只显示未完成的 todo", async () => {
    await wrapper.find('[data-testid="filter-active"]').trigger("click");

    const items = wrapper.findAll('[data-testid="todo-item"]');
    expect(items).toHaveLength(2);
    items.forEach((item) => {
      expect(item.classes()).not.toContain("completed");
    });
  });

  it("点击 completed 应该只显示已完成的 todo", async () => {
    await wrapper.find('[data-testid="filter-completed"]').trigger("click");

    const items = wrapper.findAll('[data-testid="todo-item"]');
    expect(items).toHaveLength(1);
    expect(items[0].text()).toContain("已完成的任务");
  });

  it("点击 all 应该显示所有 todo", async () => {
    // 先切到 active
    await wrapper.find('[data-testid="filter-active"]').trigger("click");
    // 再切回 all
    await wrapper.find('[data-testid="filter-all"]').trigger("click");

    expect(wrapper.findAll('[data-testid="todo-item"]')).toHaveLength(3);
  });

  // ---- 计数测试 ----
  it("应该正确显示待完成数量", () => {
    const count = wrapper.find('[data-testid="todo-count"]');
    expect(count.text()).toContain("2"); // 3 个 todo，1 个已完成
  });
});
