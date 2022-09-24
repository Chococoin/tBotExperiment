const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')
const QRCode = require('qrcode')
const imageDataURI = require('image-data-uri')
const exchangeCreateOrder = require('../utils/exchange').exchangeCreateOrder
const exchangeInfo = require('../utils/exchange').exchangeInfo

const { Contract, web3 } = require('../utils/web4u.js')

const fs = require('fs')
const _symbol = process.env.KRAKEN_PAIR
/*=================================UTILS===================================*/
async function initializedIt( UserPrvKey ){
  require('dotenv').config()
  let prvKey
  if(UserPrvKey) {
    prvKey = UserPrvKey
  } else {
    prvKey = process.env.MNEMONIC
  }
  let abi = require('../build/contracts/Treasury.json').abi
  // let contractAddress = require('../build/contracts/Treasury.json').networks[80001].address
  const netWorks = require('../build/contracts/Treasury.json').networks
  const lastNetwork = Object.keys(netWorks)[Object.keys(netWorks).length-1]
  const contractAddress = require('../build/contracts/Treasury.json').networks[lastNetwork].address
  // let InfuraUrl = `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_APIKEY}`
  let HDWalletProvider = require('@truffle/hdwallet-provider')
  let _Web3 = require('web3')
  // let _provider = new HDWalletProvider(prvKey, InfuraUrl)
  let _provider = new HDWalletProvider(prvKey, 'http://localhost:8545')
  let _web3 = new _Web3(_provider)
  let _sender = _provider.addresses[0]
  let _contract = new _web3.eth.Contract(abi, contractAddress, { from: _sender })
  return { _web3 , _contract, _sender }
}
/*==========================CLOSE UTILS===================================*/
// sendOutsourcing(rawBalance, user.address, user.passphrase[0])
async function sendOutsourcing ( balance, address ) {
  const { _web3, _contract, _sender } = await initializedIt(address)
  let priceTx = await _contract.methods.outSourcing().estimateGas({ from: _sender, value: balance })
  let _gasPrice = await _web3.eth.getGasPrice()
  let amount = (balance - ( priceTx * _gasPrice * 1.75 ))
  try {
    let tx = await _contract.methods.outSourcing().send({ from: _sender, value: amount })
    console.log(tx)
    return amount
  } catch(err) {
    console.log(err)
  }
}

async function setBestPrice(data, amount) {
  let req
  let firstBid = data.book.bids[0][0]
  let firstAsks = data.book.asks[0][0]
  let secondBid = data.book.bids[1][0]
  let thirdBid = data.book.bids[2][0]
  let avgBidPrice = (firstBid + secondBid + thirdBid) / 3
  let bestPrice = (avgBidPrice + avgBidPrice * 0.020).toFixed(5) * 10**18
  firstAsks = firstAsks.toFixed(5) * 10**18
  console.log("You must set best price!", bestPrice, firstAsks, firstBid)
  firstAsks = firstAsks.toString()
  console.log("First Asks type!", typeof firstAsks)
  console.log("First Asks!", firstAsks)
  // let userEuroVolume =  avgBidPrice * amount
  // let avgVolume = (firstBidWall + secondBidWall + thirdBidWall) / 3
  if( bestPrice < firstAsks) {
    const { _contract, _sender } = await initializedIt()
    try{
      req = await _contract.methods.setTreasuryEuroPrice(firstAsks).send({ from: _sender })
      console.log("From setBestPrice", req)
    } catch(error) {
      console.log("Error setting treasury price", error)
    }
  } else {
    console.log("Ufaaa!")
  }
  return bestPrice
}

/*  ===== GASBALANCE ===== */

/* Implement balance gas. */ 
const gasBalance1 = async (ctx) => {
  let user, _gasBalance
  try {
    user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
  } catch (error) {
    console.log(error)
    ctx.reply("User not register. Click /start to register.")
    return ctx.scene.leave()
  }

  if ( !user ) {
    ctx.reply("User not register. Click /start to register.")
    return ctx.scene.leave()
  } else {
    try {
      _gasBalance = await web3.eth.getBalance(user.address) / 10**18
    } catch ( error ) {
      console.log(error)
      ctx.reply(`Error: ${error}`)
    }
  }
  if ( _gasBalance >= 0.000001 ) {
    ctx.reply(`${ user.username || 'Dear customer' }, you have ${ _gasBalance.toFixed(5) } as balance of gas in your account`)
  } else if (_gasBalance === 0){
    ctx.reply(`${ user.username || 'Dear customer' }, you don't have anything as balance of gas in your account`)
  } else {
    ctx.reply(`${ user.username || 'Dear customer' }, you have only dust as balance of gas in your account`)
  }
  return ctx.scene.leave()
}

