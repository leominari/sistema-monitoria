<template>
  <div class="Login">
    <h1 align="center" class="titulo">Sistema Monitoria</h1>
    <div class="login-box">
      <v-text-field v-if="cadastrando" v-model="nome" label="Nome" outlined/>
      <v-text-field v-model="usuario" label="Usuario" outlined/>
      <v-text-field v-model="senha" type="password" label="Senha" outlined/>
      <p
          v-if="!cadastrando"
          class="novo-usuario"
          @click="cadastrando = !cadastrando"
          align="right"
      >
        É novo no sistema? Cadastre-se aqui
      </p>
      <v-btn
          v-if="cadastrando"
          color="primary"
          @click.native="Cadastro"
          @keyup.enter="Cadastro"
      >
        Registrar
      </v-btn>
      <v-btn
          v-else
          color="primary"
          @click.native="Login"
          @keyup.enter="Login"
      >
        Entrar
      </v-btn>
    </div>
  </div>
</template>

<script>
import {mapMutations} from "vuex";

export default {
  name: 'Login',
  data() {
    return {
      usuario: '',
      senha: '',
      nome: '',
      cadastrando: false,
    }
  },
  methods: {
    ...mapMutations(['SET_MESSAGE', "SET_USUARIO_LOGADO"]),
    Cadastro() {
      console.log('cadastrou');
      this.SET_MESSAGE({
        rota: 'login.registro',
        nome: this.usuario,
        usuario: this.usuario,
        is_monitor: false,
        senha: this.senha,
      });
      this.usuario = '';
      this.senha = '';
      this.nome = '';
      this.cadastrando = false;
    },
    Login() {
      this.SET_MESSAGE({
        rota: 'login.login',
        usuario: this.usuario,
        senha: this.senha,
      });
      this.SET_USUARIO_LOGADO(this.usuario);
    },
  }
}
</script>

<style scoped>
.Login {
  margin-left: 30%;
  margin-top: 10%;
  margin-right: 30%;

}

.titulo {
  padding-bottom: 30px;
  font-size: 48px;
}

.login-box {
  display: flex;
  flex-direction: column;
}

.novo-usuario {
  font-size: 14px;
  padding-bottom: 10px;
  /*padding-top: -10px;*/
  color: #0000FF;
}

.novo-usuario:hover {
  cursor: pointer;
}
</style>