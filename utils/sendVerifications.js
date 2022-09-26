require('dotenv').config()
const sgMail = require('@sendgrid/mail')
const SENDGRID_VALID_EMAIL = process.env.SENDGRID_VALID_EMAIL
const SENDGRID_APIKEY = process.env.SENDGRID_APIKEY
sgMail.setApiKey(SENDGRID_APIKEY)

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const sms = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
const TWILIO_PHONE = process.env.TWILIO_PHONE

async function sendVerifications (mail, phone, username) {

  let email = ( mail, username ) => {
    let msg = {
      to: mail,
      from: SENDGRID_VALID_EMAIL,
      subject: 'Your Chocosfera Account was successfully verified.',
      text: `Hi ${ username || 'Dear customer' }! Your user account was registered and verified successfully! You are one step to the rear of create your art and mint your owns NFT using our telegram bot.`,
      html: `<p>Hi ${ username || 'Dear customer' }! Your user account was registered and verified successfully! You are one step to the rear of create your art and mint your owns NFT using our telegram bot.</p>`
    }
    return msg
  }

  const msg = email( mail, username )

  sms.messages
    .create({
      body: `Hi ${username || 'Dear customer'}! Your user account was registered and verified successfully! You are one step to the rear of create your art and mint your owns NFT using our telegram bot.`,
      from: `${TWILIO_PHONE}`,
      to: '+39' + phone
    })
    .then(message => console.log(message.sid))
    .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
}

async function sendRegistration (username, mail, phone, phoneCode, emailCode) {

  let email = ( mail, username ) => {
    let msg = {
      to: mail,
      from: SENDGRID_VALID_EMAIL,
      subject: 'Your Chocosfera Account was registered. Use code to verify',
      text: `Hi ${ username || 'Dear customer' }! Your user account was registered. To verify it successfully, please enter this code -> ${emailCode} at email verification phase.`,
      html: `<p>Hi ${ username || 'Dear customer' }! Your user account was registered. To verify it successfully, please enter this code -> ${emailCode} at email verification phase.</p>`
    }
    return msg
  }

  const msg = email( mail, username )

  sms.messages
    .create({
      body: `Hi ${username || 'Dear customer'}! Your user account was registered. To verify it successfully, please enter this code -> ${phoneCode} at phone verification phase.`,
      from: `${TWILIO_PHONE}`,
      to: '+39' + phone
    })
    .then(message => console.log(message.sid))
    .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
}

async function sendPollNotifications ( username, userPoolCreator, mail, phone ) {

  let email = ( mail, username, userPoolCreator ) => {
    let msg = {
      to: mail,
      from: SENDGRID_VALID_EMAIL,
      subject: `A new Poll was created by ${ userPoolCreator }`,
      text: `Hi ${ username || 'Dear customer' }, ${ userPoolCreator } has created a new poll. Don't miss the chance of make worth you opinion.`,
      html: `<p>Hi ${ username || 'Dear customer' }, ${ userPoolCreator } has created a new poll. Don't miss the chance of make worth you opinion.`
    }
    return msg
  }

  const msg = email( mail, username )

  sms.messages
    .create({
      body: `Hi ${ username || 'Dear customer '}, ${ userPoolCreator } has created a new poll. Don't miss the chance of make worth you opinion.`,
      from: `${TWILIO_PHONE}`,
      to: '+39' + phone
    })
    .then(message => console.log(message.sid))
    .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
}

module.exports = { sendRegistration, sendVerifications, sendPollNotifications }