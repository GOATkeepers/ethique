<template>
  <div class="new-post-bar">
    <div v-if="formDisplay" class="new-post-expand">
      <!-- <a @click="toggleInput(false)" class="toggle-input">Cancel New Status</a> -->
      <NewPost />
    </div>
    <div v-else class="new-post-placehold">
      <div>Post a New Status</div>
      <div class="input-div">
        <input @click="toggleInput(true)" class="input-trigger" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import NewPost from './NewPost.vue'
export default {
  name: 'NewPostBar',
  components: { NewPost },

  data() {
    return {
      formDisplay: false
    }
  },
  computed: {
    ...mapGetters(['user', 'newPostBar'])
  },
  methods: {
    ...mapActions(['postTweet', 'togglePostBar']),
    toggleInput() {
      this.formDisplay = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/variables.scss';

.container {
  margin: 20px auto;
}
.tweet-input {
  font-size: 24px;
  width: 100%;
}
.new-post-bar {
  background: $white;
  border-bottom: 1px solid rgb(228, 228, 228);
  // position: fixed;
  // top: 0px;
  text-align: center;
  width: 100%;
  .toggle-input {
    color: blue;
    text-decoration: underline;
    cursor: pointer;
  }
  h3 {
    margin: 0 0 10px;
    display: inline;
  }

  h4 {
    display: inline;
    margin: 0 0.5em;
    font-weight: normal;
    color: #555;
  }

  p {
    margin: 0.7em;
    text-align: left;
  }

  .form {
    display: flex;
    flex-direction: column;
  }

  .btn {
    margin: auto 0 auto auto;
  }

  .embedImg {
    width: 100%;
  }
}
.new-post-placehold {
  align-items: center;
  display: flex;
  justify-content: space-between;
  // padding: 20px;
  margin: 0px auto;
  // min-width: 640px;
  @media screen and (min-width: 640px) {
    width: 480px;
  }
  @media screen and (max-width: 640px) {
    flex-direction: column;
    font-size: 12px;
    width: 60vw;
  }
  div {
    white-space: nowrap;
  }
  .input-div {
    padding: 10px;
    width: 100%;
    @media screen and (max-width: 640px) {
      padding: 5px;
    }
  }
  .input-trigger {
    width: 100%;
    @media screen and (max-width: 640px) {
      padding: 1px;
    }
  }
}
.new-post-expand {
  @media screen and (min-width: 640px) {
    margin: 0 auto;
    min-width: 640px;
    width: 30vw;
  }
}
.submit-row {
  display: flex;
  flex-direction: flex-end;
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
