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
    path: "/accounts",
    name: "account",
    component: () => import("@/views/Account.vue"),
  }
];

const router = createRouter ({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("user");

  if (to.name === "login" && isAuthenticated) {
    next({ name: "account" });
  } else {
    next();
  }
});

export default router;