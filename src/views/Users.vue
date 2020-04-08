<template>
    <v-card tile elevation="0">

        <v-toolbar dense flat class="mt-2">
            <v-toolbar-title class="mr-2">Users</v-toolbar-title>
            <v-btn icon @click="refreshData" v-bind:disabled="isLoading">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon v-bind:disabled="isLoading">
                <v-icon>mdi-account-plus</v-icon>
            </v-btn>
            <v-spacer></v-spacer>

            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" outlined rounded solo single-line hide-details filled clearable dense flat></v-text-field>


        </v-toolbar>

        <v-alert type="error" v-if="errorMessage" tile>
            {{ errorMessage }}
        </v-alert>

        <v-data-table v-bind:headers="headers" v-bind:items="users" v-bind:search="search" v-bind:loading="isLoading"></v-data-table>
    </v-card>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import UPClient from "@/services/UPClient";
import User from "@/models/User";

@Component({

})
export default class Users extends Vue {
    search: string = "";
    headers = [
        {
            text: "ID",
            align: "start",
            sortable: true,
            value: "id"
        },
        {
            text: "Username",
            align: "start",
            sortable: true,
            value: "username"
        },
        {
            text: "Display Name",
            align: "start",
            sortable: true,
            value: "displayName"
        },
        {
            text: "Email",
            align: "start",
            sortable: true,
            value: "email"
        },
        {
            text: "Roles",
            align: "start",
            sortable: false,
            value: "roles"
        }
    ];
    users: User[] = [];
    errorMessage: string | null = null;
    isLoading: boolean = false;

    mounted() {
        this.refreshData();
    }

    refreshData() {
        this.isLoading = true;
        UPClient.listUsers((users: User[]) => {
            this.users = users;
            this.errorMessage = null;
            this.isLoading = false;
        }, (message: string) => {
            this.errorMessage = message;
            this.isLoading = false;
        });
    }
};
</script>

<style>
.v-text-field.v-input--dense .v-input__prepend-inner .v-input__icon > .v-icon {
    margin-top: 1px;
}
</style>