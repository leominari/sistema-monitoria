<template>
  <div class="DashboardAluno">
    <div v-if="chat">
      <v-textarea
          v-model="textoChat"
          label="Chat"
          outlined
          full-width
      ></v-textarea>
      <v-text-field v-model="mensagem" label="Mensagem" outlined/>
      <v-btn @click.native="sendMessage">ENVIAR</v-btn>
    </div>
    <div v-else>
      <div v-if="permission === 'admin'">
        <h3 align="center">Usuários Online</h3>
        <div class="cards-dir">
          <UserCard
              v-for="(usuario, index) in usuarios"
              :usuario="usuario"
              :key="usuario+index"
          />
        </div>
      </div>
      <div v-else-if="permission === 'monitor'">
        <h3 align="center">Lista Monitorias</h3>
        <div class="cards-dir">
          <MonitoriaCard
              v-for="(monitoria, index) in monitoriasUsuario"
              :usuario="monitoria"
              :key="monitoria+index"
              @click.native="openChat(monitoria)"
          />
        </div>
      </div>
      <div v-else>
        <h3 align="center">Lista Monitorias</h3>
        <div class="cards-dir">
          <MonitoriaCard
              v-for="(monitoria, index) in monitoriasUsuario"
              :usuario="monitoria"
              :key="monitoria+index"
              @click.native="openChat(monitoria)"
          />
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import UserCard from "../../components/cards/UserCard";
import {mapMutations, mapState} from "vuex";
import MonitoriaCard from "../../components/cards/MonitoriaCard";

export default {
  name: 'DashboardAluno',
  components: {MonitoriaCard, UserCard},
  data() {
    return {
      chat: false,
      textoChat: '',
      mensagem: '',
      monitoriaSelecionada: null,
    }
  },
  mounted() {
    this.SET_MESSAGE({
      rota: this.permission === 'monitor' ? "monitoria.listar-monitor" : "monitoria.listar-aluno",
      usuario_monitor: this.usuarioLogado
    });
  },
  methods: {
    ...mapMutations([
      "SET_MESSAGE"
    ]),
    openChat(monitoria) {
      this.monitoriaSelecionada = monitoria;
      this.chat = true;
    },
    sendMessage() {
      this.textoChat += this.mensagem + '\n';
      this.SET_MESSAGE({
        rota: "chat.mensagem-enviar",
        usuario_destino: this.monitoriaSelecionada.nome_monitor,
        mensagem: this.mensagem,
      })
    }
  },
  computed: {
    ...mapState({
      usuarios: state => state.server.conectados,
      permission: state => state.server.permission,
      monitoriasUsuario: state => state.server.monitoriasUsuario,
      usuarioLogado: state => state.server.usuarioLogado,
    })
  }
}
</script>


<style scoped>
.DashboardAluno {
  margin-top: 5%;
  margin-left: 20%;
  margin-right: 20%;
}

.cards-dir {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.chat {
  word-wrap: normal;
}
</style>