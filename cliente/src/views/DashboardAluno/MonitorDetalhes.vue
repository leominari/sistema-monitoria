<template>
  <div class="Monitoria">
    <div class="menu-settings">
      <div class="form-nova-monitoria">
        <h3 v-if="monitor === null">Novo Monitor</h3>
        <h3 v-else>Editar Monitor</h3>
        <v-text-field v-model="usuarioMonitor" :disabled="monitor !== null" label="Usuario Antigo Monitor" outlined/>
        <v-text-field v-if="monitor !== null" v-model="novoUsuarioMonitor" label="Novo Usuario Monitor" outlined/>
        <v-text-field v-model="nomeMonitor" label="Nome Monitor" outlined/>
        <v-text-field v-model="senhaMonitor" label="Nova Senha" outlined/>
        <div class="spacing"></div>


        <v-btn v-if="monitor === null" @click="createConta" color="primary">REGISTRAR MONITOR</v-btn>
        <v-btn v-else @click="sendConta" color="primary">SALVAR MONITOR</v-btn>

      </div>

    </div>
  </div>
</template>


<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: 'MonitorDetalhes',
  components: {},
  data() {
    return {
      nomeMonitor: '',
      senhaMonitor: '',
      usuarioMonitor: '',
      novoUsuarioMonitor: '',

    }
  },
  mounted() {
    if (this.monitor !== null) {
      this.nomeMonitor = this.monitor.nome;
      this.usuarioMonitor = this.monitor.usuario;
    }
  },
  methods: {
    ...mapMutations(['SET_MESSAGE', 'setSnack', "SET_MONITOR"]),
    sendConta() {
      if (this.nomeMonitor === '') {
        this.setSnack({message: 'Preecha nome do monitor.'});
        return;
      }

      this.SET_MESSAGE({
        rota: "login.update",
        usuario: this.usuarioMonitor,
        novo_usuario: this.novoUsuarioMonitor,
        nome: this.nomeMonitor,
        senha: this.senhaMonitor,
      })
      this.SET_MONITOR(null);
      this.SET_MESSAGE({
        "rota": "cliente.usuarios"
      });
      this.$router.push({name: 'DashboardAluno'});

    },
    createConta() {
      this.SET_MESSAGE({
        rota: 'login.registro',
        nome: this.nomeMonitor,
        usuario: this.usuarioMonitor,
        is_monitor: true,
        senha: this.senhaMonitor,
      });
      this.SET_MONITOR(null);
      this.SET_MESSAGE({
        "rota": "cliente.usuarios"
      });
      this.$router.push({name: 'DashboardAluno'});

    }

  },
  computed: {
    ...mapState({
      mensagem: state => state.server.mensagem,
      me: state => state.server.usuarioLogado,
      monitor: state => state.monitor.monitor,
    }),
  }
}
</script>


<style scoped>
.SettingsAluno {
  margin-top: 5%;
  margin-left: 20%;
  margin-right: 20%;
}

.form-nova-senha {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  padding-bottom: 20px;
}

.menu-settings {
  display: flex;
  flex-direction: row;
}

.close-account {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;
}

.spacing {
  padding-top: 20px;
}
</style>