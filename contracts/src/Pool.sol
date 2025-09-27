// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Pool {
    struct PoolInfo {
        string name;
        string description;
        string dataType;
        uint256 pricePerData;
        uint256 totalBudget;
        uint256 remainingBudget;
        address creator;
        bool isActive;
        uint256 createdAt;
        uint256 deadline;
    }

    PoolInfo public poolInfo;
    address[] public sellers;
    uint256 public totalDataCollected;

    event PoolCreated(string name, string dataType, uint256 pricePerData, uint256 totalBudget);
    event SellerJoined(address indexed seller);
    event DataPurchased(address indexed buyer, uint256 amount, uint256 dataCount);

    constructor(
        string memory _name,
        string memory _description,
        string memory _dataType,
        uint256 _pricePerData,
        uint256 _totalBudget,
        uint256 _deadline,
        address _creator
    ) {
        poolInfo = PoolInfo({
            name: _name,
            description: _description,
            dataType: _dataType,
            pricePerData: _pricePerData,
            totalBudget: _totalBudget,
            remainingBudget: _totalBudget,
            creator: _creator,
            isActive: true,
            createdAt: block.timestamp,
            deadline: _deadline
        });

        emit PoolCreated(_name, _dataType, _pricePerData, _totalBudget);
    }

    function joinPool() external {
        require(poolInfo.isActive, "Pool is not active");
        require(block.timestamp <= poolInfo.deadline, "Pool deadline passed");
        
        sellers.push(msg.sender);
        emit SellerJoined(msg.sender);
    }

    function purchaseData() external payable {
        require(poolInfo.isActive, "Pool is not active");
        require(msg.value >= poolInfo.pricePerData, "Insufficient payment");
        require(sellers.length > 0, "No sellers available");
        
        uint256 dataCount = sellers.length;
        uint256 totalCost = poolInfo.pricePerData * dataCount;
        
        require(msg.value >= totalCost, "Insufficient payment for all data");
        require(poolInfo.remainingBudget >= totalCost, "Pool budget exceeded");
        
        poolInfo.remainingBudget -= totalCost;
        totalDataCollected += dataCount;
        
        uint256 paymentPerSeller = totalCost / dataCount;
        
        for (uint256 i = 0; i < sellers.length; i++) {
            payable(sellers[i]).transfer(paymentPerSeller);
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

    function getSellersCount() external view returns (uint256) {
        return sellers.length;
    }

    receive() external payable {}
}