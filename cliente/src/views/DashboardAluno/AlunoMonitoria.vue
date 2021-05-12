<template>
  <div class="Monitoria">

    <h3>Associação</h3>
    <v-text-field v-model="monitoriaID" label="ID Monitoria" outlined/>
    <v-text-field v-model="senhaMonitoria" label="Senha Monitoria" outlined/>
    <v-text-field v-model="usuarioAluno" label="Usuario Aluno" outlined/>


    <div class="spacing"></div>

    <div class="groupButtons">

      <v-btn @click="associar" color="primary">ASSOCIAR</v-btn>
      <v-btn @click="desassociar" color="primary">DESASSOCIAR</v-btn>
    </div>

  </div>
</template>


<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: 'MonitorDetalhes',

  data() {
    return {
      usuarioAluno: '',
      senhaMonitoria: '',
      monitoriaID: '',
    }
  },
  mounted() {

  },
  methods: {
    ...mapMutations(['SET_MESSAGE', 'setSnack']),
    associar() {
      if (this.monitoriaID === '') return;
      if (this.senhaMonitoria === '') return;
      if (this.usuarioAluno === '') return;
      this.SET_MESSAGE({
        rota: "aluno-monitoria.inscrever",
        id: this.monitoriaID,
        senha: this.senhaMonitoria,
        usuario_aluno: this.usuarioAluno
      });
    },
    desassociar() {
      if (this.monitoriaID === '') return;
      if (this.senhaMonitoria === '') return;
      if (this.usuarioAluno === '') return;
      this.SET_MESSAGE({
        rota: "aluno-monitoria.delete",
        id: this.monitoriaID,
        usuario_aluno: this.usuarioAluno
      });
    }
  },
  computed: {
    ...mapState({
      mensagem: state => state.server.mensagem,
      me: state => state.server.usuarioLogado,
      monitoria: state => state.monitoria.monitoria,
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

.groupButtons {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;

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