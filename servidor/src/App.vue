<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="http://portal.utfpr.edu.br/icones/cabecalho/logo-utfpr/@@images/efcf9caf-6d29-4c24-8266-0b7366ea3a40.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <div class="mr-3">
        <span v-if="!bancoConectado">Banco de dados desconectado</span>
      </div>

      <div v-if="estadoServidor.executando" class="mr-3">
        <span class="mr-2"
          >Executando em {{ estadoServidor.host }}:{{
            estadoServidor.porta
          }}</span
        >
        <v-badge color="green" class="mx-3" />
        <v-btn class="mx-5" color="red" @click="desconectar"> Encerrar </v-btn>
      </div>
      <div v-else class="mr-3">
        <span class="mr-2">Servidor fechado</span>
        <v-badge color="red" />
      </div>
    </v-app-bar>

    <v-main>
      <Conexao @toast="onToast" v-if="!estadoServidor.executando" />
      <Servidor v-if="logs.length > 0" />
    </v-main>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.error ? 'red' : 'gray'"
    >
      {{ snackbar.message }}

      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import Conexao from "./components/Conexao";
import Servidor from "./components/Servidor";
export default {
  name: "App",

  components: {
    Conexao,
    Servidor,
  },

  data: () => ({
    snackbar: {
      show: false,
    },
    //
  }),
  computed: {
    estadoServidor() {
      return this.$store.getters["estadoServidor"]();
    },
    bancoConectado() {
      return this.$store.getters["bancoConectado"]();
    },
    logs() {
      return this.$store.state.logs;
    },
  },
  methods: {
    onToast(toast) {
      this.snackbar.show = true;
      this.snackbar.error = toast.error;
      this.snackbar.message = toast.message;
    },
    desconectar() {
      this.$store.dispatch("finalizarServidor");
    },
  },
  mounted() {
    this.$store.dispatch("criarServidor");
    this.$store.dispatch("criarBanco");
  },
  beforeDestroy() {
    this.desconectar();
  },
};
</script>
