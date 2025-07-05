import { createRouter, createWebHistory } from "vue-router";
import Crud from "./Crud/Crud.vue";
import Hello from "./Hello/Hello.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
    { path: "/crud/:caseName/:topLevelTagName", component: Crud, props: true }, 
    { path: "/", component: Hello}
]
});