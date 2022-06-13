const { default: Web3 } = require("web3")

const Treasury = artifacts.require("Treasury")


contract("Treasury", (accounts) => {
  it("Should assert msg.sender is owner and treasuryBox.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const owner = await TreasuryInstance.owner()
    const TreasuryBox = await TreasuryInstance.treasuryBox()

    assert.equal(owner, TreasuryBox, "Owner is Treasury Box.")
  })

  it("Should assert if referer changes correctly.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    await TreasuryInstance.setReferer(accounts[0], accounts[1])
    await TreasuryInstance.setReferer(accounts[1], accounts[9])
    await TreasuryInstance.setReferer(accounts[9], accounts[8])
    await TreasuryInstance.setReferer(accounts[8], accounts[7])
    await TreasuryInstance.setReferer(accounts[7], accounts[6])
    await TreasuryInstance.setReferer(accounts[6], accounts[5])
    await TreasuryInstance.setReferer(accounts[5], accounts[4])
    await TreasuryInstance.setReferer(accounts[4], accounts[3])
    await TreasuryInstance.setReferer(accounts[3], accounts[2])
    await TreasuryInstance.setReferer(accounts[2], accounts[0])
    const referer = await TreasuryInstance.referer(accounts[1])
    assert.equal(accounts[0], referer, "Referer set properly.")
  })

  it("Should assert if referer changes correctly 2.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    let err
    try {
      await TreasuryInstance.s(accounts[9], accounts[1])
    } catch (error) {
      err = error
    }
    const referer = await TreasuryInstance.referer(accounts[1])
    assert.equal(accounts[0], referer, "Referer doesn't change as expected.")
  })

  it("Should assert if TreasuryBox changes correctly.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    await TreasuryInstance.setTreasuryBox(accounts[2])
    const treasuryBox = await TreasuryInstance.treasuryBox()
    assert.equal(accounts[2], treasuryBox, "TreasuryBox changes properly.")
  })

  it("Should assert if Outsourcing pay TreasuryBox.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const treasuryBox = await TreasuryInstance.treasuryBox()
    const balance_1 = await web3.eth.getBalance(treasuryBox)
    const amount = parseInt('10000000000000000') 
    await TreasuryInstance.outSourcing({ from: accounts[9], value: '10000000000000000' })
    const balance_2 = await web3.eth.getBalance(treasuryBox)
    assert.equal(parseInt(balance_1), parseInt(balance_2) - amount, "Outsourcing pay TreasuryBox properly.")
  })

  it("Should assert if TreasuryBalance rises to outsourcing account.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const treasuryBox = await TreasuryInstance.treasuryBox()
    const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[8])
    const amount = parseInt('1000000000000') 
    await TreasuryInstance.outSourcing({ from: accounts[8], value: '1000000000000' })
    const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[8])
    assert.equal(parseInt(balance_1), parseInt(balance_2) - amount, "TreasuryBalance rises to outsourcing account properly.")
  })

  it("Should assert if assignment works properly.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const treasuryBox = await TreasuryInstance.treasuryBox()
    const balance_1 = await web3.eth.getBalance(treasuryBox)
    const amount = 100000000000000000000 / 10 * 9 
    await TreasuryInstance.assignment({ from: accounts[8], value: '100000000000000000000' })
    const balance_2 = await web3.eth.getBalance(treasuryBox)
    assert(parseInt(balance_1), parseInt(balance_2) + amount, "Assignment works properly.")
  })

  it("Should assert if assignment pays upstream in properly proportion.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[0])
    const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[1])
    const amount = 1000000000000 / 10 * 9 
    await TreasuryInstance.assignment({ from: accounts[2], value: '1000000000000' })
    const balance_3 = await TreasuryInstance.treasuryBalanceOf(accounts[0])
    const balance_4 = await TreasuryInstance.treasuryBalanceOf(accounts[1])
    assert(parseInt(balance_3) - parseInt(balance_1) , parseInt(balance_4) - parseInt(balance_2) , "Assignment pays upstream properly.")
  })

  it("Should assert if assignment pays upstream in properly.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const treasuryBox = await TreasuryInstance.treasuryBox()
    const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[9])
    const amount = 1000000000000 / 10
    await TreasuryInstance.assignment({ from: accounts[2], value: '1000000000000' })
    const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[9])
    assert(parseInt(balance_1), parseInt(balance_2) + amount , "Assignment pays upstream properly.")
  })

  it("Should assert if owner changes correctly.", async () => {
    const TreasuryInstance = await Treasury.deployed()
    await TreasuryInstance.transferOwnership(accounts[1])
    const owner = await TreasuryInstance.owner()
    assert.equal(accounts[1], owner, "Owner changes properly.")
  })
})