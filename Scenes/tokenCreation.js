'use strict'

require('dotenv').config()
const { Scenes, Composer } = require('telegraf')
const fileManager = require('../utils/fileManager')
const axios = require('axios')
const shell = require('shelljs')
const sendNFTNotifications = require('../utils/sendNotifications.js').sendNTFNotifications
const NFTdataParser = require('../utils/NFTdataParser.js')
const User = require('../Schemas/User.js')

let imagePath, deedData, lat, lon, lang, description, title, user

const step1 = async (ctx) => {
  try {
    user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
  } catch (err) {
    console.log(err)
    return ctx.scene.leave()
  }
  if (user && user.verifiedEmail && user.verifiedPhone) {
    ctx.reply('Let\'s create your token.\n' +
    '1) First send me a picture of your art.\n'  +
    '2) Send me your location.\n' +
    '3) Write to me the title of your NFT.\n' +
    '4) Give to your NTF a description. (If not given)')
    return ctx.wizard.next()
  } else {
    ctx.reply("You must be verified to min a NFT.")
    return ctx.scene.leave()
  }
}

const step2 = new Composer()

step2.command('help', (ctx) => {
  ctx.reply('1) First step is send me a picture of your art or click /cancel to stop mint a NFT.')
})

step2.command('cancel', (ctx) => {
  ctx.reply('Bye bye 2')
  return ctx.scene.leave()
})

step2.on('photo', async (ctx) => {
  ctx.reply('I have received the image of your NFT.\nStep 2) Send me your localization.')
  let photos = ctx.update.message.photo
  // console.log(ctx.update.message.caption)
  // if ( ctx.update.message.caption ) description = ctx.update.message.caption
  const { file_id: fileId } = photos[photos.length - 1]
  const { file_unique_id: fileUniqueId } = photos[photos.length - 1]
  const fileUrl = await ctx.telegram.getFileLink(fileId)
  imagePath = await fileManager.downloadFile(fileUrl, fileUniqueId, 'Image')
  return ctx.wizard.next()
})

step2.on('message', (ctx) => {
  ctx.reply('1) First send me a picture of your art or click /cancel to exit.')
})

const step3 = new Composer()

step3.command('help', (ctx) => {
  ctx.reply('2) Send the location of your deed or click /cancel to exit.')
})

step3.command('cancel', (ctx) => {
  ctx.reply('Bye bye 3')
  return ctx.scene.leave()
})

step3.on('location', async (ctx) => {
  lat = ctx.update.message.location.latitude
  lon = ctx.update.message.location.longitude
  lang = ctx.update.message.from.language_code
  axios.get('https://api.what3words.com/v3/convert-to-3wa', {
    params: {
      coordinates: `${lat},${lon}`,
      language: lang,
      key: process.env.W3W_APIKEY
    }
  })
  .then((res) => {
    deedData = res.data
    ctx.reply(`Your deed GeoLocalization: ${deedData.words}`)
  })
  .catch(function (error) {
    console.log(error)
  })
  .finally(() => {
    ctx.reply('3) Send a title of yor NFT')
    return ctx.wizard.next()
  })
})

// A reminder
step3.on('message', (ctx) => {
  ctx.reply('2) Send the location of your deed')
})

const step4 = new Composer()

step4.command('help', (ctx) => {
  ctx.reply('3) Send a title of yor NFT.')
})

step4.command('cancel', (ctx) => {
  ctx.reply('Bye bye 4')
  return ctx.scene.leave()
})

step4.on('message', async (ctx) => {
  if (ctx.update.message.text != (typeof undefined)){ 
    title = ctx.update.message.text
  } else {
    ctx.reply("Huston, we have a problem!")
  }
  console.log(typeof ctx.update.message.text)
  ctx.reply('4) Send a description of yor NFT.')
  return ctx.wizard.next()
})

const step5 = new Composer()

step5.on('message', async (ctx) => {
  description = ctx.update.message.text
  try {
    const NFTdata = await shell.exec(`minty mint ${ imagePath } --name "${ title }" --description "${ description }"`)
    if ( NFTdata.length === 0 ) {
      console.log(NFTdata) 
      ctx.reply("Sorry, I'm having a problem with a bridge at this time.")
      return ctx.scene.leave()
    }
    const dataJson = NFTdataParser(NFTdata.stdout) 
    const NFTtransfer = await shell.exec(`minty transfer ${ dataJson.tokenId } ${ user.address }`)
    if(NFTtransfer.stdout) {
      ctx.reply("Your NFT was created. You are going to receive an sms and an email with details about you NFT.")
      sendNFTNotifications(user.email, user.phone, dataJson)
    } else {
      ctx.reply("An error while creating your NFT was occurred.")
    }
    return ctx.scene.leave()
  } catch (error) {
    console.log(error)
    return ctx.scene.leave()
  }

})

const tokenCreation = new Scenes.WizardScene('tokenCreation',
  (ctx) => step1(ctx), step2, step3, step4, step5
)

module.exports = tokenCreation