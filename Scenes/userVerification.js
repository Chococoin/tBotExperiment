const { Scenes, Composer } = require('telegraf')
const generateAddresses = require('../utils/generateAdrresses.js')
const sendNotifications = require('../utils/sendNotifications.js')
const User = require('../Schemas/User.js')
let user

const step1 = async (ctx) => {
  try {
    user = await User.findOne({ telegramID: ctx.from.id })
  } catch(err) {
    ctx.reply('Something went wrong.')
    logError(ctx, err)
  }
  if ( user && !user.verifiedPhone && !user.verifiedEmail ) {
    ctx.reply('Let\'s verifing your account using the 6 digit code you has received by SMS and email.\nFirst enter your SMS code.')
    return ctx.wizard.next()
  }
  if ( user && user.verifiedPhone && !user.verifiedEmail ) {
    ctx.reply('Please verified your email using the 6 digit code you has received by email')
    return ctx.wizard.next()
  }
  if ( user && !user.verifiedPhone && user.verifiedEmail ) {
    ctx.reply('Please verified your phone using the 6 digit code you has received by sms')
    return ctx.wizard.next()
  }
  if ( user && user.verifiedPhone && user.verifiedEmail ) {
    ctx.reply("No need to enter code. User already registered.")
    if(user.address != 'none') ctx.reply(user.address)
    return ctx.scene.leave()
  }
}

const step2 = new Composer()

step2.on('message', async (ctx) => {

  const currentStepIndex = ctx.wizard.cursor

  try {
    user = await User.findOne({ telegramID: ctx.update.message.from.id })
  } catch(err) {
    ctx.reply('Not registered already')
    logError(ctx, err)
  }

  if ( user.verifiedEmail && user.verifiedPhone ) {
    ctx.reply("User already registered")
    return ctx.scene.leave()
  }

  if (ctx.message.text == user.phoneCode) {
    user.verifiedPhone = true
    if(user.verifiedEmail) {
      ctx.reply('Phone and Email code confirmed.')
      return ctx.scene.leave()
    } else {
      ctx.reply('Phone code confirmed. Now /verifiedEmail')
    }
  }

  if (ctx.message.text == user.emailCode) {
    user.verifiedEmail = true
    if(user.verifiedPhone) {
      ctx.reply('Phone and Email code confirmed.')
    } else {
      ctx.reply('Email code confirmed. Now /verifiedPhone')
    }
  }

  if ( ctx.message.text != user.phoneCode && ctx.message.text != user.emailCode) {
    ctx.reply('Wrong code. Try again.')
    return ctx.wizard.selectStep(currentStepIndex)
  }
  user.address = generateAddresses(user.passphrase[0])
  await user.save()
  if (user.verifiedPhone && !user.verifiedEmail) return ctx.wizard.selectStep(currentStepIndex - 1)
  if (!user.verifiedPhone && user.verifiedEmail) return ctx.wizard.selectStep(currentStepIndex - 1) 
  if (!user.verifiedPhone && !user.verifiedEmail) return ctx.wizard.selectStep(currentStepIndex - 2)
  const userAddress = generateAddresses(user.passphrase[0])
  ctx.reply(`User registred ${ userAddress }!`)
  return ctx.scene.leave()
})

step2.command('verifiedPhone', (ctx) => {
  ctx.reply('Phone verification process canceled.')
  return ctx.scene.leave()
})

step2.command('verifiedEmail', (ctx) => {
  ctx.reply('Email verification process canceled.')
  return ctx.scene.leave()
})

step2.command('cancel', (ctx) => {
  ctx.reply('Verification process canceled.')
  return ctx.scene.leave()
})

const step3 = new Composer()

step3.on('message', async (ctx) => {

  const currentStepIndex = ctx.wizard.cursor

  try {
    user = await User.findOne({ telegramID: ctx.update.message.from.id })
  } catch(err) {
    ctx.reply('Not registered already')
    logError(ctx, err)
  }

  if ( user.verifiedEmail && user.verifiedPhone ) {
    ctx.reply("User registered successfully")
    return ctx.scene.leave()
  }

  if ( ctx.message.text == user.phoneCode ) {
    user.verifiedPhone = true
    ctx.reply('Phone code confirmed.\nNow please enter your email code.')
  }

  if ( ctx.message.text == user.emailCode ) {
    user.verifiedEmail = true
    ctx.reply('Email code confirmed.\nNow please enter your phone code.')
  }

  if (!user.verifiedPhone && !user.verifiedEmail) {
    ctx.reply('Please enter one of the codes you have received by email or/and SMS.')
    return ctx.wizard.selectStep(currentStepIndex)
  }

  if ( ctx.message.text != user.phoneCode && ctx.message.text != user.emailCode) {
    ctx.reply('Wrong code. Try again.')
    return ctx.wizard.selectStep(currentStepIndex)
  }

  await user.save()
  return ctx.wizard.selectStep(currentStepIndex)
})

  // try {
  //   user = await User.findOne({ telegramID: ctx.update.message.from.id })
  //   // console.log(user)
  // } catch(err) {
  //   ctx.reply('Something went wrong: :\'\)')
  //   logError(ctx, err)
  // }

  // if (ctx.message.text == user.emailCode) {
  //   if ( typeof user.passphrase[0] === 'string' ) {
  //     const userAddress = generateAddresses("user.passphrase[0]")
  //     user.address = userAddress
  //   }
  //   ctx.reply('Email code confirmed.\nVerification process ended.')
  //   ctx.reply('Your address: ' + userAddress)
  //   user.verifiedEmail = true
  //   await user.save()
  //   // sendNotifications(user.email, user.phone)
  //   return ctx.scene.leave()
  // } else {
  //   ctx.reply("Wrong email code. Please try again or click /cancel")
  // }
// })

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