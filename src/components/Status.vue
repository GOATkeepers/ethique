<template>
  <div class="box" :class="boxClasses">
    <h2 v-if="awaitingTransaction">Your interaction is being processed</h2>
    <h2 v-if="awaitingTransaction && awaitingApi">Waiting on Twitter API</h2>
    <h2 v-if="post.spectroRankedNew">
      You successfully interacted with this post
    </h2>

    <ProfileWidget :user="post.user" />

    <div v-if="post.retweeted_status">
      <p>Retweeted:</p>
      <Status :post="post.retweeted_status" />
    </div>
    <div v-else>
      <div class="max-width">
        <div v-if="post.in_reply_to_status_id">
          <h2 v-if="gettingPost">Retrieving comment history</h2>
          Replied to @{{ post.in_reply_to_screen_name }}
          <button
            v-if="!post.repliedToObj"
            @click="getParent"
            :disabled="gettingPost"
          >
            Get Previous Post
          </button>
        </div>
        <p v-if="post.quoted_status">
          Quoted @{{ post.quoted_status.user.screen_name }}
        </p>
        <span class="tweet-content">
          {{ post.updatedText || post.full_text || post.text }}
        </span>
        <img v-if="post.embedImg" :src="post.embedImg" class="embed-img" />
      </div>
      <div class="engage">
        <button v-if="post.favorited" class="btn engage-btn" disabled>
          <img src="../static/1F31F.svg" />
          <span>Liked</span>
        </button>
        <button v-else class="btn engage-btn" @click="interact(likeStatus)">
          <img src="../static/2B50.svg" />
          <span>Like</span>
        </button>
        <button v-if="post.retweeted" class="btn engage-btn" disabled>
          <img src="../static/267Bc.svg" />
          <span>Retweeted</span>
        </button>
        <button v-else class="btn engage-btn" @click="interact(retweet)">
          <img src="../static/267B.svg" />
          <span>Retweet</span>
        </button>
        <button class="btn engage-btn" @click="toggleComment">
          <img src="../static/F000F.svg" />
          <span v-if="formDisplay">Cancel</span>
          <span v-else>Reply</span>
        </button>
      </div>
    </div>
    <div v-if="formDisplay">
      <NewPost
        :post-id="post.id_str"
        :reply-to="post.user.screen_name"
        :feed="post.spectroFeed"
      />
    </div>
    <div v-if="post.in_reply_to_status_id && post.repliedToObj">
      <Status :post="post.repliedToObj" />
    </div>
    <div v-if="post.quoted_status">
      <p>Quote:</p>
      <Status :post="post.quoted_status" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import NewPost from './NewPost.vue'
import ProfileWidget from './ProfileWidget.vue'

export default {
  name: 'Status',
  components: {
    NewPost,
    ProfileWidget
  },
  props: {
    post: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      awaitingTransaction: false,
      formDisplay: false,
      gettingPost: false
    }
  },
  computed: {
    ...mapGetters(['awaitingApi']),
    repliedToStatus() {
      return this.post.repliedToObj
    },
    boxClasses() {
      return {
        parentBox: !this.post.spectroChildDisplay,
        updatingItem: this.awaitingTransaction || this.gettingPost,
        updatedItem: this.post.spectroRankedNew
      }
    }
  },
  methods: {
    ...mapActions(['likeStatus', 'retweet', 'getPost']),
    async getParent() {
      this.gettingPost = true
      await this.getPost(this.post)
      this.gettingPost = false
    },
    async interact(action) {
      this.awaitingTransaction = true
      await action(this.post)
      this.awaitingTransaction = false
    },
    toggleComment() {
      this.formDisplay = !this.formDisplay
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/variables.scss';

h2 {
  text-align: center;
}

.btn {
  background: $color2;
  border-radius: $border-radius;
  color: $white;
  min-width: 120px;
}

.box {
  border-radius: $border-radius;

  h3 {
    margin: 0;
    display: inline;
    text-overflow: ellipsis;
  }

  h4 {
    display: inline;
    margin: 0 0.5em;
    font-weight: normal;
    color: #555;
  }
  .status-profile-img {
    border-radius: 50%;
  }
  .status-profile-text {
    display: flex;
    flex-direction: column;
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

  .embed-img {
    width: 100%;
  }
  .max-width {
    width: 100%;
  }
}
.parentBox {
  @media screen and (max-width: 640px) {
    padding: 15px;
  }
  padding: 20px;
}
.updatingItem {
  background: $gray;
}
.updatedItem {
  background: lightblue;
}
.tweet-content {
  margin: 0px !important;
  width: 100%;
  word-break: break-word;
}
.user-row {
  align-items: center;
  display: flex;
}
.hideForm {
  display: none;
}

.engage {
  align-items: center;
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  @media screen and (max-width: 640px) {
    justify-content: space-between;
  }
}
.engage-btn {
  align-items: center;
  background: unset;
  border: 1px solid $gray;
  color: $black;
  display: flex;
  justify-content: space-around;
  margin: 0 5px;
  min-width: 100px;
  padding: 4px;
  @media screen and (max-width: 640px) {
    font-size: 14px;
    margin: 0;
  }

  img {
    width: 28px;
  }
}
</style>
