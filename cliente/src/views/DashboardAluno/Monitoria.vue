<template>
  <div class="Monitoria">
    <div class="menu-settings">
      <div>
        <v-btn small @click.native="$router.push({name:'MonitoriaDetalhes'})">
          ADICIONAR NOVA MONITORIA
        </v-btn>
      </div>
      <div class="monitorias" :key="resetMonitorias">
        <div
            v-for="(monitoria, index) in monitorias"
            :key="monitoria.id+index"
            class="monitoriaItem"

        >
          <p>{{ monitoria.id }} -
            {{ monitoria.nome }}</p>
          <div class="monitoriaItemButton">
            <v-btn @click.native="editMonitoria(monitoria)" fab x-small color="primary">
              <v-icon x-small color="white">mdi-pencil</v-icon>
            </v-btn>
            <v-btn @click.native="deleteMonitoria(monitoria)" fab x-small color="red">
              <v-icon x-small color="white">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
      <div class="spacing"></div>

    </div>
  </div>
</template>


<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: 'Monitoria',

  data() {
    return {
      resetMonitorias: 0,
    }
  },
  mounted() {
    this.SET_MESSAGE({
      "rota": "monitoria.listar"
    });
    this.SET_MONITORIA(null);
  },
  methods: {
    ...mapMutations([
      "SET_MONITORIA",
      "SET_MESSAGE",
    ]),
    editMonitoria(monitoria) {
      this.SET_MONITORIA(monitoria);
      this.$router.push({name: 'MonitoriaDetalhes'});
    },
    deleteMonitoria(monitoria) {
      this.SET_MESSAGE({
        rota: "monitoria.delete",
        id: monitoria.id,
      })
    }
  },
  computed: {
    ...mapState({
      monitorias: state => state.monitoria.monitorias,
    })
  },
  watch: {
    monitoria(){
      this.resetMonitorias++;
    }
  }

}
</script>


<style scoped>

.monitorias {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 500px;
  width: 500px;
}

.monitoriaItem > p {
  min-width: 200px;
}

.monitoriaItemButton {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;
}

.monitoriaItem {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;
  width: 150px;
  padding: 10px;
}

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
  flex-direction: column;
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