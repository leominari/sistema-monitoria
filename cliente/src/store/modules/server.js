export const server = {
    state: () => ({
        conectados: [],
        mensagem: '',
        usuarioLogado: null,
        snack: '',
        permission: '',
        monitoriasUsuario: [],
    }),
    mutations: {
        SET_MESSAGE(state, payload) {
            state.mensagem = payload;
        },
        SET_MONITORIAS_USUARIO(state, payload) {
            state.monitoriasUsuario = payload;
        },
        SET_USUARIO_LOGADO(state, payload) {
            state.usuarioLogado = payload;
        },
        SET_USUARIOS_LOGADOS(state, payload) {
            state.conectados = payload;
        },
        setSnack(state, snack) {
            state.snack = snack
        },
        SET_PERMISSION(state, payload) {
            state.permission = payload;
        }
    },
    actions: {}
}

export default server;