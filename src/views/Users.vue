<template>
    <!--<v-card tile elevation="0" class="pt-2">-->
    <div class="pt-2">
        <v-toolbar dense flat>
            <v-toolbar-title class="mr-2">Users</v-toolbar-title>
            <v-btn icon @click="refreshData" v-bind:disabled="isLoading">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon @click="createUserClicked" v-bind:disabled="isLoading">
                <v-icon>mdi-account-plus</v-icon>
            </v-btn>
            <v-spacer></v-spacer>

            <v-text-field v-model="filterText" prepend-inner-icon="mdi-filter" label="Filter" outlined rounded solo single-line hide-details filled clearable dense flat></v-text-field>


        </v-toolbar>

        <v-alert type="error" v-if="errorMessage" tile>
            {{ errorMessage }}
        </v-alert>

        <v-data-table v-bind:headers="headers" v-bind:items="users" v-bind:search="filterText" v-bind:loading="isLoading"></v-data-table>

        <v-dialog v-model="showCreateUser" persistent max-width="700px">
            <v-card elevation="0">
                <v-card-title>
                    Create New User
                    <v-spacer></v-spacer>
                    <v-btn icon @click="createUserCancel">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-alert type="error" v-if="createUserErrorMessage" tile>
                    {{ createUserErrorMessage }}
                </v-alert>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-text-field v-model="createUserData.username" label="Username" hide-details></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field v-model="createUserData.password" label="Password" type="password" hide-details></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field v-model="createUserData.displayName" label="Dislay Name" hide-details></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field v-model="createUserData.email" label="Email Address" hide-details></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select v-model="createUserData.type" v-bind:items="userTypeOptions" label="Privileges"></v-select>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="createUserSubmit" color="primary" depressed v-bind:loading="createUserLoading">
                        Create User
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
    <!--</v-card>-->
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import UPClient from "@/services/UPClient";
import User from "@/models/User";

@Component({

})
export default class Users extends Vue {
    filterText: string = "";
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

    showCreateUser: boolean = false;
    userTypeOptions = [
        "Spectator (Read-only)",
        "Administrator (Complete power)"
    ];
    userTypeRoles = [
        [ "spectator" ],
        [ "spectator", "admin" ]
    ];
    blankUserData = {
        username: "",
        password: "",
        displayName: "",
        email: "",
        type: this.userTypeOptions[0]
    };
    createUserData = Object.assign({}, this.blankUserData);
    createUserLoading: boolean = false;
    createUserErrorMessage: string | null = null;

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

    createUserClicked() {
        this.createUserData = Object.assign({}, this.blankUserData);
        this.showCreateUser = true;
    }

    createUserCancel() {
        this.showCreateUser = false;
    }

    createUserSubmit() {
        this.createUserLoading = true;
        this.createUserErrorMessage = null;
        let roles = this.userTypeRoles[this.userTypeOptions.indexOf(this.createUserData.type)];
        UPClient.createUser(this.createUserData.username, this.createUserData.password, this.createUserData.displayName, this.createUserData.email, roles, () => {
            this.createUserLoading = false;
            this.showCreateUser = false;
            this.refreshData();
        }, (message: string) => {
            this.createUserLoading = false;
            this.createUserErrorMessage = message;
        });
    }
};
</script>

<style>
.v-text-field.v-input--dense .v-input__prepend-inner .v-input__icon > .v-icon {
    margin-top: 1px;
}
</style>