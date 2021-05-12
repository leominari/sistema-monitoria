<template>
  <div class="LogoutAluno">
  </div>
</template>


<script>
import {mapMutations} from "vuex";

export default {
  name: 'Logout',
  mounted() {
    this.SET_MESSAGE({
      "rota": "login.logout",
    });
    this.$router.push({name: 'Login'});
  },
  methods: {
    ...mapMutations([
      'SET_MESSAGE'
    ]),
  }
}
</script>


<style scoped>
.LogoutAluno {
  margin-top: 5%;
  margin-left: 20%;
  margin-right: 20%;
}
</style>