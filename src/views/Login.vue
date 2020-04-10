<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card elevation="10" class="p-10">
                    <v-card-title>
                        UP Prayer Movement Administration
                        <v-spacer></v-spacer>
                        <img src="/img/logo.svg" style="max-height: 2em;">
                    </v-card-title>

                    <v-alert type="error" v-if="errorMessage" tile>
                        {{ errorMessage }}
                    </v-alert>

                    <v-form @submit.prevent="login">
                        <v-card-text>

                            <v-text-field label="Username" name="username" type="text" v-model="username" />
                            <v-text-field label="Password" name="password" type="password" v-model="password" />
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer />
                            <v-btn color="primary" type="submit" v-bind:loading="loginLoading" v-bind:depressed="true" class="px-5">
                                Login
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import UPClient from "@/services/UPClient";
import router, { HomeRoute } from "@/router";
import State from "@/state";
import UserModel from "@/models/UserModel";

@Component({

})
export default class Login extends Vue {
    errorMessage: string | null = null;
    username: string = "";
    password: string = "";
    loginLoading: boolean = false;

    login() {
        let errorHandler = (message: string) => {
            this.loginLoading = false;
            this.errorMessage = message;
            this.password = "";
        }

        this.loginLoading = true;
        UPClient.authenticateUser(this.username, this.password, (token: string, id: string) => {
            State.dispatch("setToken", token);
            UPClient.getUser(id, (user: UserModel) => {
                this.loginLoading = false;
                this.errorMessage = null;
                State.dispatch("login", user);
                router.push(HomeRoute.path);
            }, errorHandler);
        }, errorHandler);
    }
};
</script>