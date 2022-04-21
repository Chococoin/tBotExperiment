const mongoose = require('mongoose')
const { Schema, model } = mongoose

const UserSchema = new Schema({
  username : { type: String, required: true, unique: true },
  sinceMessageID : { type: Number, required: true },
  telegramID: { type: Number, required: true },
  name: { type: String, required: false },
  language: { type: String, required: false },
  referer: { type: Number, required: false },
  session: { type: Number, default: 1 }, 
});

module.exports = model('User', UserSchema)
