<template>
  <div>
    <div class="organiza-horario">
      <div align="center" class="horario">
        <h3>
          {{ `${returnSemanaByID(horario[0])} - ${horario[1] + horario[2]}` }}
        </h3>
      </div>
      <v-btn small color="red" @click.native="$emit('delete')" fab>
        <v-icon color="white">
          mdi-close-circle
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Horario',
  props: {
    horario: {
      default: 'M1',
    },
  },
  methods: {
    returnSemanaByID(id) {
      let semanas = [
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
      ]
      return semanas[parseInt(id) - 1];
    }
  }
}
</script>


<style scoped>
.horario {
  border-radius: 10px;
  background-color: black;
  width: 150px;
  height: 40px;
}

.horario > h3 {
  margin-top: 5px;
  color: white;
}

.organiza-horario {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  width: 200px;
}
</style>