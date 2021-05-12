<template>
  <div class="SettingsAluno">
    <div class="menu-settings">
      <div class="form-nova-senha">
        <v-text-field v-model="usuario" label="Usuario" outlined/>
        <v-text-field v-model="novoUsuario" label="Novo Usuario" outlined/>
        <v-text-field v-model="nome" label="Nome" outlined/>
        <v-text-field v-model="senha" label="Nova senha" outlined/>
        <div class="close-account">
          <v-btn @click="alterarUsuario" color="primary">Alterar</v-btn>
          <div class="spacing"></div>
          <v-btn @click="apagarConta" color="red">APAGAR CONTA</v-btn>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: 'SettingsAluno',
  data() {
    return {
      usuario: '',
      novoUsuario: '',
      nome: '',
      senha: '',
    }
  },
  methods: {
    ...mapMutations(['SET_MESSAGE', 'setSnack']),
    apagarConta() {
      if (this.usuario === '') {
        this.setSnack({message: 'Preecha o usuario que quer apagar.'});
        return;
      }
      this.SET_MESSAGE({
        rota: "usuario.delete",
        usuario: this.usuario,
      })
    },
    alterarUsuario() {
      this.SET_MESSAGE({
        rota: "login.update",
        usuario: this.usuario,
        novo_usuario: this.novoUsuario,
        nome: this.nome,
        senha: this.senha,
      })
    }
  },
  computed: {
    ...mapState({
      mensagem: state => state.server.mensagem,
      me: state => state.server.usuarioLogado,
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
  width: 20px;
}
</style>