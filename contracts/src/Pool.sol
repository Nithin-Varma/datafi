// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Pool {
    struct PoolInfo {
        string name;
        string description;
        string[] proofs;
        string[] dataTypes;
        uint256 pricePerData;
        uint256 totalBudget;
        uint256 remainingBudget;
        address creator;
        bool isActive;
        uint256 createdAt;
        uint256 deadline;
    }

    PoolInfo public poolInfo;
    mapping(address => bool) public userVerified;
    address[] public verifiedSellers;
    address[] public joinedSellers;
    mapping(address => bool) public userJoined;
    uint256 public totalDataCollected;
    mapping(bytes32 => bool) public proofVerified;

    event PoolCreated(string name, string[] dataTypes, string[] proofs, uint256 pricePerData, uint256 totalBudget);
    event SellerJoined(address indexed seller);
    event DataPurchased(address indexed buyer, uint256 amount, uint256 dataCount);

    constructor(
        string memory _name,
        string memory _description,
        string[] memory _proofs,
        string[] memory _dataTypes,
        uint256 _pricePerData,
        uint256 _totalBudget,
        uint256 _deadline,
        address _creator
    ) {
        poolInfo = PoolInfo({
            name: _name,
            description: _description,
            proofs: _proofs,
            dataTypes: _dataTypes,
            pricePerData: _pricePerData,
            totalBudget: _totalBudget,
            remainingBudget: _totalBudget,
            creator: _creator,
            isActive: true,
            createdAt: block.timestamp,
            deadline: _deadline
        });

        (bool success, ) = payable(address(this)).call{value: _totalBudget}("");
        require(success, "Failed to send initial budget to creator");

        emit PoolCreated(_name, _dataTypes, _proofs, _pricePerData, _totalBudget);
    }

    function joinPool() external {
        require(msg.sender != poolInfo.creator, "Creator cannot join pool");
        require(poolInfo.isActive, "Pool is not active");
        require(block.timestamp <= poolInfo.deadline, "Pool deadline passed");
        require(!userJoined[msg.sender], "User already joined pool");
        userJoined[msg.sender] = true;
        joinedSellers.push(msg.sender);
        emit SellerJoined(msg.sender);
    }

    function verifySeller(address _seller, bool _verified, bytes32 _proof) external {
        require(poolInfo.isActive, "Pool is not active");
        require(block.timestamp <= poolInfo.deadline, "Pool deadline passed");
        require(userJoined[_seller], "User not joined pool");
        require(!proofVerified[_proof], "Seller proof already verified");
        require(!userVerified[_seller], "Seller is already verified");
        userVerified[_seller] = _verified;
        verifiedSellers.push(_seller);
        proofVerified[_proof] = true;
    }

    function purchaseData() external payable {
        require(poolInfo.isActive, "Pool is not active");
        require(msg.value >= poolInfo.pricePerData, "Insufficient payment");
        require(joinedSellers.length > 0, "No sellers available");
        
        uint256 dataCount = joinedSellers.length;
        uint256 totalCost = poolInfo.pricePerData * dataCount;

        require(address(this).balance >= totalCost, "Insufficient amount in pool");
        
        poolInfo.remainingBudget -= totalCost;
        totalDataCollected += dataCount;
        
        for (uint256 i = 0; i < joinedSellers.length; i++) {
            (bool success, ) = payable(joinedSellers[i]).call{value: poolInfo.pricePerData}("");
            require(success, "Failed to send payment to seller");
        }

        if(address(this).balance > 0) {
            (bool success, ) = payable(poolInfo.creator).call{value: address(this).balance}("");
            require(success, "Failed to send remaining balance to creator");
        }
        
        emit DataPurchased(msg.sender, totalCost, dataCount);
    }

    function getPoolInfo() external view returns (PoolInfo memory) {
        return poolInfo;
    }

    function getJoinedSellers() external view returns (address[] memory) {
        return joinedSellers;
    }

    function getJoinedSellersCount() external view returns (uint256) {
        return joinedSellers.length;
    }

    function getVerifiedSellers() external view returns (address[] memory) {
        return verifiedSellers;
    }

    function getVerifiedSellersCount() external view returns (uint256) {
        return verifiedSellers.length;
    }

    receive() external payable {}
}