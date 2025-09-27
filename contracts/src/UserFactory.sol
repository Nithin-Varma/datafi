// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./User.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract UserFactory is Ownable, ReentrancyGuard {
    
    mapping(address => address) public walletToUser;
    
    mapping(address => address) public userToWallet;
    
    address[] public allUsers;
    
    uint256 public userCreationFee = 0;
    
    event UserCreated(address indexed wallet, address indexed userContract, string name);
    event UserCreationFeeUpdated(uint256 newFee);
    
    constructor() Ownable(msg.sender) {}
    
    function createUser(
        string memory _name,
        string memory _email,
        uint256 _age,
        string memory _country
    ) external payable nonReentrant returns (address) {
        require(walletToUser[msg.sender] == address(0), "User already exists");
        
        User newUser = new User(_name, _email, _age, _country);
        address userAddress = address(newUser);
        
        newUser.transferOwnership(msg.sender);
        
        walletToUser[msg.sender] = userAddress;
        userToWallet[userAddress] = msg.sender;
        allUsers.push(userAddress);
        
        
        emit UserCreated(msg.sender, userAddress, _name);
        return userAddress;
    }
    
    function getUserContract(address _wallet) external view returns (address) {
        return walletToUser[_wallet];
    }
    
    function userExists(address _wallet) external view returns (bool) {
        return walletToUser[_wallet] != address(0);
    }

    function getWalletAddress(address _userContract) external view returns (address) {
        return userToWallet[_userContract];
    }

    function getTotalUsers() external view returns (uint256) {
        return allUsers.length;
    }

    function getAllUsers() external view returns (address[] memory) {
        return allUsers;
    }

    function setUserCreationFee(uint256 _newFee) external onlyOwner {
        userCreationFee = _newFee;
        emit UserCreationFeeUpdated(_newFee);
    }
    
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }

    function getUserCreationFee() external view returns (uint256) {
        return userCreationFee;
    }

    receive() external payable {}
}
