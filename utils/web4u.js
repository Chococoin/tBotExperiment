'use strict'

require('dotenv').config()
const fs = require('fs')
// const infuraApi = fs.readFileSync("./.infuraApiKey").toString().trim()
const mnemonic = fs.readFileSync("./.secret").toString().trim()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')

const abi = require('../build/contracts/Treasury.json').abi
// const contractAddress = require('../build/contracts/SuperJuicyToken.json').networks[80001].address
const netWorks = require('../build/contracts/Treasury.json').networks
const lastNetwork = Object.keys(netWorks)[Object.keys(netWorks).length-1]
const contractAddress = require('../build/contracts/Treasury.json').networks[lastNetwork].address
const provider = new HDWalletProvider(mnemonic, 'http://127.0.0.1:8545')

const sender = provider.addresses[0]

const web3 = new Web3(provider)
const contract = new web3.eth.Contract(abi, contractAddress, { gasPrice: '2000000000', from: sender })
const Contract = contract.methods
module.exports = { web3, Contract }