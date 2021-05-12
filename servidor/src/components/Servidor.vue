<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-data-table
          :headers="headerLogs"
          :items="logs"
          :single-expand="true"
          :expanded.sync="expanded"
          item-key="uid"
          show-expand
          class="elevation-1"
          disable-pagination
          hide-default-footer
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Logs</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
          </template>
          <template v-slot:item.error="{ item }">
            <v-chip :color="item.error ? 'red' : 'green'" dark>
              {{ item.error ? "ERRO" : 'OK' }}
            </v-chip>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="text-left">
              <pre>{{ item.input }}</pre>
            </td>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "HelloWorld",

  data: function () {
    return {
      headerLogs: [
        {
          text: "Log",
          sortable: false,
          value: "name",
        },
        { text: "Usuario", value: "user" },
        { text: "Quando", value: "timestamp" },
        { text: "Erro", value: "error" },
        { text: "", value: "data-table-expand" },
      ],
      expanded: [],
    };
  },
  methods: {},
  computed: {
    estadoServidor() {
      console.log(this.$store.getters["estadoServidor"]());
      return this.$store.getters["estadoServidor"]();
    },
    logs() {
      return this.$store.state.logs;
    },
  },
};
</script>
