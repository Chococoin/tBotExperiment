'use strict'

require('dotenv').config()
const ccxt = require('ccxt')
const { modules } = require('web3')

var exchange = new ccxt.kraken({ apiKey: process.env.KRAKEN_APIKEY, secret: process.env.KRAKEN_SECRET })

async function exchangeInfo( ) {
  // Get MATIC/EUR pair with # 337
  await exchange.loadMarkets()
  let book = await exchange.fetchOrderBook( exchange.symbols[337] )
  let balance = await exchange.fetchBalance()
  const data = { book, balance }
  return data
}

async function exchangeCreateOrder( amount ) {
  let book = await exchange.fetchOrderBook( exchange.symbols[337] )
  let balance = await exchange.fetchBalance()
  console.log("Front exchangeCreateOrder", balance.info.result.DOT)
  // if(amount > balance) {
  //   let order = await exchange.createOrder('MATIC/EUR', 'limit' ,'sell', amount)
  //   console.log(order)
  // } else {
  //   pass
  //   // Wait confirmation
  // }
  const data = { book, balance }
  return data
}

module.exports = { exchangeInfo, exchangeCreateOrder }