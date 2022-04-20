const UUPSProxy = artifacts.require("UUPSProxy");

module.exports = function (deployer) {
  deployer.deploy(UUPSProxy);
};