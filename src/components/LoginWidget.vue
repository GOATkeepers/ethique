<template>
  <div class="address">
    <button v-if="loginInProgress" class="btn logging" disabled>
      Logging You In. Just a sec...
    </button>
    <button v-else class="btn" @click="showLoginModal">
      Sign in / Register
    </button>
    <b-modal
      :id="modalId"
      title="Login / Register"
      @show="resetModal"
      centered
      ok-title="Submit"
      @ok="submitUser"
      :ref="modalId"
      :ok-disabled="awaitingApi"
    >
      <b-form :class="statusClasses">
        <b-form-group
          id="username"
          label="Username"
          label-for="username-input"
          description="Enter your username. This is like a Twitter-style handle"
        >
          <b-form-input
            id="username-input"
            v-model="username"
            :state="usernameState"
            placeholder="Enter username"
          />
        </b-form-group>
        <b-form-checkbox id="checkbox-1" v-model="admin" name="checkbox-1">
          Admin
        </b-form-checkbox>
        <b-form-group
          v-if="admin"
          id="password-group"
          label="Password"
          label-for="input-password"
          description="Password for admin users"
        >
          <input
            type="password"
            v-model="password"
            class="form-control"
            id="input-password"
            placeholder="Admin Password"
          />
        </b-form-group>
        <!-- <button @click="submitUser" class="btn btn-primary">Submit</button> -->
      </b-form>
      <p style="text-align: center">Powered by 🍃</p>
    </b-modal>
  </div>
</template>

<script>
import uuid from 'uuid'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'LoginWidget',
  data() {
    return {
      admin: false,
      awaitingApi: false,
      formStarted: false,
      loginErr: false,
      modalId: 'modal-' + uuid(),
      password: '',
      username: ''
    }
  },
  computed: {
    // These states come from vuex store (handleLogin):
    ...mapGetters(['loginInProgress', 'awaitingReceipt']),
    statusClasses() {
      return {
        awaitingApi: this.awaitingApi,
        loginErr: this.loginErr
      }
    },
    usernameState() {
      if (this.formStarted) {
        return this.username.length > 0 ? true : false
      }
      return null
    }
  },
  methods: {
    ...mapActions(['handleLogin']),
    resetModal() {
      this.awaitingApi = false
      this.loginErr = false
      this.admin = false
      this.formStarted = false
    },
    showLoginModal() {
      this.$bvModal.show(this.modalId)
    },
    async submitUser(event) {
      event.preventDefault()

      if (!this.username) {
        this.formStarted = true
        return
      }
      this.awaitingApi = true
      var user = {
        username: this.username,
        password: this.password
      }
      await this.handleLogin(user).catch(error => {
        console.log(error)
        this.loginErr = true
      })
      this.awaitingApi = false
      if (this.loginErr) return

      // loginInProgress is the state for the social server.
      // More user registration states will display after modal closes.
      if (!this.loginInProgress) {
        this.$bvModal.hide()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/variables.scss';
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

.user-row {
  align-items: center;
  border: 1px solid $lightgrey;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  margin: 0 -10px;
  padding: 0 10px;
}
.status-profile-img {
  border-radius: 50%;
}
.status-profile-text {
  display: flex;
  flex-direction: column;
}
h4 {
  margin: 0;
  display: inline;
  text-overflow: ellipsis;
}

.username-row {
  display: flex;
  align-items: center;
}
h5 {
  border-bottom: unset;
  color: #555;
  display: inline;
  font-weight: normal;
  font-size: unset;
  letter-spacing: unset;
  line-height: unset;
  margin: 0 0.5em;
  padding: 0;
  position: unset;
  text-transform: unset;
}
.modal-header {
  h5.modal-title {
    border-bottom: unset;
    font-weight: normal;
    font-size: unset;
    padding: 0;
  }
}
.tip-form-expand {
  display: flex;
  align-items: center;
  flex-direction: column;
  .tip-form-toggle {
    color: blue;
    text-decoration: underline;
  }
  .tip-form-toggle:hover {
    background: $color3;
    text-decoration: underline;
  }
  .tip-form-toggle.disabled {
    color: $darkgrey;
    text-decoration: underline;
  }
}
// .tip-form {
//   display: flex;
// }
.form-row {
  display: flex;
  justify-content: center;
  margin: 10px 0px;
  .tip-submit {
    flex: 0.5 0 auto;
  }
}
.form-col {
  display: flex;
  align-items: center;
  .money-icon {
    font-size: 2.5em;
  }
  .tip-input {
    font-size: 3em;
    text-align: right;
    width: 2.5em;
  }
}
.form-arrows {
  display: flex;
  flex-direction: column;
  .btn-secondary {
    background: none;
    margin: 5px;
    cursor: pointer;
  }
  .increment {
    @media screen and (min-width: 640px) {
      width: 30px;
    }
    @media screen and (max-width: 640px) {
      width: 60px;
    }
  }
  .increase {
    transform: rotate(90deg);
  }
  .decrease {
    transform: rotate(270deg);
  }
}
.awaitingApi {
  background: gray;
}
.loginErr {
  background: lightcoral;
}
</style>
