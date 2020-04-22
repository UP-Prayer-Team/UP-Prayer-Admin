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
                <div style="display: flex; justify-content: flex-end;">
                    <v-btn icon @click="editPostClicked(item)" v-bind:disabled="isLoading || isReadOnly">
                        <v-icon>
                            mdi-pencil
                        </v-icon>
                    </v-btn>
                    <v-btn icon @click="deletePostClicked(item)" v-bind:disabled="isLoading || isReadOnly">
                        <v-icon>
                            mdi-delete
                        </v-icon>
                    </v-btn>
                </div>
            </template>
        </v-data-table>

        <v-dialog v-model="showDeleteConfirmation" persistent max-width="550">
            <v-card>
                <v-card-title v-if="deleteTarget">
                    Delete &quot;{{ deleteTarget.title }}&quot;?
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
                        Delete Post
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showEditDialog" persistent max-width="850">
            <v-card>
                <v-card-title>
                    {{ isEditCreating ? "Create Blog Post" : "Edit \"" + editCopy.title + "\"" }}
                </v-card-title>
                <v-alert type="error" v-if="editErrorMessage" tile>
                    {{ editErrorMessage }}
                </v-alert>
                <v-form @submit.prevent="editPostSubmit">
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col>
                                    <v-text-field v-model="editCopy.title" label="Title" hide-details></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field v-model="editCopy.author" label="Author" hide-details disabled></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field v-model="editCopy.date" label="Date" hide-details></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field v-model="editCopy.content" label="Content" hide-details></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="editPostCancel" depressed>
                            Cancel
                        </v-btn>
                        <v-btn type="submit" v-bind:loading="editPending" color="primary" depressed>
                            {{ isEditCreating ? "Create" : "Save" }}
                        </v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
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
            text: "ID",
            align: "start",
            sortable: false,
            value: "id"
        },
        {
            text: "Author",
            align: "start",
            sortable: true,
            value: "author"
        },
        {
            text: "Actions",
            align: "end",
            sortable: false,
            value: "actions"
        }
    ];
    posts: BlogPostModel[] = [ ];
    filterText: string = "";

    // Delete confirmation dialog
    showDeleteConfirmation: boolean = false;
    deleteTarget: BlogPostModel | null = null;
    deletePending: boolean = false;
    deleteErrorMessage: string | null = null;

    // Create / edit dialog
    showEditDialog: boolean = false;
    editCopy: BlogPostModel = new BlogPostModel(); // A copy of the post to edit, or a blank one to create a post
    editPending: boolean = false;
    editErrorMessage: string | null = null;
    isEditCreating: boolean = false;

    mounted() {
        this.refreshData();
    }

    refreshData() {
        this.isLoading = true;
        UPClient.listPosts((posts: BlogPostModel[]) => {
            this.posts = posts;
            this.errorMessage = null;
            this.isLoading = false;
        }, (message: string) => {
            this.errorMessage = message;
            this.isLoading = false;
        });
    }

    createPostClicked() {
        this.editCopy = new BlogPostModel();
        if (State.state.user != null) {
            this.editCopy.author = State.state.user.displayName;
        }
        this.editErrorMessage = null;
        this.isEditCreating = true;
        this.showEditDialog = true;
    }

    editPostClicked(post: BlogPostModel) {
        this.isLoading = true;
        UPClient.getPost(post.id, (fullPost: BlogPostModel) => {
            this.isLoading = false;
            this.errorMessage = null;

            this.editCopy = Object.assign({}, fullPost);
            this.editErrorMessage = null;
            this.isEditCreating = false;
            this.showEditDialog = true;
        }, (message: string) => {
            this.errorMessage = message;
            this.isLoading = false;
        })

    }

    deletePostClicked(post: BlogPostModel) {
        this.deleteTarget = post;
        this.deleteErrorMessage = null;
        this.showDeleteConfirmation = true;
    }

    deleteConfirmed() {
        if (this.deleteTarget != null) {
            this.deletePending = true;
            UPClient.deletePost(this.deleteTarget.id, () => {
                this.deleteErrorMessage = null;
                this.deletePending = false;
                this.showDeleteConfirmation = false;
                this.deleteTarget = null;

                this.refreshData();
            }, (message: string) => {
                this.deleteErrorMessage = message;
                this.deletePending = false;
            });
        }
    }

    editPostSubmit() {
        this.editPending = true;
        let call = this.isEditCreating ? UPClient.createPost : UPClient.updatePost;

        call(this.editCopy, () => {
            this.editErrorMessage = null;
            this.editPending = false;
            this.showEditDialog = false;

            this.refreshData();
        }, (message: string) => {
            this.editErrorMessage = message;
            this.editPending = false;
        });

    }

    editPostCancel() {
        this.showEditDialog = false;
    }
}
</script>