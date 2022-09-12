require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-ganache")
require('@nomiclabs/hardhat-ethers')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: "0.7.3",

    defaultNetwork: 'localhost',
    networks: {
        hardhat: {},
        localhost: {
            url: "http://127.0.0.1:8545",
            accounts: ["93d999433c32df2c40cd444f03b2972d7b134dd58bfce1e08b470eae6cbcc198"]
        },
        matic: {
            url: "https://polygon-mumbai.infura.io/v3/e9b69e7a1e73427396eb9b8204dbea02",
            accounts: ["93d999433c32df2c40cd444f03b2972d7b134dd58bfce1e08b470eae6cbcc198"]
        },
    }
}
