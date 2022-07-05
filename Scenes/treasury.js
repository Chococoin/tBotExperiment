const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')
const { Contract, web3 } = require('../utils/web4u.js')

const treasuryBalance1 = async (ctx) => {
  let user, balance
  try {
    user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
  } catch (error) {
    console.log(error)
    ctx.reply("User not registered. Click /start to register.")
  }
  balance = await Contract.treasuryBalanceOf(user.address).call()
  balance = web3.utils.fromWei(balance)
  if(balance > 0) {
    ctx.reply(`You've ${balance} of treasury balance.`)
  }
  return ctx.scene.leave()
}

const treasuryBalance = new Scenes.WizardScene('treasuryBalance',
  (ctx) => treasuryBalance1(ctx)
)

module.exports = { treasuryBalance }