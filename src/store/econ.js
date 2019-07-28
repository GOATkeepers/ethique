import axios from 'axios'

export default {
  getters: {
    balance: state => state.balance
  },
  mutations: {
    UPDATE_BALANCE: setBalance
  },
  state: {
    balance: null
  },
  actions: {
    balanceList: balanceList,
    getBalance: getBalance,
    sendTransaction: sendTransaction,
    interactTransaction: interactTransaction
  }
}

// function getBalance({ commit, dispatch, rootState }) {
function getBalance({ commit, rootState }) {
  // var transaction = rootState.Contract.methods.balanceOf(rootState.account)

  var params = {
    method: 'POST',
    url: `${process.env.META_TRANSACTION_SERVER}/proxy`,
    // headers: {
    //   Authorization: rootState.idToken
    // },
    data: {
      method: 'balanceOf',
      params: [rootState.account],
      clientId: rootState.user.username
    }
  }
  return new Promise((resolve, reject) => {
    axios(params)
      .then(response => {
        console.log(response)
        console.log('Most recent balance: ', Number(response.data))
        commit('UPDATE_BALANCE', response.data)
        resolve(Number(response.data))
      })
      .catch(e => {
        console.log(e)
        reject(e)
      })
  })
}

function setBalance(state, newBalance) {
  state.balance = Number(newBalance)
}

function sendTransaction({ rootState }, transaction) {
  var params = {
    method: 'POST',
    url: `${process.env.META_TRANSACTION_SERVER}/transact`,
    headers: {
      Authorization: rootState.idToken
    },
    data: {
      // Generic transaction:
      clientId: rootState.user.username,
      method: transaction.method,
      params: transaction.params,

      // interact / transfer fields:
      amount: transaction.amount,
      recipient: transaction.recipient
    }
  }
  console.log(params)
  return axios(params)
}
/**
 * If New Post, or commenting on own thread, tip the contract.
 * If commenting, tip recipient.
 * @param {*} param0 vuex params
 * @param {*} recipient if null, then this is a new post or reply to one's own thread. Tip contract.
 */
async function interactTransaction({ dispatch }, { recipient, total }) {
  var methodBuild = {
    amount: total,
    recipient: recipient
  }
  var transactionErr

  return new Promise(async (resolve, reject) => {
    var transResult = await dispatch('sendTransaction', methodBuild).catch(
      error => {
        console.log(error)
        transactionErr = true
        reject(error)
      }
    )
    if (transactionErr) return
    console.log(transResult)
    dispatch('getBalance')
    resolve(transResult)
  })
}

async function balanceList({ rootState }) {
  while (!rootState.accessToken.token) {
    console.log('waiting for account login')
    await waitFor()
  }
  return new Promise(async (resolve, reject) => {
    var balances = []
    var anErr
    var registeredUsers = await rootState.Contract.methods
      .getRegisteredUsers()
      .call({ from: rootState.account })
      .catch(error => {
        registeredUsers = []
        console.log(error)
        anErr = true
        reject(error)
      })
    if (anErr) return
    console.log('contract getRegisteredUsers() result: ', registeredUsers)
    for (var i = 0; i < registeredUsers.length; i++) {
      var balance = await rootState.Contract.methods
        .balanceOf(registeredUsers[i])
        .call({ from: rootState.account })
        .catch(error => {
          console.log(error)
          anErr = true
          reject(error)
        })
      balances.push({
        account: registeredUsers[i],
        balance: balance
      })
    }
    console.log(balances)
    resolve(balances)
  })
}

function waitFor() {
  return new Promise(resolve => setTimeout(resolve, 200))
}
