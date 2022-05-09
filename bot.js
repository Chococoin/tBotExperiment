'use strict'

require('dotenv').config()
const { Telegraf, Markup, Scenes, session } = require('telegraf')
const axios = require('axios')
// const what3words = require("@what3words/api")
const fs = require('fs')
const Web3 = require('web3')
const Units = require('ethereumjs-units')
const Mail = require('@sendgrid/mail')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const events = require('events')
const bip39 = require('bip39')
const eventEmitter = new events.EventEmitter()

const userRegister = require('./Scenes/userRegister').userRegister
const tokenCreation = require('./Scenes/tokenCreation').tokenCreation
const gasBalance = require('./Scenes/gas').gasBalance
const gasLoad = require('./Scenes/gas').gasLoad

eventEmitter.on('token_creation', (...args) => console.log(...args))
// eventEmitter.on('user_creation', (...args) => console.log("USER CREATION",...args))

const mongoose = require('mongoose')
const User = require('./Schemas/User.js')

db()
  .then( () => console.log(`Mongo database connected`))
  .catch( err => console.log(`Mongo database not connected ${err}`) )

async function db() {
  await mongoose.connect(process.env.MONGODB_URL || 'mondodb://127.0.0.1:27017/tBot')
}

const telegramApiKey = fs.readFileSync(".telegramApiKey").toString().trim()
// const PAYMENT_TOKEN = fs.readFileSync(".stripeApiKey").toString().trim() /* This version won't use stripe */

const what3WordsApiKey = fs.readFileSync(".what3wordsApiKey").toString().trim() // TODO: Use it to tokenize trees.
// what3words.setOptions({ key: what3WordsApiKey })

const mnemonic = fs.readFileSync(".secret").toString().trim()
const infuraApi = fs.readFileSync(".infuraApiKey").toString().trim()

const abi = require('./build/contracts/SuperJuicyToken.json').abi // TODO: use new contract
const contractAddress = require('./build/contracts/SuperJuicyToken.json').networks[5].address

const provider = new HDWalletProvider(mnemonic, `https://goerli.infura.io/v3/${infuraApi}`) // Use Avalanche
const sender = provider.addresses[0]
const web3 = new Web3(provider)

const contract = new web3.eth.Contract(abi, contractAddress, { gasPrice: '2000000000', from: sender })

// async function define name Token
let tokenName = contract.methods.readName().call().then(console.log).catch(console.log)
let tokenSupply = contract.methods.readSupply().call().then(console.log).catch(console.log)

const app = new Telegraf(telegramApiKey)
const stage = new Scenes.Stage([ userRegister, tokenCreation, gasBalance, gasLoad ])
app.use(session())
app.use(stage.middleware())

app.telegram.setMyCommands(
  [
    {
      command     : '/start',
      description : '⭐ Start Bot ⭐'
    },
    {
      command     : '/help',
      description : '⭐ Help Bot ⭐'
    },
    {
      command     : '/buy',
      description : '⭐ Buy Bot ⭐'
    },
    {
      command     : '/create_new_user',
      description : 'Create a new User'
    },
    {
      command     : '/play_video',
      description : 'Play Pincay Video'
    },
  ]
);

const products = [
  {
    name: 'Seme di cacao',
    price: 10.00,
    description: 'Sperimenta con la trasparenza del progetto. Compra un seme di cacao pronto a essere piantato e guarda cosa succede.',
    photoUrl: 'https://i.ibb.co/B2XzrsP/Child-hand-holding-young-tree-in-egg-shell-for-prepare-plant-on-ground-save-world-concept.jpg'
  },
  {
    name: 'Albero di cacao',
    price: 25.00,
    description: 'Il soldi crece nel\'alberi. Adotta un albero di cacao, e diventa socio con il contadino',
    photoUrl: 'https://i.ibb.co/b5MBHjw/Screenshot-from-2020-07-13-07-23-50.png'
  },
  {
    name: 'ChocoCrypto',
    price: 5.00,
    description: 'Il cioccolato più bello e delizioso dal mondo.',
    photoUrl: 'https://i.ibb.co/0fWf8YL/Mockup-Choco-Crypto.jpg"'
  }
]

