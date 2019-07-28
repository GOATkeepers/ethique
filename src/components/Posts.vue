<template>
  <div class="container">
    <div v-if="retrievingTweets">
      <h2>Currently loading your feed. Please wait a second</h2>
    </div>
    <div v-else class="full-row">
      <button @click="reload" class="btn">Check for Newer Tweets</button>
    </div>
    <div v-if="statusFeed.ranked">
      <h2>Ranked Statuses</h2>
      <div v-for="post in statusFeed.ranked" class="outer-box">
        <Status :post="post" />
      </div>
    </div>
    <div v-if="statusFeed.unranked">
      <h2 v-if="statusFeed.ranked">More from your Timeline</h2>
      <h2 v-else>Your Timeline</h2>
      <div v-for="post in statusFeed.unranked" class="outer-box">
        <Status :post="post" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Status from './Status.vue'

export default {
  name: 'Posts',
  components: { Status },

  computed: {
    ...mapGetters(['statusFeed', 'retrievingTweets'])
  },
  mounted() {
    this.getPosts()
  },

  methods: {
    ...mapActions(['getPosts']),
    async reload() {
      await this.getPosts()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/variables.scss';

.container {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0px auto;
}
.full-row {
  text-align: center;
  width: 100%;
}
h2 {
  text-align: center;
}

.outer-box {
  background: $white;
  border-radius: $border-radius;
  box-shadow: 0 1px 7px -2px rgba(0, 0, 0, 0.3);
  // padding: 20px;
  margin: 20px auto;
  @media screen and (min-width: 640px) {
    width: 30vw;
    min-width: 640px;
  }
  // @media screen and (max-width: 640px) {
  //   width: 85vw;
  // }
}
.btn {
  text-decoration: underline;
}
</style>
