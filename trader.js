'use strict'
const ccxt = require('ccxt')
const util = require('util')
require('dotenv').config()

const exchange = new ccxt.kraken({ apiKey: process.env.KRAKEN_APIKEY, secret: process.env.KRAKEN_SECRET })


async function krakra( ) {
    let markets = await exchange.loadMarkets()
    let book = await exchange.fetchOrderBook( exchange.symbols[337] )
    let balance = await exchange.fetchBalance()
    //exchange.symbols.forEach( (r,i,a) => { if (r == 'MATIC/EUR')console.log(r, i) })
    //console.log(book)
    console.log("Balance DOT:", balance.total['DOT'])
}

krakra()

// Use at symbol > node trader.js
