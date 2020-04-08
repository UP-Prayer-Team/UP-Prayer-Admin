<template>
    <v-content>
        <v-container class="fill-height" fluid>
            <v-row align="center" justify="center">
                <v-col cols="12" sm="8" md="4">
                    <v-card elevation="10" class="p-10">
                        <v-card-title>
                            UP Prayer Movement Administration
                        </v-card-title>
                        <v-card-text>

                            <v-alert type="error" v-if="errorMessage">
                                {{ errorMessage }}
                            </v-alert>

                            <v-form>
                                <v-text-field label="Username" name="username" type="text" v-model="username" />
                                <v-text-field label="Password" name="password" type="password" v-model="password" />
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />
                            <v-btn color="primary" v-on:click="login" v-bind:loading="loginLoading" depressed="true" class="px-5">
                                Login
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-content>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import UPClient from "@/services/UPClient";
import router, { HomeRoute } from "@/router";

@Component({

})
export default class Login extends Vue {
    errorMessage: string | null = null;
    username: string = "";
    password: string = "";
    loginLoading: boolean = false;

    login() {
        this.loginLoading = true;
        UPClient.authenticateUser(this.username, this.password, (token: string) => {
            this.loginLoading = false;
            this.errorMessage = null;
            router.push(HomeRoute.path);
        }, (message: string) => {
            this.loginLoading = false;
            this.errorMessage = message;
            this.password = "";
        });
    }
}
</script>