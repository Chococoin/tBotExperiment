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
  email: { type: String, required: true, unique: true },
  phone: { type: Number, required: true, unique: true },
  VCS: { type: String, required: false },
  phoneCode: { type: Number },
  emailCode: { type: Number },
  verifiedPhone: { type: Boolean, default: false },
  verifiedEmail: { type: Boolean, default: false },
  // TODO: Add salt to passphrase.
  // TODO: phone and email must be unique.
  passphrase: { type: Array, default: () => bip39.generateMnemonic()},
  address: { type: String, default: 'none'},
  link: { type: String, required: false, default: "broken_link" },
  isFarmer: { type: Boolean, required: true, default: false },
});

module.exports = model('User', UserSchema)
