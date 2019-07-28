// import Web3 from 'web3'
import axios from 'axios'

const getAbiDeployedAddress = abi => {
  if (!abi) return ''
  const networks = abi.networks
  return networks[Math.max(...Object.keys(networks))].address
}

export default {
  // Connect to a known web3 provider
  // https://gist.github.com/bitpshr/076b164843f0414077164fe7fe3278d9#file-provider-enable-js
  // async connect({ commit, state, dispatch }) {
  async connect({ commit, dispatch }) {
    if (process.env.OFFLINE) dispatch('handleOfflineLogin')
    // else dispatch('handleLogin')
    let web3Provider = true
    // if (process.env.RPC_PROVIDER.substring(0, 3) === 'wss') {
    //   web3Provider = new Web3.providers.WebsocketProvider(
    //     process.env.RPC_PROVIDER
    //   )
    // } else if (process.env.RPC_PROVIDER.substring(0, 4) === 'http') {
    //   web3Provider = new Web3.providers.HttpProvider(process.env.RPC_PROVIDER)
    // }

    // METAMASK WORKFLOW?
    // if (typeof window.web3 !== 'undefined') {
    //   web3Provider = window.web3.currentProvider
    //   try {
    //     // Not quite ready yet
    //     if (web3Provider.enable) await web3Provider.enable()
    //     // console.log('web3Provider', web3Provider)
    //     commit('SET_METAMASK', true)
    //   } catch (e) {
    //     console.log('e', e)
    //     commit('SET_METAMASK', false)
    //   }
    // } else if (!state.retried) {
    //   commit('SET_RETRY', true)
    //   setTimeout(() => {
    //     dispatch('connect')
    //   }, 1000)
    // }
    // if (state.retried && !web3Provider) {
    //   web3Provider = new Web3.providers.WebsocketProvider(
    //     process.env.RPC_PROVIDER
    //   )
    // }
    // END METAMASK WORKFLOW
    if (web3Provider) {
      // window.web3 = new Web3(web3Provider)
      commit('SET_CONNECTED', true)
      dispatch('setAccountInterval')
      // dispatch('mountContract')
    }
  },

  setAccountInterval({ dispatch }) {
    dispatch('checkAccount')
    setInterval(() => {
      dispatch('checkAccount')
    }, 60000)
  },

  checkAccount({ dispatch, state }) {
    // console.log('Contract methods debug:', state.Contract)
    if (state.account) {
      console.log('USING account ' + state.account)
      dispatch('getBalance')
    }
    // This fails on non-PC-Chrome and is noisy:
    // window.web3.eth.getAccounts((error, accounts) => {
    //   console.log('genesis accounts:', accounts)
    //   if (error) {
    //     console.error(error)
    //     console.log(commit, state)
    //   }
    //   if (state.account !== accounts[0]) {
    //     commit('USE_ACCOUNT', accounts[0])
    //   } else if (!accounts.length) {
    //     commit('USE_ACCOUNT', null)
    //   }
    // })
  },

  async mountContract({ dispatch, commit, state }) {
    if (state.connected) {
      commit('CLEAR_CONTRACT')
      await dispatch('getAbiArtifacts')
      const address = getAbiDeployedAddress(state.abi)
      // const contract = new window.web3.eth.Contract(state.abi.abi, address)
      const contract = { _address: address }
      commit('USE_CONTRACT', contract)
    } else {
      setTimeout(() => {
        dispatch('mountContract')
      }, 500)
    }
  },

  handleLogin({ commit, state }, user) {
    var canParams = {
      method: 'POST',
      url: process.env.SERVER_SOCIAL + '/login',
      data: {
        username: user.username,
        password: user.password
      }
    }
    commit('SET_LOGIN_PROGRESS', true)
    return new Promise(async (resolve, reject) => {
      // if (!state.provider) {
      //   console.log('Somethings wrong in actions handleLogin')
      //   reject(true)
      //   return
      // }
      var loginErr

      var loginResponse = await axios(canParams).catch(error => {
        console.log(error)
        loginErr = true
        reject(error)
      })
      if (loginErr) {
        console.log('error')
        commit('SET_LOGIN_PROGRESS', false)
        return
      }
      var result = loginResponse.data

      if (!result.user) {
        return
      }
      commit('SET_LOGIN_PROGRESS', false) // Remove "logging in" state.

      commit('SET_TOKEN', {
        token: 'abc',
        key: 'abc'
        // token: result.credential.accessToken,
        // key: result.credential.secret
      })
      commit('SET_USER', {
        username: result.additionalUserInfo.username,
        display: result.user.displayName,
        img: result.user.photoURL
      })

      // Send to login API for contract account mgmt
      commit('SET_REGISTERING_USER', true)
      console.log(state.user)
      var params = {
        method: 'POST',
        url: `${process.env.META_TRANSACTION_SERVER}/login`,
        // headers: {
        //   Authorization: auth.id_token
        // }
        data: { handle: state.user.username }
      }
      var response = await axios(params).catch(error => {
        console.log(error)
        loginErr = true
        reject(error)
      })
      if (loginErr) return
      console.log(response)
      await commit('USE_ACCOUNT', response.data.account)
      commit('UPDATE_BALANCE', response.data.balance)
      const contract = { _address: response.data.contract }
      commit('USE_CONTRACT', contract)
      commit('SET_REGISTERING_USER', false)
      resolve(true)
    })
  },
  handleOfflineLogin({ commit, state }) {
    return new Promise(async (resolve, reject) => {
      var loginErr
      commit('SET_TOKEN', {
        token: 'abc',
        key: '123'
      })
      commit('SET_USER', {
        username: 'testUser',
        display: 'testUser',
        img: ''
      })

      // Send to login API for contract account mgmt
      commit('SET_REGISTERING_USER', true)
      console.log(state.user)
      var params = {
        method: 'POST',
        url: `${process.env.SERVER_SOCIAL}/login`,
        // headers: {
        //   Authorization: auth.id_token
        // }
        data: { handle: state.user.username }
      }
      var response = await axios(params).catch(error => {
        console.log(error)
        loginErr = true
        reject(error)
      })
      if (loginErr) return

      console.log(response)
      await commit('USE_ACCOUNT', response.data.account)
      const contract = { _address: response.data.contract }
      commit('USE_CONTRACT', contract)
    })
  }
}
