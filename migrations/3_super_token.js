const SuperJuicyToken = artifacts.require("SuperJuicyToken");

module.exports = function (deployer) {
  deployer.deploy(SuperJuicyToken);
};