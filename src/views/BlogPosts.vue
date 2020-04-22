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

        <v-data-table v-bind:headers="headers" v-bind:items="posts" v-bind:search="filterText" v-bind:loading="isLoading" sort-by="date">
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
                                    <!--
                                        <v-text-field v-model="editCopy.date" label="Date" hide-details></v-text-field>
                                    -->
                                    <v-menu v-model="showDatePicker" v-bind:close-on-content-click="false" min-width="100px" offset-y>
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="editCopy.date" label="Publish Date" prepend-icon="mdi-calendar-clock" v-on="on" readonly hide-details></v-text-field>
                                        </template>
                                        <v-date-picker v-model="isoDate" @input="datePickerHide"></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-card outlined>
                                        <editor-menu-bar v-bind:editor="editor" v-slot="{ commands, isActive, getMarkAttrs }">
                                            <v-row class="mx-1 mt-1">
                                                <div>
                                                    <v-btn @click.prevent="commands.undo" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-undo
                                                        </v-icon>
                                                    </v-btn>
                                                    <v-btn @click.prevent="commands.redo" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-redo
                                                        </v-icon>
                                                    </v-btn>
                                                </div>
                                                <div class="ml-3">
                                                    <v-btn @click.prevent="commands.bold" v-bind:color="isActive.bold() ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-bold
                                                        </v-icon>
                                                    </v-btn>
                                                    <v-btn @click.prevent="commands.italic" v-bind:color="isActive.italic() ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-italic
                                                        </v-icon>
                                                    </v-btn>
                                                    <v-btn @click.prevent="commands.underline" v-bind:color="isActive.underline() ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-underline
                                                        </v-icon>
                                                    </v-btn>
                                                    <v-btn @click.prevent="commands.strike" v-bind:color="isActive.strike() ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-strikethrough
                                                        </v-icon>
                                                    </v-btn>
                                                </div>
                                                <div class="ml-3">
                                                    <v-btn @click.prevent="commands.heading({ level: 1 })" v-bind:color="isActive.heading({ level: 1 }) ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-header-1
                                                        </v-icon>
                                                    </v-btn>
                                                    <v-btn @click.prevent="commands.heading({ level: 2 })" v-bind:color="isActive.heading({ level: 2 }) ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-header-2
                                                        </v-icon>
                                                    </v-btn>
                                                    <v-btn @click.prevent="commands.heading({ level: 3 })" v-bind:color="isActive.heading({ level: 3 }) ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-header-3
                                                        </v-icon>
                                                    </v-btn>
                                                </div>
                                                <div class="ml-3">
                                                    <v-btn @click.prevent="commands.bullet_list" v-bind:color="isActive.bullet_list() ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-list-bulleted
                                                        </v-icon>
                                                    </v-btn>
                                                    <v-btn @click.prevent="commands.ordered_list" v-bind:color="isActive.ordered_list() ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-list-numbered
                                                        </v-icon>
                                                    </v-btn>
                                                </div>
                                                <div class="ml-3">
                                                    <v-btn @click.prevent="showLinkEditor(isActive.link() ? getMarkAttrs('link').href : '')" v-bind:color="isActive.link() ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            {{ isActive.link() ? "mdi-link" : "mdi-link-plus" }}
                                                        </v-icon>
                                                    </v-btn>
                                                    <v-btn v-if="isActive.link()" @click.prevent="commands.link({ href: null })" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-link-off
                                                        </v-icon>
                                                    </v-btn>
                                                </div>

                                                <v-dialog v-model="linkEditorVisible" max-width="400">
                                                    <v-card>
                                                        <v-card-title>
                                                            {{ isActive.link() ? "Edit" : "Create" }} Link
                                                        </v-card-title>

                                                        <v-form @submit.prevent="confirmLink(commands, linkEditorURL)">
                                                            <v-card-text>
                                                                <v-text-field v-model="linkEditorURL" label="Destination URL" hide-details></v-text-field>
                                                            </v-card-text>

                                                            <v-card-actions>
                                                                <v-spacer></v-spacer>
                                                                <v-btn @click="linkEditorVisible = false" depressed>
                                                                    Cancel
                                                                </v-btn>
                                                                <v-btn type="submit" color="primary" depressed>
                                                                    {{ isActive.link() ? "Update" : "Create" }}
                                                                </v-btn>
                                                            </v-card-actions>
                                                        </v-form>
                                                    </v-card>
                                                </v-dialog>

                                                <div class="ml-3">
                                                    <v-btn @click.prevent="commands.blockquote" v-bind:color="isActive.blockquote() ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-format-quote-open
                                                        </v-icon>
                                                    </v-btn>
                                                    <v-btn @click.prevent="commands.code_block" v-bind:color="isActive.code_block() ? 'primary' : undefined" depressed class="toolbar-button">
                                                        <v-icon>
                                                            mdi-code-braces
                                                        </v-icon>
                                                    </v-btn>
                                                </div>
                                            </v-row>

                                            <!--<div class="menubar">

                                                <button
                                                    class="menubar__button"
                                                    :class="{ 'is-active': isActive.paragraph() }"
                                                    @click="commands.paragraph"
                                                    >
                                                    <icon name="paragraph" />
                                                </button>

                                            </div>-->
                                        </editor-menu-bar>
                                        <v-card-text class="px-1 py-1" style="color: unset;">
                                            <editor-content v-bind:editor="editor"></editor-content>

                                        </v-card-text>
                                    </v-card>

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
import { Editor, EditorContent, EditorMenuBar } from "tiptap";
import { Blockquote, CodeBlock, Heading, ListItem, OrderedList, BulletList, Bold, Italic, Underline, Strike, Link, History } from "tiptap-extensions";
import State from "@/state";
import BlogPostModel from "@/models/BlogPostModel";
import UPClient from "@/services/UPClient";

