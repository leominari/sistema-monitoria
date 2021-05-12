import Vue from 'vue'
import Vuex from 'vuex'
import login from './modules/login'
import server from './modules/server'
import monitoria from './modules/monitoria'
import monitor from "./modules/monitor";
import aluno from "./modules/aluno";
import admin from "./modules/admin";


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    login: login,
    server: server,
    monitoria: monitoria,
    monitor: monitor,
    aluno: aluno,
    admin: admin,
  }
})
