const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')
const sendVerifications = require('../utils/sendVerifications.js')
const randomCode = require('../utils/randomCode.js')
const newUser = new User()
let oldUserRegistered

const reEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
const rePhone = /[0-9]/
const step1 = (ctx) => {
  ctx.reply('Let\'s create your User\nTo create a new User we need your email and phone number.\nFirst Write down your email')
  return ctx.wizard.next()
}

const step2 = new Composer()

step2.on('message', async (ctx) => {

  try {
    oldUserRegistered = await User.findOne({ telegramID: 913167327 })
  } catch(err) {
    console.log(err)
  }
  if ( !oldUserRegistered && reEmail.test(ctx.message.text) ) {
    newUser.email = ctx.message.text
    if (ctx.update.message.from.username) newUser.username = ctx.update.message.from.username
    newUser.telegramID = ctx.update.message.from.id
    newUser.emailCode = randomCode()
    ctx.reply(`I have received your email ${ctx.message.text}\nNow please write your phone number`)
    return ctx.wizard.next()
  } else {
    if ( oldUserRegistered ) {
      ctx.reply(`You are already registered.\nPhone verified ${oldUserRegistered.verifiedPhone}\nEmail varified: ${oldUserRegistered.verifiedEmail}`)
    } else {
      ctx.reply('Sorry I can\'t accept that as an email. Try again after write something.')
    }
    return ctx.wizard.selectStep(0)
  }
})

const step3 = new Composer()

step3.on('message', async (ctx) => {
  if( parseInt(ctx.message.text) && rePhone.test(ctx.message.text) ) {
    ctx.reply(`I have received your phone ${ctx.message.text}\nAfter receive verification codes by SMS and email you have to enter it clicking /verification.`)
    newUser.phone = ctx.message.text
    newUser.phoneCode = randomCode()
    sendVerifications(newUser.email, newUser.phone, newUser.phoneCode, newUser.emailCode)
    newUser.save()
    return ctx.scene.leave()
  } else {
    ctx.reply('Sorry I can\'t accept that a phone. Try again after write something first.')
    return ctx.wizard.selectStep(1)
  }
});

step3.command('cancel', (ctx) => {
  ctx.reply('Bye bye Phone')
  return ctx.scene.leave()
})

const userRegister = new Scenes.WizardScene('userRegister',
  (ctx) => step1(ctx), step2, step3
)

module.exports = { userRegister }