const gasBalance = new Scenes.WizardScene('gasBalance',
  (ctx) => gasBalance1(ctx)
)

/**  ===== GASLOAD ===== */
const gasLoad1 = async (ctx) => {
  let _gasBalance, qr
  let user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
  if ( user && user.verifiedPhone && user.verifiedEmail ) {
    try {
      _gasBalance = await web3.eth.getBalance(user.address) / 10**18
    } catch ( error ) {
      console.log(error)
      ctx.reply(`Error: ${ error }`)
      return ctx.scene.leave()
    }
    QRCode.toDataURL(`${ user.address }`, { errorCorrectionLevel: 'H' }, async function (err, url) {
      if (err) {
      ctx.reply("Some trouble is happening with QRcode.")
        console.log("Some with QRcode.")
      } else {
        let img = await imageDataURI.outputFile(url, 'decoded-image.png')
        qr = await ctx.replyWithPhoto({ source: fs.createReadStream(img) })
        ctx.reply(`Charge your profile with cryptos using metamask.\nCurrently your balance is ${ _gasBalance.toFixed(5) }.\nWaiting for a payment click /cancel to stop process`)
      }
    })
  }

  let secs = 0
  // DONE: Start payment listener! 
  let interval = setInterval( async () => {
    if ( secs >= 60 ) {
      clearInterval(interval)
      ctx.reply("You have overmatch 60 seconds to make the deposit.\nTry again")
      ctx.telegram.deleteMessage(ctx.chat.id, qr.message_id)
    }
    let newGasBalance  = await web3.eth.getBalance(user.address) / 10**18
    if ( newGasBalance > _gasBalance ) {
      ctx.telegram.deleteMessage(ctx.chat.id, qr.message_id)
      ctx.reply(`You have received ${ (newGasBalance - _gasBalance).toFixed(5) } of gas.\nYou now can exchange gas for treasury.`)
      clearInterval(interval)
    }
    secs++
  }, 1000)
  return ctx.scene.leave()
}

const gasLoad = new Scenes.WizardScene('gasLoad',
  (ctx) => gasLoad1(ctx)
)

/**  ===== GASEXCHANGE ===== */

let waitingConfirm, gasUserBalance, rawBalance, user, bestPrice
const gasExchange1 = async (ctx) => {
  let res = await ctx.reply("Please wait some seconds while I arrange the exchange process.")
  user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
  // TODO: Set price in SmartContract
  let data = await exchangeInfo(_symbol)
  gasPriceInSc = await Contract.treasuryCoinPrice().call()
  gasPriceInSc = gasPriceInSc / 10**18
  console.log("Book & gasPriceInSc:")
  console.table([{ "Asks": [data.book.asks[0][0], data.book.asks[0][1]], "Bids": [data.book.bids[0][0], data.book.bids[0][1]]}, { "Asks": [data.book.asks[1][0], data.book.asks[1][1]], "Bids": [data.book.bids[1][0], data.book.bids[1][1]]} ])
  let currentExchangePrice = data.book.asks[0][0]
  let currentExchangeVolume = currentExchangePrice * data.book.asks[0][1]
  try {
    gasUserBalance = await web3.eth.getBalance(user.address)
    rawBalance = gasUserBalance
    gasUserBalance = rawBalance / 10**18
  } catch(err) {
    console.log(err)
    return ctx.scenes.leave()
  }
  let userVolumeEuroReq = (gasUserBalance * currentExchangePrice).toFixed(5) / 1
  // Checks and corrects if price in Smartcontract is lower than exchange
  console.table([{"Exchange Current Price": currentExchangePrice, 
                  "Current Price in Sc": gasPriceInSc,
                  "Exchange Volume €": currentExchangeVolume,
                  "User Volume € Request": userVolumeEuroReq }])
  if ( currentExchangePrice != gasPriceInSc && currentExchangeVolume > userVolumeEuroReq ) {
    console.log("Setting new gas price in smart contract.")
    bestPrice = await setBestPrice(data, rawBalance)
    console.log("Set best price!!!!", bestPrice)
  } else {
    //If there not enough volume in the first offer of the ledger book
    ctx.reply("Something wrong was happened.")
  }
  await ctx.telegram.deleteMessage(ctx.chat.id, res.message_id)
  // console.log(gasUserBalance * data.book.asks[0][0])
  if(gasUserBalance * data.book.asks[0][0] >= 1) {
    ctx.reply(`${ user.username }, Do you have ${ gasUserBalance.toFixed(5)} of gas to exchange for treasury.\n
    Right now the gas price is €${ currentExchangePrice } at kraken.\n
    You would receive ${ (gasUserBalance * currentExchangePrice).toFixed(5) } of Treasury.\n
    Do you want to exchange?\n
    /yes   or   /no            /cancel`)
  } else {
    ctx.reply("Sorry you haven't enough gas to exchange treasury.")
    return ctx.scene.leave()
  }
  return ctx.wizard.next()
}

