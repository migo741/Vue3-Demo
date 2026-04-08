# 03 - 组件设计模式

## 题目：实现 4 种核心组件设计模式

---

### 🟡 练习 1：通用 Form 组件（provide/inject + 组件通信）

实现一套表单组件，支持以下用法：

```vue
<template>
  <MyForm :model="formData" :rules="rules" ref="formRef">
    <MyFormItem label="用户名" prop="username">
      <MyInput v-model="formData.username" />
    </MyFormItem>
    <MyFormItem label="邮箱" prop="email">
      <MyInput v-model="formData.email" />
    </MyFormItem>
    <MyFormItem label="角色" prop="role">
      <MySelect v-model="formData.role" :options="roleOptions" />
    </MyFormItem>
    <button @click="handleSubmit">提交</button>
  </MyForm>
</template>

<script setup>
const formRef = ref();
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    /* 提交 */
  }
};
</script>
```

#### 要求

1. `MyForm`：通过 provide 向下传递 model 和 rules
2. `MyFormItem`：通过 inject 获取表单上下文，负责校验和错误展示
3. 支持 `validate()` 全量校验和 `validateField(prop)` 单字段校验
4. 支持 `resetFields()` 重置表单
5. 校验规则格式：`{ required?: boolean, pattern?: RegExp, validator?: (value) => boolean | string, message?: string }`
6. 错误信息展示在对应 FormItem 下方

#### 知识点

- provide / inject 跨层级通信
- 组件实例暴露（defineExpose）
- 异步校验
- 组件解耦设计

---

### 🔴 练习 2：命令式组件（函数式调用）

实现一个可以通过函数调用的 Message 组件：

```js
// 函数式调用，不需要在 template 中写组件
Message.success("操作成功");
Message.error("操作失败");
Message.warning("请注意");
Message.info("提示信息");

// 支持配置
Message.success({
  content: "操作成功",
  duration: 3000,
  closable: true,
  onClose: () => console.log("closed"),
});

// 支持手动关闭
const close = Message.success("loading...");
close(); // 手动关闭

// 支持全部关闭
Message.closeAll();
```

#### 要求

1. 使用 `createApp` 或 `render` + `h` 函数动态创建组件
2. 多个 Message 自动堆叠排列（从顶部向下）
3. 支持自动关闭（duration）和手动关闭
4. 关闭时有过渡动画（Transition）
5. 组件销毁时正确清理 DOM

#### 知识点

- render / h 函数
- createApp 动态挂载
- 命令式组件设计模式
- DOM 管理与清理

---

### 🟡 练习 3：递归组件 — 树形控件

实现一个支持以下功能的 Tree 组件：

```vue
<Tree
  :data="treeData"
  :default-expanded-keys="[1, 3]"
  show-checkbox
  @check="handleCheck"
  @expand="handleExpand"
>
  <template #node="{ node, level }">
    <span>{{ node.label }} (level: {{ level }})</span>
  </template>
</Tree>
```

```ts
interface TreeNode {
  id: number;
  label: string;
  children?: TreeNode[];
  disabled?: boolean;
}
```

#### 要求

1. 递归渲染树结构（组件自身调用自身）
2. 展开/折叠功能
3. 复选框支持（父子联动：选中父节点自动选中所有子节点，子节点全选时父节点自动选中）
4. 支持 disabled 节点
5. 支持自定义节点内容（作用域插槽）
6. 支持 defaultExpandedKeys

#### 知识点

- 递归组件
- 作用域插槽
- 父子联动逻辑
- 组件 name 选项的作用

---

### 🔴 练习 4：异步组件 + Suspense + ErrorBoundary

实现一个完整的异步加载方案：

```vue
<template>
  <ErrorBoundary @error="handleError">
    <template #error="{ error, retry }">
      <div class="error-page">
        <p>出错了：{{ error.message }}</p>
        <button @click="retry">重试</button>
      </div>
    </template>

    <Suspense>
      <template #default>
        <AsyncDashboard />
      </template>
      <template #fallback>
        <LoadingSkeleton />
      </template>
    </Suspense>
  </ErrorBoundary>
</template>
```

#### 要求

1. `ErrorBoundary` 组件：捕获子组件的错误，展示错误 UI，支持重试
2. `AsyncDashboard`：使用 `<script setup>` 中的顶层 await 加载数据
3. `LoadingSkeleton`：骨架屏组件
4. 实现 `defineAsyncComponent` 的高级用法（带 loading/error/timeout 配置）
5. 错误恢复机制：重试时重新创建组件实例

```ts
const AsyncComp = defineAsyncComponent({
  loader: () => import("./HeavyComponent.vue"),
  loadingComponent: LoadingSkeleton,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 10000,
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) retry();
    else fail();
  },
});
```

#### 知识点

- Suspense 原理与使用
- 异步组件加载策略
- 错误边界设计
- onErrorCaptured 生命周期
- 组件重试机制
