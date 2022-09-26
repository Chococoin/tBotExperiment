'use strict'
require('dotenv').config()
const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')

let user

const step1 = async (ctx) => {
  try {
    user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
  } catch (err) {
    console.log(err)
    return ctx.scene.leave()
  }
  if (user && user.verifiedEmail && user.verifiedPhone) {
    ctx.reply('You are about to adopt a Tree.\n' +
    '1) Look for the tree do you want to adopt.\n'  +
    '2) Use your gas to close the transaction.\n' +
    '3) Don\'t forget to share the good new on your favorite social network')
    return ctx.wizard.next()
  } else {
    ctx.reply("You must be verified to adopt a tree.")
    return ctx.scene.leave()
  }
}

const step2 = async (ctx) => {
  ctx.reply("That's all for now.")
  return ctx.scene.leave()
}

const adoptATree = new Scenes.WizardScene('adoptATree',
  (ctx) => step1(ctx), (ctx) => step2(ctx)
)

module.exports = adoptATree