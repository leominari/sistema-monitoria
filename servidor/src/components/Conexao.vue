<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12" v-if="!estadoServidor.executando">
        <h1 class="display-2 font-weight-bold mb-3">Bem vindo!</h1>

        <p class="subheading font-weight-regular">
          Servidor de gerenciamento de monitorias UTFPR!
        </p>
        <p>Entre com os dados para inicializacao do servidor</p>
      </v-col>

      <v-col class="mb-5" cols="5">
        <div>
          <v-text-field
            label="IP"
            outlined
            v-model="ip"
            :disabled="true"
          ></v-text-field>
        </div>
      </v-col>
      <v-col class="mb-5" cols="5">
        <div>
          <v-text-field
            label="Porta"
            outlined
            v-model="porta"
            :disabled="estadoServidor.executando"
          ></v-text-field>
        </div>
      </v-col>

      <v-col class="mb-5" cols="2">
        <v-btn @click="conectar" v-if="!estadoServidor.executando"
          >Inicializar</v-btn
        >
        <div v-else>
          <v-btn @click="desconectar" class="error">Finalizar</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "HelloWorld",

  data: function () {
    return {
      porta: "6666",
      ip: "127.0.0.1",
      server: null,
      inicializado: false,
    };
  },
  methods: {
    conectar() {
      this.$store.dispatch("inicializarServidor", {porta: this.porta, host: this.ip});
    },
    desconectar() {
      this.$store.dispatch("finalizarServidor");
    },
  },
  mounted() {
    var os = require('os');
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }

    console.log(addresses);
    this.ip = addresses[0];
  },
  computed:{
    estadoServidor(){
      console.log(this.$store.getters['estadoServidor']())
      return this.$store.getters['estadoServidor']();
    }
  },
};
</script>
