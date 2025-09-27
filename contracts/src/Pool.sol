// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// Simple data marketplace without external integrations

contract Pool is Ownable, ReentrancyGuard {
    // Pool information
    struct PoolInfo {
        string name;
        string description;
        string dataType; // e.g., "email", "phone", "address"
        uint256 pricePerData;
        uint256 totalBudget;
        uint256 remainingBudget;
        address creator;
        bool isActive;
        uint256 createdAt;
        uint256 deadline;
    }

    // Seller data
    struct SellerData {
        address seller;
        string encryptedData;
        string lighthouseHash;
        bool isVerified;
        uint256 submittedAt;
    }

    PoolInfo public poolInfo;
    
    address[] public sellers;
    mapping(address => SellerData) public sellerData;
    
    uint256 public totalDataCollected;
    
    event PoolCreated(
        string name,
        string dataType,
        uint256 pricePerData,
        uint256 totalBudget
    );
    event SellerJoined(address indexed seller);
    event DataSubmitted(address indexed seller, string lighthouseHash);
    event DataVerified(address indexed seller, bool verified);
    event DataPurchased(address indexed buyer, uint256 amount, uint256 dataCount);
    event PoolClosed();

    constructor(
        string memory _name,
        string memory _description,
        string memory _dataType,
        uint256 _pricePerData,
        uint256 _totalBudget,
        uint256 _deadline
    ) Ownable(msg.sender) {
        poolInfo = PoolInfo({
            name: _name,
            description: _description,
            dataType: _dataType,
            pricePerData: _pricePerData,
            totalBudget: _totalBudget,
            remainingBudget: _totalBudget,
            creator: msg.sender,
            isActive: true,
            createdAt: block.timestamp,
            deadline: _deadline
        });

        emit PoolCreated(_name, _dataType, _pricePerData, _totalBudget);
    }

    function joinPool() external {
        require(poolInfo.isActive, "Pool is not active");
        require(block.timestamp <= poolInfo.deadline, "Pool deadline passed");
        require(sellerData[msg.sender].seller == address(0), "Already joined");
        
        sellers.push(msg.sender);
        sellerData[msg.sender] = SellerData({
            seller: msg.sender,
            encryptedData: "",
            lighthouseHash: "",
            isVerified: false,
            submittedAt: 0
        });
        
        emit SellerJoined(msg.sender);
    }

    function submitData(
        string memory _encryptedData,
        string memory _lighthouseHash
    ) external {
        require(sellerData[msg.sender].seller == msg.sender, "Not a seller");
        require(bytes(_encryptedData).length > 0, "Invalid encrypted data");
        require(bytes(_lighthouseHash).length > 0, "Invalid lighthouse hash");
        
        sellerData[msg.sender].encryptedData = _encryptedData;
        sellerData[msg.sender].lighthouseHash = _lighthouseHash;
        sellerData[msg.sender].submittedAt = block.timestamp;
        
        emit DataSubmitted(msg.sender, _lighthouseHash);
    }

    function verifySeller(address _seller, bool _verified) external onlyOwner {
        require(sellerData[_seller].seller == _seller, "Not a seller");
        require(bytes(sellerData[_seller].encryptedData).length > 0, "No data submitted");
        
        sellerData[_seller].isVerified = _verified;
        
        if (_verified) {
            totalDataCollected++;
        }
        
        emit DataVerified(_seller, _verified);
    }

    function purchaseData() external payable nonReentrant {
        require(poolInfo.isActive, "Pool is not active");
        require(msg.value >= poolInfo.pricePerData, "Insufficient payment");
        require(totalDataCollected > 0, "No verified data available");
        
        uint256 dataCount = totalDataCollected;
        uint256 totalCost = poolInfo.pricePerData * dataCount;
        
        require(msg.value >= totalCost, "Insufficient payment for all data");
        require(poolInfo.remainingBudget >= totalCost, "Pool budget exceeded");
        
        poolInfo.remainingBudget -= totalCost;
        
        uint256 paymentPerSeller = totalCost / dataCount;
        uint256 verifiedCount = 0;
        
        for (uint256 i = 0; i < sellers.length; i++) {
            address seller = sellers[i];
            if (sellerData[seller].isVerified) {
                payable(seller).transfer(paymentPerSeller);
                verifiedCount++;
            }
        }
        
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit DataPurchased(msg.sender, totalCost, dataCount);
    }

    function getPoolInfo() external view returns (PoolInfo memory) {
        return poolInfo;
    }

    function getSellers() external view returns (address[] memory) {
        return sellers;
    }

    function getSellerData(address _seller) external view returns (SellerData memory) {
        return sellerData[_seller];
    }

    function getVerifiedSellersCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < sellers.length; i++) {
            if (sellerData[sellers[i]].isVerified) {
                count++;
            }
        }
        return count;
    }

    function closePool() external onlyOwner {
        require(poolInfo.isActive, "Pool already closed");
        poolInfo.isActive = false;
        emit PoolClosed();
    }

    function emergencyWithdraw() external onlyOwner nonReentrant {
        require(poolInfo.isActive, "Pool is closed");
        require(block.timestamp > poolInfo.deadline, "Pool still active");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }

    receive() external payable {}
}