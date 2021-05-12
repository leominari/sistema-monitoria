<template>
  <v-card
      class="mx-auto cardstyle"
      max-width="400"
  >
    <div class="user-card">
      <v-badge color="green" class="mx-3 online-badge"/>
      <span>{{ usuario.nome }}</span>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'UserCard',
  props: {
    usuario: {
      default: 'leominari'
    },
  }
}
</script>

<style scoped>
.user-card {
  padding: 5px;
}

.cardstyle {
  margin: 10px;
}

span {
  margin-left: 10px;
}

.online-badge {
  margin-right: 2px;
}
</style>