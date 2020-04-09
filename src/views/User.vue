<template>
    <div class="pt-2">
        <v-toolbar dense flat>
            <v-btn icon @click="backClicked">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>

            <v-toolbar-title>
                {{ user != null ? user.displayName : "" }}
            </v-toolbar-title>

            <v-btn icon @click="refreshData" v-bind:disabled="isLoading">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>

            <v-btn icon @click.stop="deleteClicked" v-bind:disabled="isLoading || (user == null)">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-toolbar>

        <v-alert type="error" v-if="errorMessage" tile>
            {{ errorMessage }}
        </v-alert>

        <v-dialog v-model="showDeleteConfirmation" persistent max-width="350">
            <v-card>
                <v-card-title class="headline">
                    Delete {{ user.displayName }}?
                </v-card-title>
                <v-alert type="warning" tile>
                    This cannot be undone.
                </v-alert>
                <v-alert type="error" v-if="deleteErrorMessage" tile>
                    {{ deleteErrorMessage }}
                </v-alert>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="showDeleteConfirmation = false" depressed v-bind:disabled="deletePending">
                        Cancel
                    </v-btn>
                    <v-btn @click="deleteConfirmed" color="error" depressed v-bind:loading="deletePending">
                        Delete {{ user.displayName }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import UPClient from "@/services/UPClient";
import UserModel from "@/models/UserModel";

@Component({

})
export default class User extends Vue {
    user: UserModel | null = null;
    errorMessage: string | null = null;
    isLoading: boolean = false;

    showDeleteConfirmation = false;
    deletePending: boolean = false;
    deleteErrorMessage: string | null = null;

    mounted() {
        this.refreshData();
    }

    refreshData() {
        let id = this.$route.params["id"];
        this.user = null;
        this.errorMessage = null;
        this.isLoading = true;
        UPClient.getUser(id, (user: UserModel) => {
            this.user = user;
            this.isLoading = false;
        }, (message: string) => {
            this.errorMessage = message;
            this.isLoading = false;
        });
    }

    backClicked() {
        this.$router.back();
    }

    deleteClicked() {
        this.deleteErrorMessage = null;
        this.showDeleteConfirmation = true;
    }

    deleteConfirmed() {
        if (this.user != null && this.user.id != null) {
            this.deletePending = true;
            this.deleteErrorMessage = null;
            UPClient.deleteUser(this.user.id, () => {
                this.deletePending = false;
                this.showDeleteConfirmation = false;
                this.$router.back();
            }, (message: string) => {
                this.deletePending = false;
                this.deleteErrorMessage = message;
            });
        }
    }
};
</script>