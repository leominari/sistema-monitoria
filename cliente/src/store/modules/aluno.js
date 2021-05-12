export const monitor = {
    state: () => ({
        aluno: null,
        alunos: [],
    }),
    mutations: {
        SET_ALUNO(state, payload) {
            state.aluno = payload;
        },
        SET_ALUNOS(state, payload) {
            state.alunos = payload;
        },

    },
    actions: {}
}

export default monitor;