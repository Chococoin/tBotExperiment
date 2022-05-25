'use strict'

require('dotenv').config()
const { Scenes, Composer } = require('telegraf')
const fileManager = require('../utils/fileManager')
const what3words = require("@what3words/api")
const axios = require('axios')
const shell = require('shelljs')

let imagePath, deedData, lat, lon, lang, description, tittle

const step1 = (ctx) => {
  // shell.exec('./minty/.start-local-enviroment.sh')
  ctx.reply('Let\'s create your token.\n' +
            '1) First send me a picture of your art.\n'  +
            '2) Send me your location.\n' +
            '3) Write to me the title of your NFT.\n' +
            '4) Give to your NTF a description. (If not given)')
  return ctx.wizard.next()
}

const step2 = new Composer()

step2.command('help', (ctx) => {
  ctx.reply('1) First send me a picture of your art or click /cancel to exit.')
})

step2.command('cancel', (ctx) => {
  ctx.reply('Bye bye 2')
  return ctx.scene.leave()
})

step2.on('photo', async (ctx) => {
  ctx.reply('I have received the image of your NFT.\nStep 2) Send me your localization.')
  let photos = ctx.update.message.photo
  console.log(ctx.update.message.caption)
  if ( ctx.update.message.caption ) description = ctx.update.message.caption
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
    ctx.reply('3) Send a tittle of yor NFT.')
    return ctx.wizard.next()
  })
})

// A reminder
step3.on('message', (ctx) => {
  ctx.reply('2) Send the location of your deed')
})

const step4 = new Composer()

step4.command('help', (ctx) => {
  ctx.reply('3) Send a description of yor NFT.')
})

step4.command('cancel', (ctx) => {
  ctx.reply('Bye bye 4')
  return ctx.scene.leave()
})

step4.on('message', async (ctx) => {
  tittle = ctx.update.message.text
  ctx.reply('3) Send a description of yor NFT.')
  return ctx.wizard.next()
})

const step5 = new Composer()

step5.on('message', async (ctx) => {
  console.log(ctx.update.message)
  description = ctx.update.message.text
  const b = await shell.exec(`minty mint ${ imagePath } --name ${ tittle } --description ${ description }`)
  ctx.reply(b.stdout)
  return ctx.scene.leave()
})

const tokenCreation = new Scenes.WizardScene('tokenCreation',
  (ctx) => step1(ctx), step2, step3, step4, step5
)

module.exports = tokenCreation