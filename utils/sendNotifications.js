require('dotenv').config()
const sgMail = require('@sendgrid/mail')
const SENDGRID_VALID_EMAIL = process.env.SENDGRID_VALID_EMAIL
const SENDGRID_APIKEY = process.env.SENDGRID_APIKEY
sgMail.setApiKey(SENDGRID_APIKEY)

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const sms = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
const TWILIO_PHONE = process.env.TWILIO_PHONE

async function sendNotification (mail, phone) {

  let email = ( mail ) => {
    let msg = {
      to: mail,
      from: SENDGRID_VALID_EMAIL,
      subject: 'This is a notification from chococryptoBot.',
      text: `Your account is confirmed.`,
      html: `<p>Your account is confirmed.</p>`
    }
    return msg
  }

  const msg = email(mail, emailCode)

  sms.messages
    .create({
      body: `Your account is confirmed.`,
      from: `${TWILIO_PHONE}`,
      to: '+39' + phone
    })
    .then(message => console.log(message.sid))
    .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
}

module.exports = { sendNotification }