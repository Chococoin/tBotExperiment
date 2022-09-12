'use strict'

require('dotenv').config()
const { Scenes, Composer } = require('telegraf')
const fileManager = require('../utils/fileManager')
const axios = require('axios')
const shell = require('shelljs')
const sendNFTNotifications = require('../utils/sendNotifications.js').sendNTFNotifications
const NFTdataParser = require('../utils/NFTdataParser.js')
const User = require('../Schemas/User.js')

let imagePath, geoposition, lat, lon, lang, description, title, user, currentStepIndex, caption

const step1 = async (ctx) => {
  try {
    user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
    console.log("User:", user)
  } catch (err) {
    console.log(err)
    return ctx.scene.leave()
  }
  if ( user && user.verifiedEmail && user.verifiedPhone && user.isFarmer ) {
    ctx.reply('Let\'s create your token.\n' +
    '1) First send me a picture of your cocoa tree.\n'  +
    '2) Send me your location.\n' +
    '3) Write to me the title of your NFT.\n' +
    '4) Give to your NTF a description.')
    return ctx.wizard.next()
  }  else {
    ctx.reply("You must be verified as Farmer to mint a NFT-TREE.")
    return ctx.scene.leave()
  }
}

const step2 = new Composer()

step2.command('help', (ctx) => {
  ctx.reply('1) First step is send me a picture of your cocoa tree or click /cancel to stop mint a NFT.')
})

step2.command('cancel', (ctx) => {
  ctx.reply('Bye bye 2')
  return ctx.scene.leave()
})

step2.on('photo', async (ctx) => {
  let photos = ctx.update.message.photo
  console.log( "Caption", ctx.update.message.caption )
  if ( ctx.update.message.caption ) caption = ctx.update.message.caption
  const { file_id: fileId } = photos[photos.length - 1]
  const { file_unique_id: fileUniqueId } = photos[photos.length - 1]
  const fileUrl = await ctx.telegram.getFileLink(fileId)
  imagePath = await fileManager.downloadFile(fileUrl, fileUniqueId, 'Image')
  ctx.reply('I have received the image of your NFT.\n2) Send me the geo-localization of your deed.')
  return ctx.wizard.next()
})

step2.on('message', (ctx) => {
  ctx.reply('1) First send me a picture of your cocoa tree or click /cancel to exit.')
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
    geoposition = res.data
    ctx.reply(`Your deed GeoLocalization: ${geoposition.words}`)
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
  console.log("MESSAGE: ", ctx)
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
  currentStepIndex = ctx.wizard.cursor
  if (typeof ctx.update.message.text === (typeof 'String')){ 
    title = ctx.update.message.text
  } else {
    ctx.reply("Wrong type of info. Send a text for description of your NFT.")
    return ctx.wizard.selectStep(currentStepIndex)
  }
  ctx.reply('4) Send a description of yor NFT.')
  return ctx.wizard.next()
})

const step5 = new Composer()

step5.on('message', async (ctx) => {
  currentStepIndex = ctx.wizard.cursor
  if (typeof ctx.update.message.text === (typeof 'String')) { 
    description = ctx.update.message.text
    try {
      const NFTdata = await shell.exec(`minty mintNFTtree ${ imagePath } --name "${ title }" --description "${ description }" --geoposition "${ geoposition }" --caption "${ caption }"`)
      console.log(NFTdata)
      if ( NFTdata.length === 0 ) {
        ctx.reply("Sorry, I'm having a problem with a bridge at this time.")
        return ctx.scene.leave()
      }
      const dataJson = NFTdataParser(NFTdata.stdout) 
      const NFTtransfer = await shell.exec(`minty transfer ${ dataJson.tokenId } ${ user.address }`)
      console.log("**************\n", NFTtransfer)
      if(NFTtransfer.stdout) {
        ctx.reply("Your NFT was created. You are going to receive an sms and an email with details about you NFT.")
        sendNFTNotifications(user.email, user.phone, dataJson)
      } else {
        ctx.reply("An error while creating your NFT was occurred.")
      }
      fileManager.deleteFile(imagePath)
      return ctx.scene.leave()
    } catch (error) {
      console.log(error)
      return ctx.scene.leave()
    }
  } else {
    ctx.reply("Please send a text as description.")
    return ctx.wizard.selectStep(currentStepIndex)
  }
})

const tokenTreeCreation = new Scenes.WizardScene('tokenTreeCreation',
  (ctx) => step1(ctx), step2, step3, step4, step5
)

module.exports = tokenTreeCreation