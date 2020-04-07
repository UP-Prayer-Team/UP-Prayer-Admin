<template>
    <v-content>
        <v-container class="fill-height" fluid>
            <v-row align="center" justify="center">
                <v-col cols="12" sm="8" md="4">
                    <v-card elevation="10" class="p-10">
                        <v-card-text>
                            UP Prayer Movement Administration

                            <v-form>
                                <v-text-field label="Username" name="username" type="text" />
                                <v-text-field label="Password" name="password" type="password" />
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />
                            <v-btn color="primary">
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
import Vue from 'vue';

export default Vue.extend({
    name: "Login",

    components: {

    },

    data: () => ({

    })
});
</script>