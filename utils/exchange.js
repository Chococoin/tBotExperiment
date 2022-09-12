'use strict'

require('dotenv').config()
const ccxt = require('ccxt')
const saveOrder = require('../utils/saveOrder').saveOrder

const exchange = new ccxt.kraken({ apiKey: process.env.KRAKEN_APIKEY, secret: process.env.KRAKEN_SECRET })

async function exchangeInfo( _symbol  ) {
  // Get MATIC/EUR pair with # 337
  let pair
  await exchange.loadMarkets()
  let symbols = await exchange.symbols
  symbols.forEach( (v,i) => {
    if(v === _symbol) {
      pair = i
    }
  })
  let book = await exchange.fetchOrderBook( exchange.symbols[pair])
  console.log("Symbols:", symbols)

  let balance = await exchange.fetchBalance()
  const data = { book, balance }
  return data
}

async function exchangeCreateOrder( amount, bestPrice, user  ) {
  amount = (amount / 10**18).toFixed(6) / 1
  bestPrice = (bestPrice / 10**18).toFixed(6) / 1
  // console.log("bestPrice", bestPrice)
  // bestPrice = (bestPrice + bestPrice * 0.0002).toFixed(6) 
  let order = 'void'
  let symbol = exchange.symbols[337]
  await exchange.fetchOrderBook( symbol )
  let balance = await exchange.fetchBalance()
  balance = balance.info.result.MATIC / 1
  // console.log("Front exchangeCreateOrder", balance)
  // console.log("Amount", amount)
  console.log("Price", bestPrice)
  if(amount < balance) {
    try {
      order = await exchange.createOrder('MATIC/EUR', 'limit' ,'sell', amount, bestPrice)
      saveOrder(order, user)
      console.log(order)
    } catch ( error ) {
      console.log(error)
    }
  } else {
    //
    // TODO: Wait confirmation
  }
  return order
}

module.exports = { exchangeInfo, exchangeCreateOrder }