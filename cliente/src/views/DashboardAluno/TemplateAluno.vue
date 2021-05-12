<template>
    <div class="ma-12 pa-12">
        <v-card class="navbar">
            <v-navigation-drawer
                permanent
            >
                <v-list>
                    <v-list-item link>
                        <v-list-item-content>
                            <v-list-item-title>
                                Bem vindo, {{ permission }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>

                <v-divider></v-divider>

                <v-list
                    nav
                >
                    <v-list-item @click.native="changeRoute('DashboardAluno')" link>
                        <v-list-item-icon>
                            <v-icon>mdi-home</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Dashboard</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="hasPermission(['aluno'])" @click.native="changeRoute('AlunoMonitoria')" link>
                        <v-list-item-icon>
                            <v-icon>mdi-account-star</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Aluno Monitoria</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="hasPermission(['admin'])" @click.native="changeRoute('MonitorDashboard')" link>
                        <v-list-item-icon>
                            <v-icon>mdi-account-star</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Monitores</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="hasPermission(['monitor', 'admin'])"
                                 @click.native="changeRoute('MonitoriaDashboard')"
                                 link>
                        <v-list-item-icon>
                            <v-icon>mdi-clipboard-text</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Monitorias</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="hasPermission(['aluno','admin','monitor'])"
                                 @click.native="changeRoute('SettingsAluno')" link>
                        <v-list-item-icon>
                            <v-icon>mdi-account</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Configurações</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click.native="deslogar" link>
                        <v-list-item-icon>
                            <v-icon>mdi-arrow-left-bold</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Sair</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <router-view></router-view>
        </v-card>
    </div>
</template>

<script>

import {mapState, mapMutations} from "vuex";
import Auth from "@/mixins/Auth";

export default {
    name: "TemplateAluno",
    mixins: [Auth],
    mounted() {

    },
    computed: {
        ...mapState({
            me: state => state.server.usuarioLogado,
            permission: state => state.server.permission,
        }),
        currentRouteName() {
            return this.$route.name;
        }
    },
    methods: {
        ...mapMutations(['SET_MESSAGE']),
        deslogar() {
            this.$router.push({name: 'Logout'});
            this.SET_MESSAGE({
                rota: "login.logout",
            })
        },
        changeRoute(route) {
            if (this.currentRouteName !== route) {
                this.$router.push({name: route})
            }
        }
    },
}
</script>

<style scoped>
.navbar {
    display: flex;
    flex-direction: row;
}
</style>