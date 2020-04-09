import Vue from "vue";
import Vuex from "vuex";

import UserModel from "@/models/UserModel";

Vue.use(Vuex);

let defaultState: { token: string, user: UserModel | null } = {
    token: "",
    user: null
};

export default new Vuex.Store({
    state: defaultState,
    mutations: {
        loggedIn(state, user: UserModel) {
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
        login(context, user: UserModel ) {
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