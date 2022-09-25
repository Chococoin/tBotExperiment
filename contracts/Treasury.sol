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
    address payable public treasuryBox;
    address payable public exchangeChannel;

    mapping ( address => uint256 ) public treasuryBalanceOf;
    mapping ( address => address ) public referer;
    uint public treasuryCoinPrice;
    uint public refererRegister;

    uint constant multiplier = 10**18;

    event SentFee(bytes _data);
    event Withdrawal(uint256 _value, address _address);
    event SettedReferer(address _refered, address _refering);
    event SetExchangeChannel(address _address);
    event SendToExchange(uint256 _value);
    event OutSourcing(address _sender, uint256 _value);
    event Assignment(address _sender, uint256 _value);
    event Bankruptcy(address _newOwner);

    constructor() payable ERC1155("") {
        treasuryBox = payable(msg.sender);
        referer[msg.sender] = address(this);
        treasuryCoinPrice = multiplier;
    }

    function setTreasuryEuroPrice (uint _polygonPrice) public onlyOwner {
        treasuryCoinPrice = _polygonPrice;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function withdrawFunding() internal {
        require(exchangeChannel != address(0), "Contract requires an exchange address.");
        emit SendToExchange(getBalance());
        exchangeChannel.transfer(getBalance());
    }

    function setExchangeAddress(address _address) public onlyOwner {
        exchangeChannel = payable(_address);
        emit SetExchangeChannel(_address);
    }

    function setReferer (address _referring, address _referred) public onlyOwner {
        require(referer[_referred] == address(0), "Set referer only once.");
        referer[_referred] = _referring;
        emit SettedReferer(_referring, _referred);
    }

    function outSourcing() public payable {
        require(msg.value / treasuryCoinPrice >= 1, "Value must exchange at least one Treasury Unit.");
        (bool success, ) = treasuryBox.call{value: msg.value }("");
        treasuryBalanceOf[msg.sender] += msg.value * treasuryCoinPrice / multiplier ;
        treasuryBalance += msg.value * treasuryCoinPrice / multiplier;
        emit OutSourcing(msg.sender, msg.value * treasuryCoinPrice / multiplier );
        require(success, "Failed to send money");
    }
    
    function assignment() public payable {
        require(referer[msg.sender] != address(0), "Sender need a referer.");
        require(msg.value >= 10 ** 18, "Value must be greader or equal than a crypto Unit.");
        (bool success, ) = treasuryBox.call{value: msg.value }("");
        treasuryBalance += msg.value * treasuryCoinPrice / multiplier / 90;
        uint8 indx = 10;
        uint256 fee = msg.value * treasuryCoinPrice / multiplier / 100;
        address ref = msg.sender;
        while(indx > 0) {
            if(referer[ref] != address(0)) {
                treasuryBalanceOf[referer[ref]] += fee;
                treasuryBalance += fee;
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

    function bankruptcy() public onlyOwner {
        bool a = paused();
        require(a, "Must be paused to start bankrupcy");
        // TODO: return assets to creditors;
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

    event ReceivedEth(uint256 amount);

    receive() external payable  { 
        withdrawFunding();
    }

    fallback() external payable {
        withdrawFunding();
    }
}