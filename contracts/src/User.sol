// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract User is Ownable, ReentrancyGuard {
    struct UserProfile {
        string name;
        string email;
        uint256 age;
        string country;
        bool isVerified;
        uint256 createdAt;
        uint256 lastActiveAt;
    }

    // Data selling history
    struct DataSale {
        address poolAddress;
        uint256 amountEarned;
        uint256 timestamp;
        string dataType;
    }

    UserProfile public profile;
    
    DataSale[] public dataSales;
    
    uint256 public totalEarnings;
    
    address[] public joinedPools;
    
    event ProfileUpdated(string name, string email, uint256 age, string country);
    event DataSold(address indexed poolAddress, uint256 amount, string dataType);
    event PoolJoined(address indexed poolAddress);

    constructor(
        string memory _name,
        string memory _email,
        uint256 _age,
        string memory _country
    ) Ownable(msg.sender) {
        profile = UserProfile({
            name: _name,
            email: _email,
            age: _age,
            country: _country,
            isVerified: false,
            createdAt: block.timestamp,
            lastActiveAt: block.timestamp
        });
    }

    function updateProfile(
        string memory _name,
        string memory _email,
        uint256 _age,
        string memory _country
    ) external onlyOwner {
        profile.name = _name;
        profile.email = _email;
        profile.age = _age;
        profile.country = _country;
        profile.lastActiveAt = block.timestamp;
        
        emit ProfileUpdated(_name, _email, _age, _country);
    }

    function setVerified(bool _verified) external {
        require(msg.sender == owner() || msg.sender == address(this), "Not authorized");
        profile.isVerified = _verified;
    }

    function recordDataSale(
        address _poolAddress,
        uint256 _amount,
        string memory _dataType
    ) external {
        require(msg.sender == _poolAddress, "Only pool can record sales");
        
        dataSales.push(DataSale({
            poolAddress: _poolAddress,
            amountEarned: _amount,
            timestamp: block.timestamp,
            dataType: _dataType
        }));
        
        totalEarnings += _amount;
        
        emit DataSold(_poolAddress, _amount, _dataType);
    }

    function joinPool(address _poolAddress) external onlyOwner {
        joinedPools.push(_poolAddress);
        emit PoolJoined(_poolAddress);
    }

    function getUserProfile() external view returns (UserProfile memory) {
        return profile;
    }

    function getDataSales() external view returns (DataSale[] memory) {
        return dataSales;
    }

    function getJoinedPools() external view returns (address[] memory) {
        return joinedPools;
    }

    function getDataSalesCount() external view returns (uint256) {
        return dataSales.length;
    }

    function withdrawEarnings() external onlyOwner nonReentrant {
        require(totalEarnings > 0, "No earnings to withdraw");
        require(address(this).balance >= totalEarnings, "Insufficient contract balance");
        
        uint256 amount = totalEarnings;
        totalEarnings = 0;
        
        payable(owner()).transfer(amount);
    }

    receive() external payable {}
}
