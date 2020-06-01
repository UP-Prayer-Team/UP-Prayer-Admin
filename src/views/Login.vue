<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card elevation="10" class="p-10" style="padding: 16px;">
                    <v-card-title class="title-text">
                        UP Prayer Movement Administration
                        <v-spacer></v-spacer>
                        <img src="/img/logo.svg" style="max-height: 2em;">
                    </v-card-title>

                    <div style="padding: 16px !important;">
                        <v-alert color="#f91600" type="error" v-if="errorMessage" tile>
                            {{ errorMessage }}
                        </v-alert>
                    </div>

                    <v-form @submit.prevent="login">
                        <v-card-text>
                            <v-text-field :filled="true" label="Username" name="username" type="text" v-model="username" />
                            <v-text-field :filled="true" label="Password" name="password" v-model="password" 
                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="showPassword ? 'text' : 'password'" 
                            @click:append="showPassword = !showPassword"/>
                        </v-card-text>

                        <v-card-actions style="padding-right: 16px;">
                            <v-spacer />
                            <v-btn color="#c70098" style="color: white !important;" type="submit" v-bind:loading="loginLoading" v-bind:depressed="true" class="px-5">
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
    showPassword: boolean = false;

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

<style scoped>

.title-text {
    font-family: 'Montserrat', sans-serif !important;
        font-weight: 400;
    word-break: keep-all;
}
</style>