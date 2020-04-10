<template>
    <div class="pt-2">
        <v-toolbar dense flat>
            <v-toolbar-title class="mr-2">
                Charity Endorsements
            </v-toolbar-title>
            <v-btn icon @click="refreshData" v-bind:disabled="isLoading">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon @click.stop="createEndorsementClicked" v-bind:disabled="isLoading">
                <v-icon>mdi-newspaper-plus</v-icon>
            </v-btn>
            <v-spacer></v-spacer>

            <v-text-field v-model="filterText" prepend-inner-icon="mdi-filter" label="Filter" outlined rounded solo single-line hide-details filled clearable dense flat></v-text-field>
        </v-toolbar>

        <v-alert type="error" v-if="errorMessage" tile>
            {{ errorMessage }}
        </v-alert>

        <v-data-table v-bind:headers="headers" v-bind:items="endorsements" v-bind:search="filterText" v-bind:loading="isLoading">
            <template v-slot:item.current="{ item }">
                <v-btn icon @click="setCurrentEndorsementClicked(item)" v-bind:disabled="isLoading" v-bind:color="endorsements.indexOf(item) == currentEndorsementIndex ? 'primary' : undefined">
                    <v-icon>
                        {{ endorsements.indexOf(item) == currentEndorsementIndex ? "mdi-star" : "mdi-star-outline" }}
                    </v-icon>
                </v-btn>
            </template>
            <template v-slot:item.actions="{ item }">
                <div style="display: flex;">
                    <v-btn icon @click="editEndorsementClicked(item)" v-bind:disabled="isLoading">
                        <v-icon>
                            mdi-pencil
                        </v-icon>
                    </v-btn>
                    <v-btn icon @click="deleteEndorsementClicked(item)" v-bind:disabled="isLoading">
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
                    Delete endorsement for
                </v-card-title>
                <v-card-title class="headline pt-0" v-if="deleteTarget">
                    {{ deleteTarget.homepageURL }}?
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
                        Delete Endorsement
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showEditDialog" persistent max-width="750">
            <v-card>
                <v-card-title>
                    {{ isEditCreating ? "Create" : "Edit" }} Endorsement
                    <v-spacer></v-spacer>
                    <v-btn icon @click="editEndorsementCancel">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-alert type="error" v-if="editErrorMessage" tile>
                    {{ editErrorMessage }}
                </v-alert>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-text-field v-model="editCopy.homepageURL" label="Homepage URL" hide-details></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field v-model="editCopy.donateURL" label="Donation URL" hide-details></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-textarea v-model="editCopy.summary" label="Summary" hide-details></v-textarea>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="editEndorsementCancel" depressed>
                        Cancel
                    </v-btn>
                    <v-btn @click="editEndorsementSubmit" v-bind:loading="editPending" color="primary" depressed>
                        {{ isEditCreating ? "Create" : "Save" }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import EndorsementModel from "@/models/EndorsementModel";
import UPClient from "@/services/UPClient";

@Component({

})
export default class Endorsements extends Vue {
    isLoading: boolean = false;
    errorMessage: string | null = null;
    filterText: string = "";
    headers = [
        {
            text: "Currently Focused",
            align: "center",
            sortable: false,
            value: "current"
        },
        {
            text: "Homepage URL",
            align: "start",
            sortable: true,
            value: "homepageURL"
        },
        {
            text: "Donation URL",
            align: "start",
            sortable: true,
            value: "donateURL"
        },
        {
            text: "Summary",
            align: "start",
            sortable: false,
            value: "summary"
        },
        {
            text: "Actions",
            align: "center",
            sortable: false,
            value: "actions"
        }
    ];
    endorsements: EndorsementModel[] = [];
    currentEndorsementIndex: number = 0;

    // Delete confirmation dialog
    showDeleteConfirmation: boolean = false;
    deleteTarget: EndorsementModel | null = null;
    deletePending: boolean = false;
    deleteErrorMessage: string | null = null;

    // Endorsement editing dialog
    showEditDialog: boolean = false;
    editTarget: EndorsementModel = new EndorsementModel(); // The endorsement to modify upon confirmation
    editCopy: EndorsementModel = new EndorsementModel(); // The endorsement the form modifies live
    editPending: boolean = false;
    editErrorMessage: string | null = null;
    isEditCreating: boolean = false;

    mounted() {
        this.refreshData();
    }

    refreshData() {
        if (this.isLoading)
            return;

        this.isLoading = true;
        UPClient.listEndorsements((currentIndex: number, endorsements: EndorsementModel[]) => {
            this.currentEndorsementIndex = currentIndex;
            this.endorsements = endorsements;
            this.errorMessage = null;
            this.isLoading = false;
        }, (message: string) => {
            this.errorMessage = message;
            this.isLoading = false;
        });
    }

    updateData() {
        if (this.isLoading)
            return;

        this.isLoading = true;
        UPClient.updateEndorsements(this.currentEndorsementIndex, this.endorsements, () => {
            this.errorMessage = null;
            this.isLoading = false;
        }, (message: string) => {
            this.errorMessage = message;
            this.isLoading = false;
        });
    }

    createEndorsementClicked() {
        this.editTarget = new EndorsementModel();
        this.editCopy = new EndorsementModel();
        this.isEditCreating = true;
        this.showEditDialog = true;
    }

    editEndorsementClicked(endorsement: EndorsementModel) {
        this.editTarget = endorsement;
        this.editCopy = Object.assign({}, endorsement);
        this.isEditCreating = false;
        this.showEditDialog = true;
    }

    deleteEndorsementClicked(endorsement: EndorsementModel) {
        this.deleteTarget = endorsement;
        this.showDeleteConfirmation = true;
        this.deleteErrorMessage = null;
    }

    setCurrentEndorsementClicked(endorsement: EndorsementModel) {
        let index: number = this.endorsements.indexOf(endorsement);
        if (index >= 0) {
            this.currentEndorsementIndex = index;
            this.updateData();
        }
    }

    deleteConfirmed() {
        if (this.deleteTarget != null) {
            let index: number = this.endorsements.indexOf(this.deleteTarget);

            // Calculate the new current index
            let newIndex: number = this.currentEndorsementIndex;
            if (newIndex >= index) {
                newIndex -= 1;
                if (newIndex < 0) {
                    newIndex = 0;
                }
            }

            let newEndorsements: EndorsementModel[] = Array<EndorsementModel>(...this.endorsements);
            newEndorsements.splice(index, 1);

            this.deletePending = true;
            UPClient.updateEndorsements(newIndex, newEndorsements, () => {
                this.currentEndorsementIndex = newIndex;
                this.endorsements = newEndorsements;

                this.deleteErrorMessage = null;
                this.deletePending = false;
                this.showDeleteConfirmation = false;
                this.deleteTarget = null;
            }, (message: string) => {
                this.deleteErrorMessage = message;
                this.deletePending = false;
            });

        }
    }

    editEndorsementSubmit() {
        let newEndorsements: EndorsementModel[] = Array<EndorsementModel>(...this.endorsements);
        if (this.isEditCreating) {
            newEndorsements.push(this.editCopy);
        }
        else {
            let index = this.endorsements.indexOf(this.editTarget);
            newEndorsements[index] = this.editCopy;
        }

        this.editPending = true;
        UPClient.updateEndorsements(this.currentEndorsementIndex, newEndorsements, () => {
            this.endorsements = newEndorsements;

            this.editErrorMessage = null;
            this.editPending = false;
            this.showEditDialog = false;
        }, (message: string) => {
            this.editErrorMessage = message;
            this.editPending = false;
        });
    }

    editEndorsementCancel() {
        this.showEditDialog = false;
    }
}
</script>