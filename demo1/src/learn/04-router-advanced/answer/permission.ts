/**
 * 路由守卫 — 参考答案
 */
import router from "./router";
import { generateRoutes, addDynamicRoutes } from "./router";

// 模拟 store（实际项目中从 Pinia 获取）
const store = {
  token: "" as string,
  userInfo: null as { role: string } | null,
  async getUserInfo() {
    // 模拟获取用户信息
    if (this.token === "mock-admin-token") {
      this.userInfo = { role: "admin" };
    } else {
      this.userInfo = { role: "editor" };
    }
    return this.userInfo;
  },
};

const whiteList = ["/login", "/403"];

router.beforeEach(async (to, from, next) => {
  const token = store.token || localStorage.getItem("token");

  if (token) {
    // ---- 有 token ----
    if (to.path === "/login") {
      // 已登录去登录页，重定向到首页
      next({ path: "/dashboard" });
    } else if (store.userInfo) {
      // 已有用户信息，直接放行
      next();
    } else {
      // 没有用户信息，需要获取
      try {
        const userInfo = await store.getUserInfo();
        const roles = [userInfo!.role];

        // 根据角色生成动态路由
        const accessRoutes = generateRoutes(roles);
        addDynamicRoutes(accessRoutes);

        // 关键：addRoute 后需要用 next({ ...to, replace: true }) 重新导航
        // 因为 addRoute 是在导航守卫中执行的，当前导航的路由匹配表还没有新路由
        // replace: true 是为了不在 history 中留下重复记录
        next({ ...to, replace: true });
      } catch (error) {
        // 获取用户信息失败，清除 token，跳转登录页
        store.token = "";
        localStorage.removeItem("token");
        next(`/login?redirect=${to.path}`);
      }
    }
  } else {
    // ---- 无 token ----
    if (whiteList.includes(to.path)) {
      // 在白名单中，直接放行
      next();
    } else {
      // 不在白名单，跳转登录页，携带 redirect 参数
      next(`/login?redirect=${to.path}`);
    }
  }
});

// 登录成功后的跳转逻辑
export function handleLoginSuccess(token: string) {
  store.token = token;
  localStorage.setItem("token", token);

  // 跳转到 redirect 指定的页面，或默认首页
  const redirect = router.currentRoute.value.query.redirect as string;
  router.push(redirect || "/dashboard");
}

// 登出逻辑
export function handleLogout() {
  store.token = "";
  store.userInfo = null;
  localStorage.removeItem("token");

  // 移除动态路由
  const { removeDynamicRoutes } = require("./router");
  removeDynamicRoutes();

  router.push("/login");
}
