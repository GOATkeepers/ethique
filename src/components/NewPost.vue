<template>
  <div class="new-post-box">
    <h4 v-if="replyTo">Reply</h4>
    <h2 v-if="awaitingPost">Submitting your content. Please wait</h2>
    <textarea
      v-model="statusText"
      class="tweet-input"
      rows="4"
      :disabled="awaitingPost"
    />
    <div class="submit-row">
      <a @click="cancelPost" class="a-cancel">Cancel</a>
      <button @click="submitTweet" class="btn" :disabled="awaitingPost">
        Submit
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'NewPost',
  props: {
    postId: {
      type: String,
      default() {
        return ''
      }
    },
    feed: {
      type: String,
      default() {
        return ''
      }
    },
    replyTo: {
      type: String,
      default() {
        return ''
      }
    }
  },

  data() {
    return {
      textareaExpand: false,
      statusText: '',
      awaitingPost: false
    }
  },
  computed: {
    ...mapGetters(['user']),
    postRender() {
      return this.awaitingPost
    }
  },

  mounted() {
    if (this.replyTo && this.replyTo !== this.user.username) {
      this.statusText = `@${this.replyTo} `
    }
  },

  methods: {
    ...mapActions(['postTweet', 'togglePostBar']),
    cancelPost() {
      this.$parent.formDisplay = false
    },
    async submitTweet() {
      if (this.statusText.length === 0 || this.statusText.length > 280) {
        alert('error')
        return
      }
      this.awaitingPost = true
      this.$parent.awaitingTransaction = true
      var status = {
        statusText: this.statusText
      }
      if (this.postId) {
        status.replyId = this.postId
        status.recipient = this.replyTo
        status.feed = this.feed
        // status.statusObj = this.$parent.post
      }
      console.log(status)
      await this.postTweet(status)
      this.statusText = ''
      this.awaitingPost = false
      this.$parent.awaitingTransaction = false
      this.$parent.spectroRankedNew = true
      this.cancelPost()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/variables.scss';

.new-post-box {
  margin: 5px auto;
  // border-radius: $border-radius;
  // box-shadow: 0 1px 7px -2px rgba(0, 0, 0, 0.3);

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

  input {
    margin: 0 0 10px;
  }

  .btn {
    margin: auto 0 auto auto;
  }

  .embedImg {
    width: 100%;
  }
}
.tweet-input {
  border-radius: $border-radius;
  font-size: 24px;

  width: 100%;
  @media screen and (max-width: 640px) {
    border: 2px solid darkgray;
    width: 95%;
  }
}
.tweet-input:disabled {
  background: $gray;
  color: darkgray;
}
.submit-row {
  align-items: center;
  display: flex;
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
.a-cancel {
  color: darkgray;
  cursor: pointer;
  text-decoration: underline;
}
</style>
