const Treasury = artifacts.require("Treasury")

contract("Treasury", (accounts) => {
  it("Should assert msg.sender is owner and treasuryBox", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const owner = await TreasuryInstance.owner()
    const TreasuryBox = await TreasuryInstance.treasuryBox()

    assert.equal(owner, TreasuryBox, "Owner is Treasury Box.")
  })

  it("Should assert if smart contract is not paused", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const isPaused = await TreasuryInstance.paused()

    assert.equal( isPaused, false, "Smart contract isn't paused." )
  })

  it("Should assert referer of owner is smart contract self", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const owner = await TreasuryInstance.owner()
    const address = TreasuryInstance.address
    const referer = await TreasuryInstance.referer(owner)

    assert.equal( referer, address, "Smart contract is referer of Owner." )
  })

  it("Should assert if referer changes correctly", async () => {
    const TreasuryInstance = await Treasury.deployed()
    await TreasuryInstance.setReferer(accounts[0], accounts[1])
    await TreasuryInstance.setReferer(accounts[1], accounts[2])
    await TreasuryInstance.setReferer(accounts[2], accounts[3])
    await TreasuryInstance.setReferer(accounts[3], accounts[4])
    await TreasuryInstance.setReferer(accounts[4], accounts[5])
    await TreasuryInstance.setReferer(accounts[5], accounts[6])
    await TreasuryInstance.setReferer(accounts[6], accounts[7])
    await TreasuryInstance.setReferer(accounts[7], accounts[8])
    await TreasuryInstance.setReferer(accounts[8], accounts[9])
    await TreasuryInstance.setReferer(accounts[9], accounts[10])
    await TreasuryInstance.setReferer(accounts[10], accounts[11])
    await TreasuryInstance.setReferer(accounts[11], accounts[12])
    await TreasuryInstance.setReferer(accounts[12], accounts[13])
    await TreasuryInstance.setReferer(accounts[13], accounts[14])
    const referer = await TreasuryInstance.referer(accounts[14])

    assert.equal(accounts[13], referer, "Referer set properly")
  })

  it("Should assert if referer changes correctly 2", async () => {
    const TreasuryInstance = await Treasury.deployed()
    let err
    try {
      await TreasuryInstance.setReferer(accounts[9], accounts[1])
    } catch (error) {
      err = error
    }
    const referer = await TreasuryInstance.referer(accounts[1])

    assert.equal(accounts[0], referer, "Referer doesn't change as expected.")
  })

  it("Should assert if TreasuryBox changes correctly", async () => {
    const TreasuryInstance = await Treasury.deployed()
    await TreasuryInstance.setTreasuryBox(accounts[2])
    const treasuryBox = await TreasuryInstance.treasuryBox()

    assert.equal(accounts[2], treasuryBox, "TreasuryBox changes properly.")
  })

  //TODO: Assert if that new account is payable as well. 

  it("Should assert if TreasuryBox changes correctly 2", async () => {
    const TreasuryInstance = await Treasury.deployed()
    await TreasuryInstance.setTreasuryBox(accounts[0])
    const treasuryBox = await TreasuryInstance.treasuryBox()

    assert.equal(accounts[0], treasuryBox, "TreasuryBox changes properly.")
  })

  it("Should assert if Outsourcing pay TreasuryBox", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const treasuryBox = await TreasuryInstance.treasuryBox()
    const balance_1 = await web3.eth.getBalance(treasuryBox)
    const amount = '5000000000000000000'
    await TreasuryInstance.outSourcing({ from: accounts[9], value: amount })
    const balance_2 = await web3.eth.getBalance(treasuryBox)

    assert.equal(amount,  web3.utils.toBN(balance_2) - web3.utils.toBN(balance_1), "Outsourcing pay TreasuryBox properly.")
  })

  it("Should assert if TreasuryBalance rises in outsourcing account", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[8])
    const amount = '1000000000000' 
    await TreasuryInstance.outSourcing({ from: accounts[8], value: amount })
    const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[8])

    assert.equal(parseInt(balance_1), parseInt(balance_2) - parseInt(amount), "TreasuryBalance rises to outsourcing account properly.")
  })

  it("Should assert if assignment works properly", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const treasuryBox = await TreasuryInstance.treasuryBox()
    const balance_1 = await web3.eth.getBalance(treasuryBox)
    const amount = 1000000000000000000
    await TreasuryInstance.assignment({ from: accounts[14], value: amount })
    const balance_2 = await web3.eth.getBalance(treasuryBox)

    assert.equal((balance_2 / 1000) - (amount / 1000), balance_1 / 1000, "Assignment works properly.")
  })

  it("Should assert if assignment pays upstream in properly proportion", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[0])
    const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[1])
    await TreasuryInstance.assignment({ from: accounts[9], value: '1000000000000' })
    const balance_3 = await TreasuryInstance.treasuryBalanceOf(accounts[0])
    const balance_4 = await TreasuryInstance.treasuryBalanceOf(accounts[1])

    assert.equal(balance_3 - balance_1 , balance_4 - balance_2 , "Assignment pays upstream properly.")
  })

  it("Should assert if assignment pays upstream properly", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[2])
    const amount = 1000000000000 / 100
    await TreasuryInstance.assignment({ from: accounts[9], value: '1000000000000' })
    const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[2])

    assert.equal(balance_1, balance_2 - amount , "Assignment pays upstream properly.")
  })

  it("Should assert if pauses changes correctly", async () => {
    const TreasuryInstance = await Treasury.deployed()
    await TreasuryInstance.pause({ from: accounts[0] })
    const isPaused = await TreasuryInstance.paused()
    
    assert.equal(isPaused, true, "Owner changes properly.")
  })

  it("Should assert if pauses revert correctly", async () => {
    const TreasuryInstance = await Treasury.deployed()
    await TreasuryInstance.unpause({ from: accounts[0] })
    const isNotPaused = await TreasuryInstance.paused()
    
    assert.equal(isNotPaused, false, "Owner revert properly.")
  })

  it("Should assert if withdraw works properly", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const treasuryBalance_1 = await TreasuryInstance.treasuryBalance()
    const amount = 5000000000
    await TreasuryInstance.withdrawFrom(amount, accounts[0], { from: accounts[0] })
    const treasuryBalance_2 = await TreasuryInstance.treasuryBalance()

    assert.equal(parseInt(treasuryBalance_1), parseInt(treasuryBalance_2) + amount, "with pays treasury properly.")
  })

  it("Should assert if withdraw works properly 2", async () => {
    const TreasuryInstance = await Treasury.deployed()
    const userBalance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[5])
    const amount = 5000000000
    await TreasuryInstance.withdrawFrom(amount, accounts[5], { from: accounts[0] })
    const userBalance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[5])

    assert.equal(parseInt(userBalance_1), parseInt(userBalance_2) + amount, "withdraw works properly.")
  })

  it("Should assert if owner changes correctly", async () => {
    const TreasuryInstance = await Treasury.deployed()
    await TreasuryInstance.transferOwnership(accounts[1])
    const owner = await TreasuryInstance.owner()

    assert.equal(accounts[1], owner, "Owner changes properly.")
  })
})