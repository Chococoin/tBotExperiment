const mongoose = require('mongoose')
const { Schema, model } = mongoose

const UserSchema = new Schema({
  username : { type: String, required: false, unique: true },
  telegramID: { type: Number, required: true },
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
});

module.exports = model('User', UserSchema)

