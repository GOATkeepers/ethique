/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider')
// const PrivateKeyProvider = require('truffle-privatekey-provider')

// NOTE: Only required if not using localhost
const mnemonic = process.env.ETH_MNEMONIC || ''
const apiKey = process.env.INFURA_API_KEY || ''
// const privateKey = process.env.ETH_PK || ''

module.exports = {
  // REF http://truffleframework.com/docs/advanced/configuration
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    schoolboyq: {
      // type="quorum",
      provider: new HDWalletProvider(mnemonic, "http://142.93.22.253:22000"),
      gasPrice: 0,
      network_id: '*' // Match any network id
    },
    azorius: {
      // provider: new HDWalletProvider(mnemonic, 'https://spectronode01.blockchain.azure.com:3200/Pe_pwBVf2CYmPK8vpvjvBGWP'),
      host: 'https://spectronode01.blockchain.azure.com', //:3200/Pe_pwBVf2CYmPK8vpvjvBGWP',
      port: 3200,
      from: '0x0810A0E7A850d0eC9a3A1738D35613F52B9399b0',
      gasPrice: 0,
      network_id: '*' // Match any network id
    },
    skale: {
      // provider: new PrivateKeyProvider(privateKey, "http://104.248.242.64:8003"),
      provider: new HDWalletProvider(mnemonic, "http://104.248.242.64:8003"),
      gasPrice: 0,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://rinkeby.infura.io/v3/${apiKey}`
        ),
      network_id: 4,
      gas: 4500000,
      gasPrice: 50000000000,
      value: 0
    },
    ropsten: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://ropsten.infura.io/v3/${apiKey}`
        ),
      network_id: 3
    }
  }
}
