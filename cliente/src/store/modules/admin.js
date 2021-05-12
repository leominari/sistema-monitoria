export const monitor = {
    state: () => ({
        admin: null,
        admins: [],
    }),
    mutations: {
        SET_ADMIN(state, payload) {
            state.admin = payload;
        },
        SET_ADMINS(state, payload) {
            state.admins = payload;
        },

    },
    actions: {}
}

export default monitor;