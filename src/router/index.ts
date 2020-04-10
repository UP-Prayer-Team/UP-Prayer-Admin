import Vue from "vue";
import VueRouter, { RouteConfig, Route } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Users from "@/views/Users.vue";
import User from "@/views/User.vue";
import Endorsements from "@/views/Endorsements.vue";
import Vuex from "vuex";
import State from "@/state";

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

export const UserRoute: RouteConfig = {
    path: "/user/:id",
    name: "User",
    component: User
};

export const UsersRoute: RouteConfig = {
    path: "/users",
    name: "Users",
    component: Users
};

export const EndorsementsRoute: RouteConfig = {
    path: "/endorsements",
    name: "Charity Endorsements",
    component: Endorsements
}

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
    UserRoute,
    UsersRoute,
    EndorsementsRoute,
    AboutRoute
];

const router = new VueRouter({
    routes
});

router.beforeEach((to: Route, from: Route, next) => {
    if (to.name != LoginRoute.name && (State.state.token == null || State.state.token == "" || State.state.user == null)) {
        next(LoginRoute.path);
    }
    else {
        next();
    }
});

export default router;
