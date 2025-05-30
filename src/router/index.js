import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("@/views/NotFound.vue"),
  },

  {
    path: "/admin",
    name: "admin",
    component: () => import("@/views/Admin.vue"),
  },

  {
    path: "/account",
    name: "account",
    component: () => import("@/views/Account.vue"),
  },
  
  {
    path: "/task",
    name: "task",
    component: () => import("@/views/Task.vue"),
  },

  {
    path: "/project",
    name: "project",
    component: () => import("@/views/Project.vue"),
  },
];

const router = createRouter ({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("user");

  if (to.name === "login" && isAuthenticated) {
    next({ name: "admin" });
  } else {
    next();
  }
});

export default router;