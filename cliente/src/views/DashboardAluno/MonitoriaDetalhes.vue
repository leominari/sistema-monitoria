<template>
  <div class="Monitoria">
    <div class="menu-settings">
      <div class="form-nova-monitoria">
        <h3>Nova Monitoria</h3>
        <v-text-field v-model="nomeMonitoria" label="Nome Monitoria" outlined/>
        <v-text-field v-model="usuarioMonitor" label="Usuario Monitor" outlined/>
        <v-text-field v-model="senhaMonitoria" :label="monitoria === null ? 'Senha':'Nova Senha'" outlined/>
        <v-img
            alt="Vuetify Name"
            class="shrink mt-1 hidden-sm-and-down"
            contain
            height="272"
            src="https://media.discordapp.net/attachments/781239146429284402/839246322073731142/unknown.png?width=545&height=340"
            width="436"
        />
        <div class="spacing"></div>

        <v-select
            v-model="diaSemana"
            outlined
            item-text="text"
            item-value="id"
            :items="[
                {
                  id: 1,
                  text: 'Segunda'
                },
                                {
                  id: 2,
                  text: 'Terça'
                },
                                {
                  id: 3,
                  text: 'Quarta'
                },
                                {
                  id: 4,
                  text: 'Quinta'
                },
                                {
                  id: 5,
                  text: 'Sexta'
                },
            ]"
            label="Dia da Semana"
            return-object
        />
        <v-select
            v-model="horarioUTF"
            outlined
            label="Horario"
            item-text="text"
            item-value="id"
            :items="[
                {
                  id: 1,
                  text: 'M1'
                },
                                {
                  id: 2,
                  text: 'M2'
                },
                                {
                  id: 3,
                  text: 'M3'
                },
                                {
                  id: 4,
                  text: 'M4'
                },
                                {
                  id: 5,
                  text: 'M5'
                },
                {
                  id: 6,
                  text: 'M6'
                },
                {
                  id: 7,
                  text: 'T1'
                },
                {
                  id: 8,
                  text: 'T2'
                },
                {
                  id: 9,
                  text: 'T3'
                },
                {
                  id: 10,
                  text: 'T4'
                },
                {
                  id: 11,
                  text: 'T5'
                },
                {
                  id: 12,
                  text: 'T6'
                },
                {
                  id: 13,
                  text: 'N1'
                },
                {
                  id: 14,
                  text: 'N2'
                },
                {
                  id: 15,
                  text: 'N3'
                },
                {
                  id: 16,
                  text: 'N4'
                },
                {
                  id: 17,
                  text: 'N5'
                },
            ]"
            return-object
        />
        <v-btn @click="adicionaHorario" color="primary">Adicionar Horario</v-btn>
        <div class="spacing"></div>
        <div class="horarios">

          <Horario :key="horario" :horario="horario" @delete="removerHorario(horario)" v-for="horario in horarios"/>
        </div>
        <div class="spacing"></div>


        <v-btn @click="sendConta" color="primary">{{
            monitoria === null ? 'CRIAR MONITORIA' : 'EDITAR MONITORIA'
          }}
        </v-btn>

      </div>

    </div>
  </div>
</template>


<script>
import {mapMutations, mapState} from "vuex";
import Horario from "../../components/Horario";

export default {
  name: 'MonitoriaDetalhes',
  components: {Horario},
  data() {
    return {
      nomeMonitoria: '',
      senhaMonitoria: '',
      usuarioMonitor: '',
      horarios: [],
      diaSemana: null,
      horarioUTF: null,
    }
  },
  mounted() {
    console.log(this.monitoria);
    if (this.monitoria !== null) {
      this.nomeMonitoria = this.monitoria.nome;
      this.usuarioMonitor = this.monitoria.usuario_monitor;
      this.horarios = this.monitoria.horarios;
    }
  },
  methods: {
    ...mapMutations(['SET_MESSAGE', 'setSnack']),
    sendConta() {
      if (this.nomeMonitoria === '') {
        this.setSnack({message: 'Preecha o usuario que quer apagar.'});
        return;
      }
      if (this.monitoria === null) {
        if (this.senhaMonitoria === '') {
          this.setSnack({message: 'Preecha a senha que quer apagar.'});
          return;
        }
        this.SET_MESSAGE({
          rota: "monitoria.registro",
          nome: this.nomeMonitoria,
          senha: this.senhaMonitoria,
          usuario_monitor: this.usuarioMonitor,
          horarios: this.horarios,
        })
      } else {
        this.SET_MESSAGE({
          rota: "monitoria.update",
          id: this.monitoria.id,
          nome: this.nomeMonitoria,
          usuario_monitor: this.usuarioMonitor,
          senha: this.senhaMonitoria,
          horarios: this.horarios
        })
      }
    },
    alterarUsuario() {
      this.SET_MESSAGE({
        rota: "login.update",
        usuario: this.usuario,
        senha: this.senha,
      })
    },
    adicionaHorario() {
      if (this.diaSemana === null) return;
      if (this.horarioUTF === null) return;
      let horario = `${this.diaSemana.id}${this.horarioUTF.text}`;
      if (this.horarios.includes(horario)) {
        this.setSnack({message: 'Você já adicionou esse horario'});
        return;
      }
      this.horarios.push(`${this.diaSemana.id}${this.horarioUTF.text}`);
    },
    removerHorario(horario) {
      this.horarios = this.horarios.filter(h => h !== horario);
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