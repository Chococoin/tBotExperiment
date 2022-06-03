const Web3 = require('web3')

const abi = require('./build/contracts/SuperJuicyToken.json').abi // TODO: use new contract
const contractAddress = require('./build/contracts/SuperJuicyToken.json').networks[5].address

const provider = new HDWalletProvider(mnemonic, `https://goerli.infura.io/v3/${infuraApi}`) // Use Avalanche
const sender = provider.addresses[0]
const web3 = new Web3(provider)

const contract = new web3.eth.Contract(abi, contractAddress, { gasPrice: '2000000000', from: sender })

// async function define name Token
let tokenName = contract.methods.readName().call().then(console.log).catch(console.log)
let tokenSupply = contract.methods.readSupply().call().then(console.log).catch(console.log)