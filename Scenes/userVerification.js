const { Scenes, Composer } = require('telegraf')
const sendVerifications = require('../utils/sendVerifications.js')
const User = require('../Schemas/User.js')
let user

const step1 = (ctx) => {
  ctx.reply('Let\'s verifing your account using the 6 digit code you has recived by SMS and email.\nFirst enter your SMS code.')
  return ctx.wizard.next()
}

const step2 = new Composer()

step2.on('message', async (ctx) => {
  console.log(ctx.message.text)
  user = await User.findOne({ telegramID: ctx.update.message.from.id })
  if (ctx.message.text == user.phoneCode) {
    user.verifiedPhone = true
    await user.save()
    ctx.reply('Phone code confirmed.\n Now please enter your email code.')
    return ctx.wizard.next()
  }
})

const step3 = new Composer()

step3.on('message', async (ctx) => {
  console.log("Hola", ctx.message.text)
  console.log("Ciao", user.phoneCode)
  if (ctx.message.text == user.emailCode) {
    ctx.reply('Email code confirmed.')
    user.verifiedEmail = true
    await user.save()
    sendNotifications(user.email, user.phone)
    return ctx.scene.leave()
  }
})

const userVerification = new Scenes.WizardScene('userVerification',
  (ctx) => step1(ctx), step2, step3
)

module.exports = { userVerification }