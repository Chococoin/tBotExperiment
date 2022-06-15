// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import { ERC1155 } from  "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from  "@openzeppelin/contracts/security/Pausable.sol";
import { ERC1155Burnable } from  "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import { ERC1155Supply } from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/// @custom:security-contact german.lugo@bitnibs.com
contract Treasury is ERC1155, Ownable, Pausable, ERC1155Burnable, ERC1155Supply {

    uint public treasuryBalance;

    mapping ( address => uint256 ) public treasuryBalanceOf;
    mapping ( address => address ) public referer;
    uint public refererRegister;

    address payable public treasuryBox;

    event SentFee(bytes _data);
    event Withdrawal(uint256 _value, address _address);
    event SettedReferer(address _refered, address _refering);
    event OutSourcing(address _sender, uint256 _value);
    event Assignment(address _sender, uint256 _value);
    event Bankruptcy(address _newOwner);

    constructor() payable ERC1155("") {
        treasuryBox = payable(msg.sender);
        referer[msg.sender] = address(this);
        if (msg.value > 0) {
            treasuryBalance += msg.value;
            treasuryBalanceOf[msg.sender] += msg.value;
        }
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function withdrawMoney() public onlyOwner {
        address payable to = payable(msg.sender);
        to.transfer(getBalance());
    }

    function setReferer (address _referring, address _referred) public onlyOwner {
        require(referer[_referred] == address(0), "Set referer only once.");
        referer[_referred] = _referring;
        emit SettedReferer(_referring, _referred);
    }

    function outSourcing() public payable {
        (bool success, ) = treasuryBox.call{value: msg.value }("");
        treasuryBalanceOf[msg.sender] += msg.value;
        treasuryBalance += msg.value;
        emit OutSourcing(msg.sender, msg.value);
        require(success, "Failed to send money");
    }
    
    function assignment() public payable {
        require(referer[msg.sender] != address(0), "No referer.");
        (bool success, ) = treasuryBox.call{value: msg.value }("");
        treasuryBalance += (msg.value / 10 * 9);
        uint8 indx = 10;
        uint256 fee = msg.value / 100;
        address ref = msg.sender;
        while(indx > 0) {
            if(referer[ref] != treasuryBox && referer[ref] != address(0)) {
                treasuryBalanceOf[referer[ref]] += fee;
            }  else {
                treasuryBalanceOf[treasuryBox] += fee;
            }
            ref = referer[ref];
            indx -= 1;
        }
        emit Assignment(msg.sender, msg.value);
        require(success, "Failed to send money");
    }

    function withdrawFrom(uint256 _value, address _address) public onlyOwner {
        require(treasuryBalanceOf[_address] - _value >= 0 , "Has not enough balance to withdraw.");
        treasuryBalanceOf[_address] -= _value;
        treasuryBalance -= _value;
        emit Withdrawal(_value, _address);
    }

    function bankruptcy( ) public onlyOwner {
        bool a = paused();
        require(a, "Must be paused to start bankrupcy");
        // TODO: return assets to creditors
        setTreasuryBox(payable(address(0)));
        emit Bankruptcy(treasuryBox);
    }

    function setTreasuryBox(address payable _newTreasuryBox) public onlyOwner {
        treasuryBox = _newTreasuryBox;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        whenNotPaused
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}