'use strict'

require('dotenv').config()
const fs = require('fs')
const infuraApi = fs.readFileSync("./.infuraApiKey").toString().trim()
const mnemonic = fs.readFileSync("./.secret").toString().trim()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')

const abi = require('../build/contracts/Treasury.json').abi
const netWorks = require('../build/contracts/Treasury.json').networks
const lastNetwork = Object.keys(netWorks)[Object.keys(netWorks).length-1]
const contractAddress = require('../build/contracts/Treasury.json').networks[lastNetwork].address
// const contractAddress = require('../build/contracts/Treasury.json').networks[80001].address
// const provider = new HDWalletProvider(mnemonic, `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_APIKEY}`)
const provider = new HDWalletProvider(mnemonic, `http://localhost:8545`)

const sender = provider.addresses[0]
const web3 = new Web3(provider)
// console.log(web3.eth.gasPrice())
const contract = new web3.eth.Contract(abi, contractAddress, { from: sender })
const Contract = contract.methods
module.exports = { web3, Contract }