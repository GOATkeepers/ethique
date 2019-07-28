<template>
  <div class="home-body">
    <div class="login-msg">
      <div v-if="loginInProgress">
        <h3>Login process is happening as we speak!</h3>
        <h3>Please wait a second for us to fetch your statuses</h3>
      </div>
      <div v-else-if="user.username === undefined">
        <h3>Log in to use the app</h3>
      </div>
      <div v-if="registeringUser">
        <h3>Retrieving Token Balances</h3>
        <h3>
          If this is your first time logging in, you'll receive a Welcome Bonus.
        </h3>
      </div>
    </div>
    <div v-if="user.username">
      <Posts />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Posts from './Posts.vue'
export default {
  name: 'Home',
  components: {
    Posts
  },

  data() {
    return {}
  },

  computed: {
    ...mapGetters(['user', 'loginInProgress', 'registeringUser'])
  },

  methods: {
    // pass
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/variables.scss';

.home-body {
  margin: 0px auto;
  @media screen and (max-width: 640px) {
    padding: 0 5px;
  }
}
.login-msg h3 {
  text-align: center;
}
h2 {
  text-align: center;
}

.btn {
  background: $color2;
  border-radius: $border-radius;
  color: $white;
  min-width: 120px;
}
</style>
