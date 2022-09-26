const mongoose = require('mongoose')
const { Schema, model } = mongoose

const pollCreationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pollTelegramId: { type: Number, required: true, unique: true },
    isOpen: { type: Boolean, require: true, default: true },
  },
  {
    timestamps: true,
  }
)
const pollCreation = model( 'pollCreation', pollCreationSchema )
module.exports = pollCreation