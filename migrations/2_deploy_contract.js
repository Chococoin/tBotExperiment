const EuroBacked = artifacts.require("EuroBacked");

module.exports = function (deployer) {
  deployer.deploy(EuroBacked, 100000);
};