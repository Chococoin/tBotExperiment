// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import { SuperTokenBase } from "./SuperTokenBase.sol";
import { UUPSProxy } from "./UUPSProxy.sol";

contract SuperJuicyToken is SuperTokenBase, UUPSProxy {
    string internal _message;
    string internal _name;
    uint256 internal _initialSupply;
    function initialize (
        string calldata name,
        string calldata symbol,
        string calldata message,
        uint256 initialSupply
      ) external {
        bool success;
        (success, ) = address(this).call(
            abi.encodeWithSignature(
                "initialize(address,uint8,string,string)",
                address(0),
                18,
                name,
                symbol
            )
        );
        require(success, "init failed");
        (success, ) = address(this).call(
            abi.encodeWithSignature(
                "selfMint(address,uint256,bytes)",
                msg.sender,
                initialSupply,
                new bytes(0)
            )
        );
        require(success, "selfMint failed");
        _message = message;
        _initialSupply = initialSupply;
        _name = name;
    }

    function readMessage()
        public
        view
        returns(string memory)
      {
        return _message;
    }

    function readSupply()
        public
        view
        returns(uint256)
      {
        return _initialSupply;
    }

    function readName()
        public
        view
        returns(string memory)
      {
        return _name;
    }
}

