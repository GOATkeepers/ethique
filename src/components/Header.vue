<template>
  <div class="header">
    <div class="header-main">
      <div class="logo">
        <h3>🥐<span> Éthique</span></h3>
      </div>
      <div v-if="userName" class="address">
        <div class="user-left">
          <div class="username">{{ userName }}</div>
          <div class="balance">
            <div :class="pendingBalance">
              💰{{ balance || balance === 0 ? balance : '...' }}
            </div>
          </div>
        </div>
        <div class="user-right">
          <img v-if="userName" :src="user.img" />
        </div>
      </div>
      <LoginWidget v-else />
    </div>
    <NewPostBar v-if="userName" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NewPostBar from './NewPostBar'
import LoginWidget from './LoginWidget'

export default {
  name: 'Header',
  components: {
    LoginWidget,
    NewPostBar
  },

  computed: {
    ...mapGetters([
      'user',
      'account',
      'balance',
      'loginInProgress',
      'awaitingReceipt'
    ]),
    userName() {
      if (this.user) {
        return this.user.username
      }
      return null
    },
    acct() {
      return this.metamask && this.account ? this.account : null
    },
    pendingBalance() {
      return {
        pendingBalance: this.registeringUser || this.awaitingReceipt
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/variables.scss';
.header {
  position: -webkit-sticky;
  position: sticky;
  top: 0px;
}
.header-main {
  display: flex;
  background: $white;
  border-bottom: 1px solid rgb(228, 228, 228);
  justify-content: space-between;
  width: 100%;

  .logo h3 {
    span {
      @media screen and (max-width: 640px) {
        font-size: 0.5em;
      }
    }
    white-space: nowrap;
    @media screen and (min-width: 640px) {
      font-size: 2em;
      margin: 0.4em;
    }
  }

  .logo,
  .address {
    align-items: center;
    display: flex;
    @media screen and (max-width: 640px) {
      margin: 0 10px;
    }
    @media screen and (min-width: 640px) {
      margin: 0 20px;
    }
  }

  .btn {
    background: $white;
    // border-radius: $border-radius;
    color: $black;
    height: 100%;
    // min-width: 120px;
  }
  .btn:hover {
    border-bottom: 2px solid rgb(118, 118, 118);
  }
  // .btn.logging {
  //   TODO COOL COLOR GRADIENT ANIMATION WHILE WAITING!!!
  // }

  .address {
    max-width: 70%;
    @media screen and (min-width: 640px) {
      font-size: 1.2em;
    }
  }
  .user-left {
    align-items: center;
    display: flex;
    flex-direction: row;
    margin-right: 5px;
    overflow: hidden;
    @media screen and (min-width: 640px) {
      margin-right: 15px;
      flex-direction: column;
    }
  }
  .username {
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    // @media screen and (max-width: 640px) {
    //   font-size: 1.5em;
    // }
  }
  .balance {
    display: flex;
    justify-content: flex-end;
    white-space: nowrap;
    @media screen and (min-width: 640px) {
      width: 100%;
    }
    @media screen and (max-width: 640px) {
      font-size: 32px;
    }
  }
  .user-right {
    align-items: center;
    display: flex;
    img {
      border-radius: 50%;
      @media screen and (min-width: 640px) {
        width: 50px;
      }
      // @media screen and (max-width: 640px) {
      //   width: 60px;
      // }
    }
  }
  .pendingBalance {
    background: darkgray;
    color: $gray;
  }
}
</style>
