import Login from "@/views/Login.vue";
import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "login",
    component: Login,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("@/views/NotFound.vue"),
  }
];

const router = createRouter ({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;