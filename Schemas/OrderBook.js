import mongoose from 'mongoose'

const orderExchangeSchema = new mongoose.Schema(
  {
    exchangeResult: {
      id: { type: String, required: false },
      status: { type: String, required: true, enum: [ "A", "B", "C" ], default: "A"},
      update_time: String
    },
    paymentMethod: { type: String, required: true, default: 'autoGas' },
    gasPaid: { type: Number, required: true },
    gasCost: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
)
const orderExchange = mongoose.model( 'OrderExchange', orderExchangeSchema )
export default orderExchange
