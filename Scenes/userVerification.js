const { Scenes, Composer } = require('telegraf')
const sendNotifications = require('../utils/sendNotifications.js')
const User = require('../Schemas/User.js')
let user

const step1 = (ctx) => {
  ctx.reply('Let\'s verifing your account using the 6 digit code you has received by SMS and email.\nFirst enter your SMS code.')
  return ctx.wizard.next()
}

const step2 = new Composer()

step2.on('message', async (ctx) => {
  console.log(ctx.message.text)

  try {
    user = await User.findOne({ telegramID: ctx.update.message.from.id })
  } catch(error) {
    ctx.reply('Not registered already')
    logError(err)
  }

  try {
    if (user.verifiedPhone) {
      ctx.reply("Phone already verified.")
      return ctx.wizard.next()
    }
  } catch(error) {
    logError(ctx, error)
  }

  if (ctx.message.text == user.phoneCode) {
    user.verifiedPhone = true
    await user.save()
    ctx.reply('Phone code confirmed.\n Now please enter your email code.')
    return ctx.wizard.next()
  } else {
    ctx.reply("Wrong phone code. Please try again or click /cancel")
  }
})

step2.command('cancel', (ctx) => {
  ctx.reply('Verification process canceled.')
  return ctx.scene.leave()
})

const step3 = new Composer()

step3.on('message', async (ctx) => {
  if (ctx.message.text == user.emailCode) {
    ctx.reply('Email code confirmed.\nVerification process ended.')
    user.verifiedEmail = true
    await user.save()
    sendNotifications(user.email, user.phone)
    return ctx.scene.leave()
  } else {
    ctx.reply("Wrong email code. Please try again or click /cancel")
  }
})

step3.command('cancel', (ctx) => {
  ctx.reply('Verification process canceled.')
  return ctx.scene.leave()
})

const userVerification = new Scenes.WizardScene('userVerification',
  (ctx) => step1(ctx), step2, step3
)

function logError(ctx, err) {
  ctx.reply("Something Wrong happens.") 
  console.log(err)
  return ctx.scene.leave()
}

module.exports = { userVerification }