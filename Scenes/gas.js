const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')
const QRCode = require('qrcode')
const imageDataURI = require('image-data-uri')

// const Contract = require('../utils/web4u.js')

const fs = require('fs')

/*  ===== GASBALANCE ===== */

let balance = 0
/* Implement balance gas. */ 
const gasBalance1 = async (ctx) => {
  const Contract = require('../utils/web4u.js')
  let user
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
      balance = await Contract.treasuryBalanceOf(user.address).call()
      ctx.reply(`${ user.username || 'Dear customer' }, you have ${ balance } as balance of gas in your account`)
      return ctx.scene.leave()
    } catch ( error ) {
      console.log(error)
      ctx.reply(`Error: ${error}`)
    }
  }
  return ctx.scene.leave()
}

const gasBalance = new Scenes.WizardScene('gasBalance',
  (ctx) => gasBalance1(ctx)
)
/**  ===== GASLOAD ===== */

const gasLoad1 = async (ctx) => {
  let user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
  if ( user && user.verifiedPhone && user.verifiedEmail) {
    QRCode.toDataURL(`${user.address}`, { errorCorrectionLevel: 'H' }, async function (err, url) {
      if (err) {
        ctx.reply("Some trouble is happening.")
        console.log("Some trouble is happening.")
      } else {
        let img = await imageDataURI.outputFile(url, 'decoded-image.png')
        ctx.replyWithPhoto({ source: fs.createReadStream(img) })
        ctx.reply("Charge your profile with cryptos using metamask.")
      }
    })
  }
  return ctx.wizard.next()
}

const gasLoad2 = new Composer()

gasLoad2.on('load', async (ctx) => {
  // TODO: Give address to load with Polygon coins.
  ctx.reply(`You have a balance of gas ${balance}`)
  if ( balance > 0 ) ctx.reply("You may execute some actions. ")
  // const currentStepIndex = ctx.wizard.cursor
  // return ctx.wizard.selectStep(currentStepIndex)
});

gasLoad2.command('cancel', (ctx) => {
  ctx.reply('Bye bye')
  return ctx.scene.leave()
})

const gasLoad = new Scenes.WizardScene('gasLoad',
  (ctx) => gasLoad1(ctx),
  gasLoad2,
)
/**  ===== GASCOLLECTOR ===== */

const gasCollector1 = (ctx) => {
  let user = User.findOne({ telegramID: ctx.update.callback_query.from.id })
  // TODO: Call web tree
  ctx.reply(user.passphrase[1])
  ctx.reply(`${user.username}, you have a NUMBER as balance of gas`)
  return ctx.wizard.next()
}

const gasCollector2 = new Composer()

gasCollector2.on('load', async (ctx) => {
  // TODO: Give address to load with Polygon coins.
  ctx.reply(`You have a balance of gas ${balance}`)
  if ( balance > 0 ) ctx.reply("You may execute some actions. ")
  // const currentStepIndex = ctx.wizard.cursor
  // return ctx.wizard.selectStep(currentStepIndex)
});

gasCollector2.command('cancel', (ctx) => {
  ctx.reply('Bye bye')
  return ctx.scene.leave()
})

const gasCollector = new Scenes.WizardScene('gasCollector',
  (ctx) => gasCollector1(ctx),
  gasCollector2,
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

module.exports = { gasBalance, gasLoad, gasCollector, gasInvest }