const gasExchange2 = new Composer()

gasExchange2.command('yes', async (ctx) => {
  let res = await ctx.reply('Exchanging gas for treasury')
  let amount, data
  let treasuryUserBalance = await Contract.treasuryBalanceOf(user.address).call()
  let gasUserBalance = await web3.eth.getBalance(user.address)
  treasuryUserBalance = await web3.utils.fromWei(treasuryUserBalance) / 1
  console.table([{"User Gas Balance": gasUserBalance , "Treasury Balance": treasuryUserBalance}])
  if ( gasUserBalance > 0 ) {
    try {
      amount = await sendOutsourcing(rawBalance, user.passphrase[0])
      console.log("From outSourcing", amount)
      data = await exchangeCreateOrder(amount, bestPrice, user.telegramID)
      treasuryUserBalance = await web3.utils.fromWei(treasuryUserBalance) / 1
    } catch (error) {
      console.log(error)
      return ctx.scene.leave()
    }
  } else {
    ctx.reply("New feature coming soon.")
    return ctx.scene.leave()
  }
  ctx.telegram.deleteMessage(ctx.chat.id, res.message_id)
  ctx.reply(`You have exchanged your gas for Treasury Point.\n\
             Right now you have ${ treasuryUserBalance.toFixed(5) } of treasury Balance `)
  if ( treasuryUserBalance == 0 ) ctx.reply("Are you trying to fool me 👹?.")
  return ctx.scene.leave()
})

gasExchange2.command('no', async (ctx) => {
  // TODO: Give address to load with Polygon coins.
  ctx.reply(`You have a balance of gas ${ balance }`)
  return ctx.scene.leave()
})

gasExchange2.command('cancel', (ctx) => {
  ctx.reply('Bye bye exchange!')
  return ctx.scene.leave()
})

const gasExchange = new Scenes.WizardScene('gasExchange',
  (ctx) => gasExchange1(ctx),
  gasExchange2,
)

/**  ===== GASPRICE ===== */

const gasPrice1 = async (ctx) => {
  let msg = await ctx.reply("Wait few seconds for exchange data")
  let data = await exchangeInfo( _symbol )
  let gasPriceInSc = await Contract.treasuryCoinPrice().call()
  await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id)
  ctx.reply(`Gas price in kraken.com/prices is €${data.book.bids[0][0]}.\nMinimum Gas balance to buy treasury is ${ (1 / data.book.bids[0][0]).toFixed(5)}  `)
  console.log("gasPriceInSc!****", gasPriceInSc)
  return ctx.scene.leave()
}

const gasPrice = new Scenes.WizardScene('gasPrice',
  (ctx) => gasPrice1(ctx)
)

/**  ===== GASINVEST ===== */

const gasInvest1 = (ctx) => {
  let user = User.findOne({ telegramID: ctx.update.callback_query.from.id })
  // TODO: Call web tree
  ctx.reply(user.passphrase[1])
  ctx.reply(`${user.username}, you have a NUMBER as balance of gas`)
  return ctx.wizard.next()
}

const gasInvest2 = new Composer()

gasInvest2.on('load', async (ctx) => {
  // TODO: Give address to load with Polygon coins.
  ctx.reply(`You have a balance of gas ${balance}`)
  if ( balance > 0 ) ctx.reply("You may execute some actions. ")
  // const currentStepIndex = ctx.wizard.cursor
  // return ctx.wizard.selectStep(currentStepIndex)
});

gasInvest2.command('cancel', (ctx) => {
  ctx.reply('Bye bye')
  return ctx.scene.leave()
})

const gasInvest = new Scenes.WizardScene('gasInvest',
  (ctx) => gasInvest1(ctx),
  gasInvest2,
)

module.exports = { gasBalance, gasLoad, gasExchange, gasPrice, gasInvest }