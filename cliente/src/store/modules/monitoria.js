export const monitoria = {
    state: () => ({
        monitoria: null,
        monitorias: [],
    }),
    mutations: {
        SET_MONITORIA(state, payload) {
            state.monitoria = payload;
        },
        SET_MONITORIAS(state, payload) {
            state.monitorias = payload;
        },
    },
    actions: {
        // action_setUserAuth(context, payload) {
        //     return (payload).then(response => {
        //         context.commit("SET_AUTH", response.data.result);
        //         if (response.data.result.tipoUsuarioId === 0)
        //             return true
        //         else
        //             return false;
        //     })
        // },
    }
}

export default monitoria;