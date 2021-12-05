import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/parent",
    component: () => import("@/views/ParentView.vue"),
  },
  {
    path: "/worker",
    component: () => import("@/views/WorkerView.vue"),
  },
  {
    path: "/manual/parent",
    component: () => import("@/views/ManualParentView.vue"),
  },
  {
    path: "/manual/worker",
    component: () => import("@/views/ManualWorkerView.vue"),
  },
];

const router = new VueRouter({
  // mode: "history",
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;
