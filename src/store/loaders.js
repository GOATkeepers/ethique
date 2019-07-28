export default {
  getters: {
    loginInProgress: state => state.loginInProgress,
    awaitingApi: state => state.awaitingApi,
    awaitingReceipt: state => state.awaitingReceipt,
    registeringUser: state => state.registeringUser,
    retrievingTweets: state => state.retrievingTweets
  },
  mutations: {
    SET_AWAITING_API(state, inProgress) {
      state.awaitingApi = inProgress
    },
    SET_AWAITING_RECEIPT(state, inProgress) {
      state.awaitingReceipt = inProgress
    },
    SET_LOGIN_PROGRESS(state, inProgress) {
      state.loginInProgress = inProgress
    },
    SET_REGISTERING_USER(state, inProgress) {
      state.registeringUser = inProgress
    },
    SET_RETRIEVING_TWEETS(state, inProgress) {
      state.retrievingTweets = inProgress
    }
  },
  state: {
    awaitingApi: false,
    awaitingReceipt: false,
    loginInProgress: false,
    registeringUser: false,
    retrievingTweets: false
  },
  actions: {}
}
