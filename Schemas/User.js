const mongoose = require('mongoose')
const { Schema, model } = mongoose
const bip39 = require('bip39')

const UserSchema = new Schema({
  username : { type: String, required: false, unique: true },
  telegramID: { type: Number, required: true, unique: true },
  sinceMessageID : { type: Number, required: true },
  session: { type: Number, default: 1 },
  name: { type: String, required: false },
  language: { type: String, required: false },
  referer: { type: Number, required: false },
  email: { type: String, required: false },
  phone: { type: Number, required: false },
  VCS: { type: String, required: false },
  phoneCode: { type: Number },
  emailCode: { type: Number },
  verifiedPhone: { type: Boolean, default: false },
  verifiedEmail: { type: Boolean, default: false },
  passphase: { type: Array, default: () => bip39.generateMnemonic() },
  link: { type: String, required: false, default: "broken_link" },
});

module.exports = model('User', UserSchema)
