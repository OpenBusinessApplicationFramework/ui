import { createRouter, createWebHistory } from "vue-router";
import Hello from "./Hello/Hello.vue";
import Datagrid from "./Views/Datagrid.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
    { path: "/datagrid/:caseName/:topLevelTagName", component: Datagrid, props: true },
    { path: "/", component: Hello},
]
});