const { Scenes, Composer } = require('telegraf')
const generateAddresses = require('../utils/generateAddresses.js')
const sendVerifications = require('../utils/sendVerifications.js')
const User = require('../Schemas/User.js')
let user

const step1 = async (ctx) => {
  try {
    user = await User.findOne({ telegramID: ctx.from.id })
  } catch(err) {
    ctx.reply('Something went wrong.')
    logError(ctx, err)
  }
  if(user) {
    if ( !user.verifiedPhone && !user.verifiedEmail ) {
      ctx.reply('Let\'s verify your account using the 6 digit code you has received by SMS and email.\nFirst enter your SMS code.')
      return ctx.wizard.next()
    }
    if ( user.verifiedPhone && !user.verifiedEmail ) {
      ctx.reply('Please verified your email using the 6 digit code you has received by email')
      return ctx.wizard.next()
    }
    if ( !user.verifiedPhone && user.verifiedEmail ) {
      ctx.reply('Please verify your phone using the 6 digit code you has received by sms')
      return ctx.wizard.next()
    }
    if ( user.verifiedPhone && user.verifiedEmail ) {
      if(user.address === 'none') {
        user.address = generateAddresses(user.passphrase[0])
        await user.save()
      }
      ctx.reply(`No need to enter code. User already registered.\n${user.address}`)
      if(user.address != 'none') ctx.reply(`Your chococoin temporal address is${ user.address }`)
      return ctx.scene.leave()
    }
  } else {
    ctx.reply("Remember to /register as first thing to do.")
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

  if ( ctx.message.text == user.phoneCode ) {
    user.verifiedPhone = true
    await user.save()
    if ( user.verifiedEmail && user.verifiedPhone ) {
      ctx.reply('Phone and Email code confirmed.')
      user.address = generateAddresses(user.passphrase[0])
      await user.save()
      ctx.reply(`Your chococoin temporal address is${ user.address }`)
      sendVerifications(user.email, user.phone, user.username)
      return ctx.scene.leave()
    } else {
      // TODO: Check if /verifiedEmail works
      ctx.reply('Phone code confirmed. Now enter the code you\'ve recived by email.')
    }
  }

  if (ctx.message.text == user.emailCode) {
    user.verifiedEmail = true
    await user.save()
    if ( user.verifiedPhone && user.verifiedEmail ) {
      ctx.reply('Phone and Email code confirmed.')
      user.address = generateAddresses(user.passphrase[0])
      await user.save()
      ctx.reply(`Your chococoin temporal address is${ user.address }`)
      sendVerifications(user.email, user.phone, user.username)
      return ctx.scene.leave()
    } else {
      // TODO: Check if /verifiedPhone works
      ctx.reply('Email code confirmed. Now /verifiedPhone')
    }
  }

  if ( ctx.message.text != user.phoneCode && ctx.message.text != user.emailCode) {
    ctx.reply('Wrong code. Try again.')
    return ctx.wizard.selectStep(currentStepIndex)
  }
})

step2.command('verifiedPhone', (ctx) => {
  // TODO: Implement /verifiedPhone
  ctx.reply('Phone verification process canceled.')
  return ctx.wizard.next()
  // return ctx.scene.leave()
})

step2.command('verifiedEmail', (ctx) => {
  // TODO: Implement /verifiedEmail
  ctx.reply('Email verification process canceled.')
  return ctx.wizard.next()
  // return ctx.scene.leave()
})

step2.command('cancel', (ctx) => {
  ctx.reply('Verification process canceled.')
  return ctx.scene.leave()
})

const userVerification = new Scenes.WizardScene('userVerification',
  (ctx) => step1(ctx), step2
)

function logError(ctx, err) {
  ctx.reply("Something Wrong happens.") 
  console.log(err)
  return ctx.scene.leave()
}

module.exports = { userVerification }