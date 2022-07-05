const ethers = require('ethers')

module.exports  = function generateAddresses(mnemonic) {

  const wallet = ethers.Wallet.fromMnemonic(mnemonic)
  return wallet.address
}