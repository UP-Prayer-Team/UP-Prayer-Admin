<template>
    <v-app>
        <v-navigation-drawer v-if="!hideMenu" color="primary" app dark permanent class="no-transition">
            <v-list dense class="py-0">
                <v-list-item two-line>
                    <v-list-item-avatar style="background: rgb(50, 50, 50);">
                        {{ initials }}
                    </v-list-item-avatar>
                    <v-list-item-content v-if="user">
                        <v-list-item-title class="pl-1">
                            {{ user.displayName }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            <v-chip v-for="role in user.roles" v-bind:key="role" x-small color="white" class="primary--text mr-1">
                                {{ role }}
                            </v-chip>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link v-on:click="signOut">
                    <v-list-item-content>
                        <v-list-item-title>
                            Sign Out
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <router-link v-for="page in menuPages" v-bind:key="page.name" v-bind:to="page.path" v-slot="{ href, route, navigate, isActive }">
                    <a v-bind:href="href" @click="navigate">
                        <v-list-item link v-bind:class="{ 'v-list-item--active': isActive }">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ page.name }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                    </a>
                </router-link>

            </v-list>
            <v-spacer></v-spacer>
            <img src="/img/logo-white.svg" style="max-width: 40%; align-self: center;" class="mb-5">

        </v-navigation-drawer>

        <v-content class="no-transition">
            <router-view>
            </router-view>
        </v-content>
    </v-app>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { RouteConfig } from "vue-router";
import { HomeRoute, UsersRoute, EndorsementsRoute, LoginRoute, } from "@/router";
import State from "@/state";
import UserModel from "@/models/UserModel";

@Component({

})
export default class App extends Vue {
    menuPages: RouteConfig[] = [
        HomeRoute,
        UsersRoute,
        EndorsementsRoute
    ];

    get hideMenu(): boolean {
        return State.state.token == "";
    }

    get user(): UserModel | null {
        return State.state.user;
    }

    get initials(): string {
        const isCapital = (letter: string) => {
            return letter != letter.toLocaleLowerCase();
        }

        if (this.user == null) {
            return "?";
        }
        else {
            let res = "";
            for (let i = 0; i < this.user.displayName.length; i++) {
                if (isCapital(this.user.displayName.charAt(i))) {
                    res += this.user.displayName.charAt(i);
                }
            }
            return res;
        }
    }

    signOut() {
        State.dispatch("logout");
        this.$router.replace(LoginRoute.path);
    }

    menuClick(route: RouteConfig) {
        this.$router.replace(route.path);
    }
};
</script>

<style>
.no-transition {
    transition: none !important;
}

.v-content {
    height: 100%;
}

.v-application .v-list a {
    color: inherit;
    text-decoration: none;
}

.v-navigation-drawer__content {
    display: flex;
    flex-direction: column;
}
</style>