import {mapMutations} from "vuex";


export default {
    data() {
        return {
            rotas: {
                cliente: {
                    'usuarios-ativos': (rota) => {
                        this.SET_USUARIOS_LOGADOS(rota.usuarios);
                    },
                    usuarios: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.SET_MONITORES(data.usuarios.filter(u => u.tipo_usuario === 'monitor'));
                            this.SET_ALUNOS(data.usuarios.filter(u => u.tipo_usuario === 'aluno'));
                            this.SET_ADMINS(data.usuarios.filter(u => u.tipo_usuario === 'admin'));
                            // this.$router.push({name: 'DashboardAluno'});
                        }
                    },
                },
                login: {
                    login: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.SET_PERMISSION(data.tipo_usuario);
                            this.$router.push({name: 'DashboardAluno'});
                        }
                    },
                    update: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.setSnack({message: 'Usuario atualizado com sucesso!', erro: 'false'});
                        }
                    },
                    logout: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        }
                    },
                    registro: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.setSnack({message: 'Usuario registrado com sucesso!', erro: 'false'});
                        }
                    }
                },
                usuario: {
                    delete: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.setSnack({message: 'Usuario apagado com sucesso!', erro: 'false'});
                        }
                    }
                },
                monitoria: {
                    listar: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.SET_MONITORIAS(data.monitorias);
                        }
                    },
                    delete: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.setSnack({message: 'Monitoria apagada com sucesso!', erro: 'false'});
                        }
                    },
                    'listar-monitor': (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.SET_MONITORIAS_USUARIO(data.monitorias);
                        }
                    },
                    'listar-aluno': (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.SET_MONITORIAS_USUARIO(data.monitorias);
                        }
                    },
                },
                'aluno-monitoria': {
                    delete: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.setSnack({message: 'Aluno desassociado com sucesso!', erro: 'false'});
                        }
                    },
                    inscrever: (data) => {
                        if (data.erro !== "false") {
                            this.setSnack({message: this.trataMensagemErro(data.erro)});
                        } else {
                            this.setSnack({message: 'Aluno associado com sucesso!', erro: 'false'});
                        }
                    },

                }
            }
        }
    },
    methods: {
        ...mapMutations([
            "SET_USUARIOS_LOGADOS",
            "setSnack",
            "SET_PERMISSION",
            "SET_MONITORIA",
            "SET_MONITORIAS",
            "SET_MONITOR",
            "SET_MONITORES",
            "SET_ALUNO",
            "SET_ALUNOS",
            "SET_ADMIN",
            "SET_ADMINS",
            "SET_MONITORIAS_USUARIO"
        ]),
        trataMensagemErro(msg) {
            return msg.replaceAll("_", " ").toUpperCase();
        }
    }
}