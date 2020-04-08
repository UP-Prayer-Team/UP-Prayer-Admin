import Vue from "vue";
import Vuex from "vuex";

import User from "@/models/User";

Vue.use(Vuex);

let defaultState: { token: string, user: User | null } = {
    token: "",
    user: null
};

export default new Vuex.Store({
    state: defaultState,
    mutations: {
        loggedIn(state, user: User) {
            state.user = user;
        },
        loggedOut(state) {
            state.user = null;
        },
        gotToken(state, token: string) {
            state.token = token;
        }
    },
    actions: {
        login(context, user: User ) {
            context.commit("loggedIn", user);
        },
        setToken(context, token: string) {
            context.commit("gotToken", token);
        },
        logout(context) {
            context.commit("gotToken", "");
            context.commit("loggedOut");
        }
    }
});