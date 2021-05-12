<template>
  <v-app>

    <v-main>
      <v-container v-if="!conectado">
        <v-row class="text-center">
          <v-col cols="12">
            <h1 class="display-2 font-weight-bold mb-3">Bem vindo!</h1>

            <p class="subheading font-weight-regular">
              Sistema para gerenciamento de monitorias UTFPR!
            </p>
            <p>Entre com os dados de conexao</p>
          </v-col>

          <v-col class="mb-5" cols="5">
            <div>
              <v-text-field label="IP" outlined v-model="ip" :disabled="conectado"></v-text-field>
            </div>
          </v-col>
          <v-col class="mb-5" cols="5">
            <div>
              <v-text-field label="Porta" outlined v-model="porta" :disabled="conectado"></v-text-field>
            </div>
          </v-col>

          <v-col class="mb-5" cols="2">
            <v-btn @click="Connect" v-if="!conectado">Conectar</v-btn>
          </v-col>
        </v-row>
      </v-container>
      <router-view></router-view>
      <Snackbar/>
    </v-main>
  </v-app>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import net from "net";
import Server from "./mixins/Server";
import Snackbar from './components/Snackbar'
import split from 'split';

export default {
  name: 'App',
  mixins: [Server],
  components: {
    Snackbar,
  },
  data() {
    return {
      ip: '',
      porta: '',
      socket: null,
      conectado: false,
      stream: null,
    }
  },

  mounted() {
    this.socket = new net.Socket();
    this.ip = '127.0.0.1';
    this.porta = '6666';
    this.conectado = false;

    this.stream = this.socket.pipe(split());

    this.stream.on('data', response => {
      console.log('Recebido:' + response);
      response = JSON.parse(response);
      if (!response.rota) return;
      let rota = response.rota.split('.');
      if (this.rotas[rota[0]] && this.rotas[rota[0]][rota[1]])
        this.rotas[rota[0]][rota[1]](response);

    });

    this.socket.on('close', () => {
      console.log('Conexão perdida');
      this.Disconnect();
      this.setSnack({message: "Conexão perdida"});
    });
  },
  methods: {
    ...mapActions(['']),
    ...mapMutations([
      'SET_MESSAGE',
    ]),
    sendMessage(mensagem) {
      mensagem = JSON.stringify(mensagem);
      console.log('Enviado:' + mensagem);
      this.socket.write(mensagem + '\n');
    },
    Connect() {
      console.log("conectando em ", {port: this.porta, host: this.ip});
      this.socket.connect({host: this.ip, port: this.porta}, () => {
        this.conectado = true;
        console.log('conectado');
        this.$router.push({name: 'Login'});
      });
    },
    Disconnect() {
      this.socket.destroy();
      this.conectado = false;
      this.$router.push({name: 'Dashboard'});
    }
  },
  computed: {
    ...mapState({
      mensagem: state => state.server.mensagem,
      me: state => state.server.usuarioLogado,
    })
  },
  watch: {
    mensagem(value) {
      this.sendMessage(value);
    }
  },
};
</script>
