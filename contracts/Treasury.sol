// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

contract Treasury {
    uint public storicalEntries;
    uint public storicalOutput;
    uint public balance;
    address public owner;
    mapping ( address => uint256 ) public treasuryBalanceOf;
    mapping ( address => address ) public referer;
    address payable public treasuryBox;

    event RecieveData(bytes _data);
    
    constructor () payable {
        owner = msg.sender;
        treasuryBox = payable(msg.sender);
        storicalOutput = 0;
        storicalEntries = 0;
        setBalance();
    }

    function donate() public payable {
        (bool success, bytes memory data) = treasuryBox.call{value: msg.value }("10");
        emit RecieveData(data);
        storicalEntries += msg.value;
        setBalance();
        treasuryBalanceOf[msg.sender] += msg.value;
        require(success, "Failed to send money");
    }

    function outSoursing() public payable {
        (bool success, bytes memory data) = treasuryBox.call{value: msg.value }("");
        emit RecieveData(data);
        storicalEntries += msg.value;
        setBalance();
        treasuryBalanceOf[msg.sender] += msg.value;
        require(success, "Failed to send money");
    }

    function setBalance() internal {
        balance = storicalEntries - storicalOutput;
    }

    function setTreasuryBox(address payable _newTreasuryBox) public {
        require(msg.sender == owner, "No authorized.");
        treasuryBox = _newTreasuryBox;
    }
}