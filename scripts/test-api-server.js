const fs = require('fs')
var express = require('express')
var cors = require('cors')
console.log(cors())

const PORT = 3001
// TODO store in env var

var app = express()
app.use(cors())
var wallet = 500

app.post('/v1/login', async (req, res) => {
  res.setHeader('Allow-Origin', '*')
  console.log(req)
  console.log(res)
  var loginData = {
    account: 'iAmReal',
    contract: '0xabc'
  }
  res.status(200).send(loginData)
})
app.get('/v1/engage', (req, res) => {
  console.log(req)
})
app.post('/v1/proxy', (req, res) => {
  res.status(200).send(wallet);
})

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})