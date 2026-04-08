# 09 - 自定义指令与插件开发

## 题目：实现实用的自定义指令和 Vue 插件

---

### 🟡 练习 1：自定义指令

实现以下 4 个常用自定义指令：

#### 指令 1: v-permission — 权限指令

```vue
<!-- 没有权限时移除 DOM 元素 -->
<button v-permission="'user:delete'">删除用户</button>

<!-- 支持多个权限（满足其一即可） -->
<button v-permission="['user:edit', 'user:admin']">编辑</button>
```

#### 指令 2: v-click-outside — 点击外部

```vue
<!-- 点击元素外部时触发回调 -->
<div v-click-outside="handleClose">
  <Dropdown />
</div>
```

#### 指令 3: v-lazy — 图片懒加载

```vue
<!-- 图片进入可视区域时才加载 -->
<img v-lazy="imageUrl" />

<!-- 支持 loading 占位图 -->
<img v-lazy="{ src: imageUrl, loading: placeholderUrl, error: errorUrl }" />
```

#### 指令 4: v-debounce — 防抖指令

```vue
<!-- 输入防抖 -->
<input v-debounce:500="handleSearch" />

<!-- 点击防抖 -->
<button v-debounce:1000.click="handleSubmit">提交</button>
```

#### 要求

- 每个指令实现完整的生命周期（mounted / updated / unmounted）
- 正确处理指令的 binding 参数（value / arg / modifiers）
- 在 unmounted 中清理副作用（事件监听、Observer 等）
- 写出每个指令的使用示例

---

### 🔴 练习 2：Vue 插件开发

实现一个完整的 Toast 插件：

```ts
// 插件安装
app.use(ToastPlugin, {
  position: "top-right", // 默认位置
  duration: 3000, // 默认持续时间
  maxCount: 5, // 最多同时显示数量
});

// 使用方式 1：组合式 API
const toast = useToast();
toast.success("操作成功");
toast.error("操作失败");
toast.info("提示信息");
toast.warning("警告");

// 使用方式 2：全局方法（Options API 兼容）
this.$toast.success("操作成功");

// 使用方式 3：直接导入
import { toast } from "@/plugins/toast";
toast.success("操作成功");
```

#### 要求

1. 实现 `app.use()` 的 install 方法
2. 通过 `app.provide()` 注入，支持 `useToast()` 获取
3. 通过 `app.config.globalProperties` 支持 `this.$toast`
4. Toast 组件支持：
   - 4 种类型（success / error / info / warning）
   - 自定义位置（top-left / top-right / bottom-left / bottom-right）
   - 自动关闭 + 手动关闭
   - 进入/离开动画（TransitionGroup）
   - 最大数量限制（超出时移除最早的）
5. 支持 Promise 式调用：
   ```ts
   await toast.loading("保存中...");
   toast.success("保存成功");
   ```

---

### 🟡 练习 3：app.use 原理理解

回答以下问题并写出代码验证：

1. `app.use(plugin)` 内部做了什么？
2. 同一个插件多次 `app.use()` 会怎样？
3. `app.component()` 全局注册 vs 局部 import 的区别和取舍
4. `app.directive()` 全局注册指令的最佳实践
5. `app.provide()` 和组件内 `provide()` 的区别

---

### 知识点覆盖

- 自定义指令的完整生命周期
- 指令的 binding 对象（value / oldValue / arg / modifiers）
- IntersectionObserver API
- Vue 插件的 install 方法
- app.provide / app.config.globalProperties
- TransitionGroup
- 全局注册 vs 局部注册
