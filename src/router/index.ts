import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Users from "@/views/Users.vue";

Vue.use(VueRouter);

export const LoginRoute: RouteConfig = {
    path: "/",
    name: "Login",
    component: Login
};

export const HomeRoute: RouteConfig = {
    path: "/home",
    name: "Home",
    component: Home
};

export const UsersRoute: RouteConfig = {
    path: "/users",
    name: "Users",
    component: Users
};

export const AboutRoute: RouteConfig = {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/About.vue")
};

const routes: RouteConfig[] = [
    LoginRoute,
    HomeRoute,
    UsersRoute,
    AboutRoute
];

const router = new VueRouter({
    routes
});

export default router;
