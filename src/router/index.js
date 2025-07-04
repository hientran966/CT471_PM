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
    path: "/me",
    name: "me",
    component: () => import("@/views/Me.vue"),
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
  
  {
    path: "/info",
    name: "info",
    component: () => import("@/views/Info.vue"),
  },

  {
    path: "/assign",
    name: "assign",
    component: () => import("@/views/Assign.vue"),
  },
  
  {
    path: "/file",
    name: "file",
    component: () => import("@/views/File.vue"),
  },

  {
    path: "/PJfile",
    name: "PJfile",
    component: () => import("@/views/ProjectFile.vue"),
  },
];

const router = createRouter ({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("user");

  if (to.name === "login" && isAuthenticated) {
    return next({ name: "me" });
  }

  const publicPages = ["login", "notfound"];
  const authRequired = !publicPages.includes(to.name);

  if (authRequired && !isAuthenticated) {
    return next({ name: "login" });
  }

  next();
});

export default router;