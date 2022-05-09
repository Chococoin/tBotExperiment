require('dotenv').config()
const sgMail = require('@sendgrid/mail')
const SENDGRID_VALID_EMAIL = process.env.SENDGRID_VALID_EMAIL
const SENDGRID_APIKEY = process.env.SENDGRID_APIKEY
sgMail.setApiKey(SENDGRID_APIKEY)

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const sms = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
const TWILIO_PHONE = process.env.TWILIO_PHONE

async function sendVerifications (mail, phone, phoneCode, emailCode) {

  let email = ( mail, emailCode ) => {
    let msg = {
      to: mail,
      from: SENDGRID_VALID_EMAIL,
      subject: 'This is a notification from chococryptoBot.',
      text: `This is the email verification code ${emailCode} to registrate your user account successfully`,
      html: `<p>This is the email verification code ${emailCode} to registrate your user account successfully</p>`
    }
    return msg;
  }

  const msg = email(mail, emailCode)

  sms.messages
    .create({
      body: `This is the email verification code ${phoneCode} to registrate your user account successfully`,
      from: `${TWILIO_PHONE}`,
      to: '+39' + phone
    })
    .then(message => console.log(message.sid))
    .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
}

module.exports = sendVerifications