function createInvoice (product) {
  return {
    provider_token: PAYMENT_TOKEN,
    start_parameter: 'foo',
    title: product.name,
    description: product.description,
    currency: 'EUR',
    photo_url: product.photoUrl,
    is_flexible: false,
    need_shipping_address: false,
    prices: [{ label: product.name, amount: Math.trunc(product.price * 100) }],
    payload: {}
  }
}

// Start command

// TODO create that list of ativities to promote the repo such follow us in twitter. 
// app.command('come_partecipare', ({ reply }) => reply('Domandarmi "Come posso aiutare?" e ti darò una lista'))

// Show offer
// app.hears(/^Come posso aiutare*/i, ({ replyWithMarkdown }) => replyWithMarkdown(
//     `Vuoi sapere come dare una mano? Qui una lista di cose che puoi fare!
//      ${products.reduce((acc, p) => { return (acc += `*${p.name}* - ${p.price} €\n`)
//      }, '')} Come vuoi darci una mano?`, Markup.keyboard(products.map(p => p.name)).oneTime().resize().extra()
// ))

// app.command('start', (ctx) => {
//   ctx.reply(`${ctx.update.message.from.username} Here the beging of your adventure!\nclick (or type) /create_new_user to create a profile`)
// })

app.start((ctx) => {
  let userFirstName = ctx.message.from.first_name
  let message = ` Hello master ${userFirstName}, select action?`

  let options = Markup.inlineKeyboard([
    Markup.button.callback('User register', 'user_register'),
    Markup.button.callback('Token Creation', 'token_creation'),
    Markup.button.callback('Gas Balance', 'gas_balance'),
    Markup.button.callback('Gas Load', 'gas_load'),
  ])

  Markup.keyboard

  ctx.reply(message, options)
})

app.command('create_new_user', ctx => {
  const mnemonic2 = bip39.generateMnemonic()
  ctx.reply(`User Created! ${mnemonic2}`)
})

app.command('play_video', (ctx) => {
  ctx.replyWithVideo({ source: fs.createReadStream('sample_960x400_ocean_with_audio.mp4')})
})

app.command('help', (ctx) => {
  ctx.reply('Just a message for help')
})

// TODO
/* app.command('registrationStatus') */

// Order product
products.forEach(p => {
  app.hears(p.name, (ctx) => {
    console.log(`${ctx.from.first_name} is about to buy a ${p.name}.`)
    ctx.replyWithInvoice(createInvoice(p))
  })
})

// Handle payment callbacks
app.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))
app.on('successful_payment', (ctx) => {
  console.log(`${ctx.from.first_name} (${ctx.from.username}) just payed ${ ctx.message.successful_payment.total_amount / 100 } €.`)
})

app.on('location', (ctx) => {
  let lat = ctx.update.message.location.latitude
  let lon = ctx.update.message.location.longitude
  let lang = ctx.update.message.from.language_code
  ctx.reply('Enter the token name')
  axios.get('https://api.what3words.com/v3/convert-to-3wa', {
    params: {
      coordinates: `${lat},${lon}`,
      language: lang,
      key: what3WordsApiKey
    }
  })
  .then((response) => {
    eventEmitter.emit('successful_payment', response.data)
  })
  .catch(function (error) {
    console.log(error)
  })
  .finally(function () {
    console.log("Finish")
  })
})

// User Actions
app.action('user_register',  Scenes.Stage.enter('userRegister'))
app.action('token_creation', Scenes.Stage.enter('tokenCreation'))
app.action('gas_balance',    Scenes.Stage.enter('gasBalance'))
app.action('gas_load',       Scenes.Stage.enter('gasLoad'))

app.startPolling()
