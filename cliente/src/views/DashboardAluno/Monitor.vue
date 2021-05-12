<template>
  <div class="Monitoria">
    <div class="menu-settings">
      <div>
        <v-btn small @click.native="$router.push({name:'MonitorDetalhes'})">
          ADICIONAR NOVO MONITOR
        </v-btn>
      </div>
      <div class="monitorias">
        <h3>
          Lista de Monitores
        </h3>
        <div
            v-for="(monitor, index) in monitores"
            :key="monitor+index"
            class="monitoriaItem"

        >
          <p>{{ monitor.id }} -
            {{ monitor.nome }}</p>
          <div class="monitoriaItemButton">
            <v-btn @click.native="editMonitor(monitor)" fab x-small color="primary">
              <v-icon x-small color="white">mdi-pencil</v-icon>
            </v-btn>
            <v-btn @click.native="deleteMonitor(monitor)" fab x-small color="red">
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
  name: 'Monitor',

  data() {
    return {}
  },
  mounted() {
    this.SET_MESSAGE({
      "rota": "cliente.usuarios"
    });
    this.SET_MONITOR(null);
  },
  methods: {
    ...mapMutations([
      "SET_MONITORIA",
      "SET_MESSAGE",
      "SET_MONITOR",
    ]),
    editMonitor(monitor) {
      this.SET_MONITOR(monitor);
      console.log(monitor);
      this.$router.push({name: 'MonitorDetalhes'});
    },
    deleteMonitor(monitor) {
      this.SET_MESSAGE({
        rota: "monitoria.delete",
        id: monitor.usuario,
      })
    }
  },
  computed: {
    ...mapState({
      monitores: state => state.monitor.monitores,
    })
  }

}
</script>


<style scoped>

.monitorias {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 150px;
  width: 200px;
}

.monitoriaItem > p {
  min-width: 100px;
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