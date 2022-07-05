'use strict'

require('dotenv').config()
const { Telegraf, Markup, Scenes, session } = require('telegraf')
const axios = require('axios')
const fs = require('fs')
const Web3 = require('web3')
const Units = require('ethereumjs-units')
const Mail = require('@sendgrid/mail')
const bip39 = require('bip39')

const tokenCreation = require('./Scenes/tokenCreation')
const tokenTreeCreation = require('./Scenes/tokenTreeCreation')
const noteUser = require('./utils/noteUser').noteUser
const userRegister = require('./Scenes/userRegister').userRegister
const userVerification = require('./Scenes/userVerification').userVerification
const { gasLoad, gasBalance, gasExchange, gasCollector, gasInvest } = require('./Scenes/gas')
const { treasuryBalance } = require('./Scenes/treasury')
const dbCount = require('./utils/dbCount')
const createLink = require('./utils/createLink')

const mongoose = require('mongoose')
const User = require('./Schemas/User.js')

db()
  .then( () => console.log(`Mongo database connected`))
  .catch( err => console.log(`Mongo database not connected ${err}`) )

async function db() {
  await mongoose.connect(process.env.MONGODB_URL1 || 'mongodb://127.0.0.1:27017/tBot')
}

const telegramApiKey = fs.readFileSync(".telegramApiKey").toString().trim()

// const mnemonic = fs.readFileSync(".secret").toString().trim()
// const infuraApi = fs.readFileSync(".infuraApiKey").toString().trim()

// const abi = require('./build/contracts/SuperJuicyToken.json').abi // TODO: use new contract
// const contractAddress = require('./build/contracts/SuperJuicyToken.json').networks[5].address

// const provider = new HDWalletProvider(mnemonic, `https://goerli.infura.io/v3/${infuraApi}`) // Use Avalanche
// const sender = provider.addresses[0]
// const web3 = new Web3(provider)

// const contract = new web3.eth.Contract(abi, contractAddress, { gasPrice: '2000000000', from: sender })

// async function define name Token
// let tokenName = contract.methods.readName().call().then(console.log).catch(console.log)
// let tokenSupply = contract.methods.readSupply().call().then(console.log).catch(console.log)

const app = new Telegraf(telegramApiKey)
const stage = new Scenes.Stage(
  [ userRegister, 
    tokenCreation,
    tokenTreeCreation,
    gasBalance,
    gasLoad,
    gasExchange,
    userVerification,
    treasuryBalance
  ]
)
app.use(session())
app.use(stage.middleware())

