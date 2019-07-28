var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

const META_TRANSACTION_SERVER = JSON.stringify(process.env.META_TRANSACTION_SERVER)
const SERVER_SOCIAL = JSON.stringify(process.env.SERVER_SOCIAL)

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  META_TRANSACTION_SERVER: META_TRANSACTION_SERVER,
  SERVER_SOCIAL: SERVER_SOCIAL,
  // OFFLINE: true,
})
