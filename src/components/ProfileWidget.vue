<template>
  <div @click="showProfileSummary" class="user-row">
    <img
      v-if="user"
      :src="user.profile_image_url_https"
      class="status-profile-img"
    />
    <img v-else src="../static/1F31F.svg" />
    <div class="status-profile-text">
      <h4>{{ user.name }}</h4>
      <h5>@{{ user.screen_name }}</h5>
    </div>
    <b-modal
      :id="modalId"
      title="Profile Summary"
      @show="resetModal"
      centered
      hide-footer
    >
      <div class="username-row">
        <div>
          <img
            v-if="user"
            :src="user.profile_image_url_https"
            class="status-profile-img"
          />
          <img v-else src="../static/1F31F.svg" />
        </div>
        <div class="status-profile-text">
          <h3>{{ user.name }}</h3>
          <h4>@{{ user.screen_name }}</h4>
        </div>
      </div>
      <p>{{ user.description }}</p>
      <div class="tip-form-expand">
        <h4 v-if="tipSuccess">Tip Transaction Succeeded!</h4>
        <button
          class="btn tip-form-toggle"
          :class="{ disabled: tipForm }"
          @click="showTipForm"
        >
          <span v-if="tipSuccess">Tip Again</span>
          <span v-else>Directly Tip @{{ user.screen_name }}</span>
        </button>
      </div>
      <div v-if="tipForm" class="tip-form" :class="statusClasses">
        <h4 v-if="awaitingApi">Waiting on tip transaction</h4>
        <h4 v-if="tipErr">Tip Transaction Failed</h4>
        <div class="form-row">
          <div class="form-col">
            <div class="money-icon">💰</div>
            <input type="number" :value="tipTotal" class="tip-input" disabled />
          </div>
          <div class="form-arrows">
            <button
              class="btn btn-secondary"
              @click="increment(true)"
              :disabled="awaitingApi"
            >
              <img
                class="increment increase"
                src="../static/F0000.svg"
                alt="Increase"
              />
            </button>
            <button
              class="btn btn-secondary"
              @click="increment(false)"
              :disabled="awaitingApi"
            >
              <img
                class="increment decrease"
                src="../static/F0000.svg"
                alt="Decrease"
              />
            </button>
          </div>
        </div>
        <div class="form-row">
          <button
            class="btn btn-info tip-submit"
            @click="tipUser"
            :disabled="awaitingApi || !validTip"
          >
            Send Tip
          </button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import uuid from 'uuid'
import { mapActions } from 'vuex'

export default {
  name: 'ProfileWidget',
  // components: {
  //   NewPost
  // },
  props: {
    user: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      awaitingApi: false,
      modalId: 'modal-' + uuid(),
      tipErr: false,
      tipForm: false,
      tipSuccess: false,
      tipTotal: 5,
      validTip: true
    }
  },
  computed: {
    statusClasses() {
      return {
        awaitingApi: this.awaitingApi,
        tipError: this.tipErr
      }
    }
  },
  methods: {
    ...mapActions(['interactTransaction']),
    hideProfileActions() {
      // this.hover = false
    },
    increment(increase) {
      if (increase) {
        this.tipTotal++
        if (!this.validTip) this.validTip = true
        return
      }
      if (this.tipTotal > 0) this.tipTotal--
      if (this.tipTotal === 0) this.validTip = false
    },
    resetModal() {
      this.awaitingApi = false
      this.tipErr = false
      this.tipForm = false
      this.tipSuccess = false
      this.tipTotal = 5
      this.validTip = true
    },
    showProfileSummary() {
      this.$bvModal.show(this.modalId)
    },
    showTipForm() {
      this.tipForm = true
    },
    async tipUser() {
      this.awaitingApi = true
      var params = {
        recipient: this.user.screen_name,
        total: this.tipTotal
      }
      await this.interactTransaction(params).catch(error => {
        console.log(error)
        this.tipErr = true
      })
      this.awaitingApi = false
      if (this.tipErr) return
      this.tipSuccess = true
      this.tipForm = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/variables.scss';

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
.tipErr {
  background: lightcoral;
}
</style>
