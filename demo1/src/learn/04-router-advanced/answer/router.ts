/**
 * Vue Router 动态路由权限系统 — 参考答案
 */
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

// ============ 静态路由 ============
const Layout = { template: '<div class="layout"><router-view /></div>' };
const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/403",
    name: "Forbidden",
    component: () => import("../views/Forbidden.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
  },
];

// ============ 动态路由（根据角色过滤） ============
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "/dashboard",
    component: Layout,
    meta: { title: "仪表盘", roles: ["admin", "editor"] },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("../views/Dashboard.vue"),
        meta: { title: "仪表盘", keepAlive: true },
      },
    ],
  },
  {
    path: "/user",
    component: Layout,
    meta: { title: "用户管理", roles: ["admin"] },
    children: [
      {
        path: "list",
        name: "UserList",
        component: () => import("../views/user/List.vue"),
        meta: { title: "用户列表", keepAlive: true },
      },
      {
        path: ":id",
        name: "UserDetail",
        component: () => import("../views/user/Detail.vue"),
        meta: { title: "用户详情" },
      },
    ],
  },
  {
    path: "/article",
    component: Layout,
    meta: { title: "文章管理", roles: ["admin", "editor"] },
    children: [
      {
        path: "list",
        name: "ArticleList",
        component: () => import("../views/article/List.vue"),
        meta: { title: "文章列表", keepAlive: true },
      },
      {
        path: "create",
        name: "ArticleCreate",
        component: () => import("../views/article/Edit.vue"),
        meta: { title: "创建文章" },
      },
      {
        path: "edit/:id",
        name: "ArticleEdit",
        component: () => import("../views/article/Edit.vue"),
        meta: { title: "编辑文章" },
      },
    ],
  },
];

// ============ 创建路由实例 ============
const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

// ============ 根据角色过滤路由 ============
export function generateRoutes(roles: string[]): RouteRecordRaw[] {
  return asyncRoutes.filter((route) => {
    if (route.meta?.roles) {
      return (route.meta.roles as string[]).some((role) =>
        roles.includes(role),
      );
    }
    return true;
  });
}

// ============ 动态添加路由 ============
const addedRouteNames: string[] = [];

export function addDynamicRoutes(routes: RouteRecordRaw[]) {
  routes.forEach((route) => {
    router.addRoute(route);
    if (route.name) {
      addedRouteNames.push(route.name as string);
    }
  });
}

// ============ 移除动态路由（登出时调用） ============
export function removeDynamicRoutes() {
  addedRouteNames.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
  addedRouteNames.length = 0;
}

export default router;
