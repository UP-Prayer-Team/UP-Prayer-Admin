<template>
    <div class="pt-2">
        <v-toolbar dense flat>
            <v-toolbar-title class="mr-2">
                Blog Posts
            </v-toolbar-title>
            <v-btn icon @click="refreshData" v-bind:disabled="isLoading">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon @click.stop="createPostClicked" v-bind:disabled="isLoading || isReadOnly">
                <v-icon>mdi-newspaper-plus</v-icon>
            </v-btn>
            <v-spacer></v-spacer>

            <v-text-field v-model="filterText" prepend-inner-icon="mdi-filter" label="Filter" outlined rounded solo single-line hide-details filled clearable dense flat></v-text-field>
        </v-toolbar>

        <v-alert type="error" v-if="errorMessage" tile>
            {{ errorMessage }}
        </v-alert>

        <v-data-table v-bind:headers="headers" v-bind:items="posts" v-bind:search="filterText" v-bind:loading="isLoading">
            <template v-slot:item.actions="{ item }">
                <div style="display: flex;">
                    <v-btn icon @click="editEndorsementClicked(item)" v-bind:disabled="isLoading || isReadOnly">
                        <v-icon>
                            mdi-pencil
                        </v-icon>
                    </v-btn>
                    <v-btn icon @click="deleteEndorsementClicked(item)" v-bind:disabled="isLoading || isReadOnly">
                        <v-icon>
                            mdi-delete
                        </v-icon>
                    </v-btn>
                </div>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import State from "@/state";
import BlogPostModel from "@/models/BlogPostModel";
import UPClient from "@/services/UPClient";

@Component({

})
export default class BlogPosts extends Vue {
    get isReadOnly(): boolean {
        return State.state.user == null || State.state.user.roles.indexOf("admin") == -1;
    }

    isLoading: boolean = false;
    errorMessage: string | null = null;
    headers = [
        {
            text: "ID",
            align: "start",
            sortable: false,
            value: "id"
        },
        {
            text: "Title",
            align: "start",
            sortable: true,
            value: "title"
        },
        {
            text: "Post Date",
            align: "start",
            sortable: true,
            value: "date"
        },
        {
            text: "Author",
            align: "start",
            sortable: true,
            value: "author"
        }
    ];
    posts: BlogPostModel[] = [ ];
    filterText: string = "";

    mounted() {
        this.refreshData();
    }

    refreshData() {
        UPClient.listPosts((posts: BlogPostModel[]) => {
            this.posts = posts;
        }, (message: string) => {
            this.errorMessage = message;
        });
    }

    createPostClicked() {

    }
}
</script>