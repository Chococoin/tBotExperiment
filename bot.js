'use strict'

require('dotenv').config()
const { Telegraf, Markup } = require('telegraf')
// const axios = require('axios')
const fs = require('fs')
const Web3 = require('web3')
const Units = require('ethereumjs-units')
const Mail = require('@sendgrid/mail')
const HDWalletProvider = require('@truffle/hdwallet-provider')

const mongoose = require('mongoose')
const User = require('./Schemas/User.js')

db()
  .then( res => console.log(res) )
  .catch( err => console.log(`Mongo database not connected ${err}`) )

async function db() {
    await mongoose.connect(process.env.MONGODB_URL || 'mondodb://127.0.0.1:27017/tBot')
}

const telegramApiKey = fs.readFileSync(".telegramApiKey").toString().trim()
// const PAYMENT_TOKEN = fs.readFileSync(".stripeApiKey").toString().trim() /* This version won't use stripe */
// const what3WordsApiKey = fs.readFileSync(".what3wordsApiKey").toString().trim() // TODO: Use it to tokenize trees.
const mnemonic = fs.readFileSync(".secret").toString().trim()
const infuraApi = fs.readFileSync(".infuraApiKey").toString().trim()

const abi = require('./build/contracts/SuperJuicyToken.json').abi // TODO: use new contract
const contractAddress = require('./build/contracts/SuperJuicyToken.json').networks[43113].address

const provider = new HDWalletProvider(mnemonic, `https://goerli.infura.io/v3/${infuraApi}`) // Use Avalanche
const sender = provider.addresses[0]
const web3 = new Web3(provider)


const contract = new web3.eth.Contract(abi, contractAddress, { gasPrice: '55000000000', from: sender })

// async function define name Token
let tokenName = (async () => await contract.methods.readName().call())()

const app = new Telegraf(telegramApiKey)

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
app.command('inizio', ({ reply }) => reply('Bevenuto! Io sono il Chocobot. Insieme faremo il migliore cioccolato del mondo. Con la mia tecnica e la tua creatività faremo la differenza.'))
app.command('aiuto', ({ reply }) => reply('Oltre guidarte al contenuto informativo della fabbrica, posso mostrarti con totale transparenza il uso dei fondi'))
app.command('tasks', ({ reply }) => reply('# TODO: Show a list of activities'))
// TODO create that list of ativities to promote the repo such follow us in twitter. 
app.command('come_partecipare', ({ reply }) => reply('Domandarmi "Come posso aiutare?" e ti darò una lista'))

// Show offer
app.hears(/^Come posso aiutare*/i, ({ replyWithMarkdown }) => replyWithMarkdown(
    `Vuoi sapere come dare una mano? Qui una lista di cose che puoi fare!
     ${products.reduce((acc, p) => { return (acc += `*${p.name}* - ${p.price} €\n`)
     }, '')} Come vuoi darci una mano?`, Markup.keyboard(products.map(p => p.name)).oneTime().resize().extra()
))

app.command('start', ({ reply }) => {
    reply('Here the beging of your adventure!')
})

app.command('debbug', (ctx) => {
    console.log(`${ctx.from.first_name} is investigating 🕵 the code from console log.`)
    console.log(ctx.update.message.entities)

})

app.command('aaa', (ctx) => {
    console.log("context", ctx.reply());
})


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
    console.log(`${ctx.from.first_name} (${ctx.from.username}) just payed ${ctx.message.successful_payment.total_amount / 100} €.`)
})

app.command('location', (ctx) => {
    console.log(ctx.update.message)
    // let lat = ctx.update.message.location.latitude
    // let lon = ctx.update.message.location.longitude
    // let lang = ctx.update.message.language_code
    // axios.get('https://api.what3words.com/v3/convert-to-3wa', {
    //     params: {
    //       coordinates: `${lat},${lon}`,
    //       language: lang,
    //       what3WordsApiKey
    //     }
    // })
    // .then(function (response) {
    //   console.log(response)
    // })
    // .catch(function (error) {
    //   console.log(error)
    // })
    // .finally(function () {
    //   console.log("Finish")
    // })
})

app.startPolling()