@Component({
    components: {
        EditorContent,
        EditorMenuBar
    }
})
export default class BlogPosts extends Vue {
    get isReadOnly(): boolean {
        return State.state.user == null || State.state.user.roles.indexOf("admin") == -1;
    }

    dateSorter(a: string, b: string) {
        return new Date(a).valueOf() - new Date(b).valueOf();
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
            value: "date",
            sort: this.dateSorter
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
    showDatePicker: boolean = false;
    isoDate: string = "";
    editor: any = null;
    linkEditorVisible: boolean = false;
    linkEditorURL: string = "";

    mounted() {
        this.refreshData();
        this.editor = new Editor({
            extensions: [
                new Blockquote(),
                new CodeBlock(),
                new Heading({ levels: [ 1, 2, 3 ] }),
                new OrderedList(),
                new BulletList(),
                new ListItem(),
                new Bold(),
                new Italic(),
                new Underline(),
                new Strike(),
                new Link(),
                new History()
            ]
        });
    }

    beforeDestroy() {
        this.editor.destroy();
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
        this.isoDate = new Date().toISOString().substr(0, 10);
        this.editor.options.content = this.editCopy.content;
        this.editor.view.updateState(this.editor.createState()); // Reset editor history and state
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
            this.isoDate = new Date(this.editCopy.date).toISOString().substr(0, 10)
            this.editor.options.content = this.editCopy.content;
            this.editor.view.updateState(this.editor.createState()); // Reset editor history and state
        }, (message: string) => {
            this.errorMessage = message;
            this.isLoading = false;
        });
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
        this.editCopy.content = this.editor.getHTML();
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

    datePickerHide() {
        let [ year, month, day ] = this.isoDate.split("-");
        this.editCopy.date = parseInt(month) + "/" + parseInt(day) + "/" + year;
        this.showDatePicker = false;
    }

    showLinkEditor(href: string) {
        this.linkEditorURL = href;
        this.linkEditorVisible = true;
    }

    confirmLink(commands: any, href: string) {
        commands.link({ href });
        this.linkEditorVisible = false;
    }
}
</script>

<style>
.toolbar-button {
    border-radius: 0px;
    padding: 0 !important;
    /*width: 1em;
    height: 1em;*/
    min-width: 0px !important;
    width: 28px;
    height: 28px !important;
}

.toolbar-button:first-child {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
}

.toolbar-button:last-child {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
}

.v-application code::before {
    content: unset !important;
}
</style>