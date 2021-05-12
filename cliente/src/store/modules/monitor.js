export const monitor = {
    state: () => ({
        monitor: null,
        monitores: [],
    }),
    mutations: {
        SET_MONITOR(state, payload) {
            state.monitor = payload;
        },
        SET_MONITORES(state, payload) {
            state.monitores = payload;
        },

    },
    actions: {}
}

export default monitor;