app.telegram.setMyCommands(
  [
    {
      command     : '/start',
      description : 'Registration and verification'
    },
    {
      command     : '/account',
      description : 'Load gas and show gas balance'
    },
    {
      command     : '/treasury_balance',
      description : 'Treasury Balance'
    },
    {
      command     : '/create_a_character',
      description : 'Create a new character'
    },
    {
      command     : '/play_video',
      description : 'Play Pincay Video'
    },
    {
      command     : '/nft_creation',
      description : '⭐ Create an NFT ⭐'
    },
    {
      command     : '/nft_tree_creation',
      description : '🌳 Create an NFT-TREE 🌳'
    },
    {
      command     : '/help',
      description : 'Help Bot'
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

// TODO create that list of activities to promote the repo such follow us in twitter. 
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
  let message = `Hello ${userFirstName}, select an action?`
  let options = Markup.inlineKeyboard([
    Markup.button.callback('User register', 'user_register'),
    Markup.button.callback('User Verification', 'user_verification'),
  ])
  ctx.reply(message, options)
})

app.command('nft_creation', (ctx) => {
  let userFirstName = ctx.message.from.first_name
  let message = `Hello ${userFirstName}, ready to create an NFT?`
  let options = Markup.inlineKeyboard([
    Markup.button.callback('Create an NFT', 'token_creation'),
  ])
  ctx.reply(message, options)
})

app.command('nft_tree_creation', (ctx) => {
  let userFirstName = ctx.message.from.first_name
  let message = `Hello ${userFirstName}, ready to create an NFT-TREE 🌳?`
  let options = Markup.inlineKeyboard([
    Markup.button.callback('Create an NFT-TREE 🌳', 'token_tree_creation'),
  ])
  ctx.reply(message, options)
})

app.command('account', (ctx) => {
  let message = `Charge your profile with gas to pay transaction as NTF creation\nthen click the button bellow`
  let options = Markup.inlineKeyboard([
    Markup.button.callback('Gas Balance', 'gas_balance'),
    Markup.button.callback('Gas Load', 'gas_load'),
    Markup.button.callback('Gas Exchange', 'gas_exchange'),
  ])
  ctx.reply(message, options)
})

app.command('verification', (ctx) => {
  let message = `Look for you sms code and you email code\nthen click the button bellow`
  let options = Markup.inlineKeyboard([
    Markup.button.callback('User Verification', 'user_verification'),
  ])
  ctx.reply(message, options)
})

app.command('register', (ctx) => {
  let message = `Register using phone number and email address.`
  let options = Markup.inlineKeyboard([
    Markup.button.callback('User Registration', 'user_register'),
  ])
  ctx.reply(message, options)
})

app.command('asklink', async ctx => {
  let fromId = ctx.message.from.id
  let user = await User.find({ telegramID : fromId })
  console.log("USER:", user[0])
  // TODO: Control if the user has an old link. 
  if (user[0]) {
    let newLink = await createLink(ctx, 'direct')
    console.log("NEW_LINK:", newLink)
    if(newLink != 'broken_link') {
      user[0].link = newLink.invite_link ? newLink.invite_link : newLink
      user[0].save()
      ctx.reply(`${user[0].username} has a new link ${user[0].link}`)
    }
  } else {
    ctx.reply('A no registered user can\'t apply for a referrer link.')
  }
})

app.command('treasury_balance', async ctx => {
  let message = 'Check your Treasury total balance'
  let options = Markup.inlineKeyboard([
    Markup.button.callback('Treasury Personal Balance', 'treasury_personal_balance'),
  ])
  ctx.reply(message, options)
})

// TODO: Review commands
// app.command('create_new_user', (ctx) => {
//   const mnemonic2 = bip39.generateMnemonic()
//   ctx.reply(`User Created! ${mnemonic2}`)
// })

// app.command('play_video', (ctx) => {
//   ctx.replyWithVideo({ source: fs.createReadStream('sample_960x400_ocean_with_audio.mp4')})
// })

app.command('help', async (ctx) => {
  ctx.reply('A message for help')
  try {
    dbCount(ctx)
  } catch(error) {
    console.log(error)
  }
})

// TODO: Show to user status of registration
// app.command('status', (ctx) => {
  
// })
// TODO: Add sessions


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
app.on('new_chat_participant', (ctx) => ctx.reply(`👍 Welcome ${ctx.from.first_name} new_chat_participant`))
app.on('chat_join_request', async (ctx) => {
  console.log('CHAT_JOIN_REQUEST: ', ctx.update.chat_join_request)
  let referee = ctx.update.chat_join_request.from.id
  let referer = parseInt(ctx.update.chat_join_request.invite_link.name.split('-')[1])
  console.log("Referer", referer)
  console.log("Referee", referee)
  let user = await User.find({ telegramID: referer })
  console.log('User:', user[0])
  if ( user[0].telegramID === referer ) {
    console.log("To be approved...")
    try {
      await ctx.approveChatJoinRequest(referee)
      ctx.reply(`Welcome ${ctx.update.chat_join_request.from.first_name}`)
      console.log("APPROVED")
    } catch(e) {
      console.log("ERROR", e)
    }
    let link = await noteUser(ctx, 'indirect')
    ctx.reply(`Your link is ${link}`)
  }
})

// User Actions
app.action('user_register',      Scenes.Stage.enter('userRegister'))
app.action('user_verification',  Scenes.Stage.enter('userVerification'))
app.action('token_creation',     Scenes.Stage.enter('tokenCreation'))
app.action('token_tree_creation', Scenes.Stage.enter('tokenTreeCreation'))
app.action('gas_balance',        Scenes.Stage.enter('gasBalance'))
app.action('gas_load',           Scenes.Stage.enter('gasLoad'))
app.action('gas_collector',      Scenes.Stage.enter('gasCollector'))
app.action('gas_invest',         Scenes.Stage.enter('gasInvest'))
app.action('gas_exchange',       Scenes.Stage.enter('gasExchange'))
app.action('treasury_personal_balance', Scenes.Stage.enter('treasuryBalance'))

app.startPolling()
