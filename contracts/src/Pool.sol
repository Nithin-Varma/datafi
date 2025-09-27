// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Pool {
    // Custom errors
    error PoolNotActive();
    error DeadlinePassed();
    error UserNotJoined();
    error AlreadyFullyVerified();
    error ProofNotRequired();
    error ProofAlreadySubmitted();
    error ProofAlreadyUsed();
    error NotSelfProof();
    error CreatorCannotJoin();
    error UserAlreadyJoined();
    error OnlyCreator();
    error InsufficientPayment();
    error NoSellersAvailable();
    error InsufficientPoolBalance();
    error ProofNotFound();

    enum ProofType {
        SELF_AGE_VERIFICATION,    // >18 years old via Self
        SELF_NATIONALITY,          // Indian citizen via Self  
        EMAIL_VERIFICATION,       // Netflix subscription via .eml file
        HACKERHOUSE_INVITATION,   // HackerHouse invitation
        CUSTOM                     // Custom proof type
    }

    struct ProofRequirement {
        string name;
        string description;
        ProofType proofType;
        bool isRequired;
    }

    struct PoolInfo {
        string name;
        string description;
        string dataType;
        ProofRequirement[] proofRequirements;
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
    mapping(address => bool) public userHasProven; // Track if user has proven once
    mapping(address => mapping(string => bool)) public userProofs; // Track which proofs user has provided
    mapping(address => bool) public userFullyVerified; // Track if user has all required proofs
    mapping(address => mapping(string => bytes32)) public userProofHashes; // Track unique proof hashes per user
    mapping(bytes32 => bool) public globalProofHashes; // Track global proof hashes to prevent duplicates
    uint256 public totalDataCollected;
    mapping(bytes32 => bool) public proofVerified;

    event PoolCreated(string name, string dataType, uint256 pricePerData, uint256 totalBudget);
    event SellerJoined(address indexed seller);
    event DataPurchased(address indexed buyer, uint256 amount, uint256 dataCount);
    event ProofSubmitted(address indexed seller, string proofName, bool verified);
    event SellerFullyVerified(address indexed seller);

    constructor(
        string memory _name,
        string memory _description,
        string memory _dataType,
        ProofRequirement[] memory _proofRequirements,
        uint256 _pricePerData,
        uint256 _totalBudget,
        uint256 _deadline,
        address _creator
    ) {
        poolInfo = PoolInfo({
            name: _name,
            description: _description,
            dataType: _dataType,
            proofRequirements: _proofRequirements,
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
        if (msg.sender == poolInfo.creator) revert CreatorCannotJoin();
        if (!poolInfo.isActive) revert PoolNotActive();
        if (block.timestamp > poolInfo.deadline) revert DeadlinePassed();
        if (userJoined[msg.sender]) revert UserAlreadyJoined();
        userJoined[msg.sender] = true;
        joinedSellers.push(msg.sender);
        emit SellerJoined(msg.sender);
    }

    function submitProof(string memory _proofName, bytes32 _proofHash) external {
        if (!poolInfo.isActive) revert PoolNotActive();
        if (block.timestamp > poolInfo.deadline) revert DeadlinePassed();
        if (!userJoined[msg.sender]) revert UserNotJoined();
        if (userFullyVerified[msg.sender]) revert AlreadyFullyVerified();
        
        // Check if this proof is required for the pool
        bool isRequiredProof = false;
        ProofType proofType;
        for (uint256 i = 0; i < poolInfo.proofRequirements.length; i++) {
            if (keccak256(bytes(poolInfo.proofRequirements[i].name)) == keccak256(bytes(_proofName))) {
                isRequiredProof = true;
                proofType = poolInfo.proofRequirements[i].proofType;
                break;
            }
        }
        if (!isRequiredProof) revert ProofNotRequired();
        if (userProofs[msg.sender][_proofName]) revert ProofAlreadySubmitted();
        
        // Generate unique proof hash combining user address, proof name, and proof hash
        bytes32 uniqueProofHash = keccak256(abi.encodePacked(msg.sender, _proofName, _proofHash, address(this)));
        if (globalProofHashes[uniqueProofHash]) revert ProofAlreadyUsed();
        
        userProofs[msg.sender][_proofName] = true;
        userProofHashes[msg.sender][_proofName] = uniqueProofHash;
        globalProofHashes[uniqueProofHash] = true;
        proofVerified[_proofHash] = true;
        
        emit ProofSubmitted(msg.sender, _proofName, true);
        
        // Check if user has all required proofs
        _checkFullVerification(msg.sender);
    }

    function submitSelfProof(string memory _proofName, bytes32 _selfProofHash) external {
        if (!poolInfo.isActive) revert PoolNotActive();
        if (block.timestamp > poolInfo.deadline) revert DeadlinePassed();
        if (!userJoined[msg.sender]) revert UserNotJoined();
        if (userFullyVerified[msg.sender]) revert AlreadyFullyVerified();
        
        // Check if this is a Self proof type
        bool isSelfProofType = false;
        for (uint256 i = 0; i < poolInfo.proofRequirements.length; i++) {
            if (keccak256(bytes(poolInfo.proofRequirements[i].name)) == keccak256(bytes(_proofName))) {
                ProofType proofType = poolInfo.proofRequirements[i].proofType;
                if (proofType == ProofType.SELF_AGE_VERIFICATION || proofType == ProofType.SELF_NATIONALITY) {
                    isSelfProofType = true;
                    break;
                }
            }
        }
        if (!isSelfProofType) revert NotSelfProof();
        if (userProofs[msg.sender][_proofName]) revert ProofAlreadySubmitted();
        
        // Generate unique proof hash for Self proofs
        bytes32 uniqueProofHash = keccak256(abi.encodePacked(msg.sender, _proofName, _selfProofHash, address(this)));
        if (globalProofHashes[uniqueProofHash]) revert ProofAlreadyUsed();
        
        userProofs[msg.sender][_proofName] = true;
        userProofHashes[msg.sender][_proofName] = uniqueProofHash;
        globalProofHashes[uniqueProofHash] = true;
        
        emit ProofSubmitted(msg.sender, _proofName, true);
        
        // Check if user has all required proofs
        _checkFullVerification(msg.sender);
    }

    function verifySeller(address _seller, bool _verified, bytes32 _proof) external {
        if (msg.sender != poolInfo.creator) revert OnlyCreator();
        if (!poolInfo.isActive) revert PoolNotActive();
        if (block.timestamp > poolInfo.deadline) revert DeadlinePassed();
        if (!userJoined[_seller]) revert UserNotJoined();
        if (proofVerified[_proof]) revert ProofAlreadyUsed();
        if (userVerified[_seller]) revert ProofAlreadySubmitted();
        if (userHasProven[_seller]) revert ProofAlreadySubmitted();
        
        userVerified[_seller] = _verified;
        userHasProven[_seller] = true; // Mark that user has proven once
        verifiedSellers.push(_seller);
        proofVerified[_proof] = true;
    }

    function _checkFullVerification(address _seller) internal {
        // Check if user has all required proofs
        bool hasAllProofs = true;
        for (uint256 i = 0; i < poolInfo.proofRequirements.length; i++) {
            if (poolInfo.proofRequirements[i].isRequired && 
                !userProofs[_seller][poolInfo.proofRequirements[i].name]) {
                hasAllProofs = false;
                break;
            }
        }
        
        if (hasAllProofs && !userFullyVerified[_seller]) {
            userFullyVerified[_seller] = true;
            if (!userVerified[_seller]) {
                userVerified[_seller] = true;
                verifiedSellers.push(_seller);
            }
            emit SellerFullyVerified(_seller);
        }
    }

    function purchaseData() external payable {
        if (msg.sender != poolInfo.creator) revert OnlyCreator();
        if (!poolInfo.isActive) revert PoolNotActive();
        if (msg.value < poolInfo.pricePerData) revert InsufficientPayment();
        if (joinedSellers.length == 0) revert NoSellersAvailable();
        
        uint256 dataCount = joinedSellers.length;
        uint256 totalCost = poolInfo.pricePerData * dataCount;

        if (address(this).balance < totalCost) revert InsufficientPoolBalance();
        
        poolInfo.remainingBudget -= totalCost;
        totalDataCollected += dataCount;
        
        for (uint256 i = 0; i < joinedSellers.length; i++) {
            (bool success, ) = payable(joinedSellers[i]).call{value: poolInfo.pricePerData}("");
            if (!success) revert InsufficientPoolBalance();
        }

        if(address(this).balance > 0) {
            (bool success, ) = payable(poolInfo.creator).call{value: address(this).balance}("");
            if (!success) revert InsufficientPoolBalance();
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

    function hasUserProven(address _user) external view returns (bool) {
        return userHasProven[_user];
    }

    function isUserFullyVerified(address _user) external view returns (bool) {
        return userFullyVerified[_user];
    }

    function hasUserProof(address _user, string memory _proofName) external view returns (bool) {
        return userProofs[_user][_proofName];
    }

    function getProofRequirements() external view returns (ProofRequirement[] memory) {
        return poolInfo.proofRequirements;
    }


    function getProofType(string memory _proofName) external view returns (ProofType) {
        for (uint256 i = 0; i < poolInfo.proofRequirements.length; i++) {
            if (keccak256(bytes(poolInfo.proofRequirements[i].name)) == keccak256(bytes(_proofName))) {
                return poolInfo.proofRequirements[i].proofType;
            }
        }
        revert ProofNotFound();
    }

    function isSelfProof(string memory _proofName) external view returns (bool) {
        for (uint256 i = 0; i < poolInfo.proofRequirements.length; i++) {
            if (keccak256(bytes(poolInfo.proofRequirements[i].name)) == keccak256(bytes(_proofName))) {
                ProofType proofType = poolInfo.proofRequirements[i].proofType;
                return proofType == ProofType.SELF_AGE_VERIFICATION || proofType == ProofType.SELF_NATIONALITY;
            }
        }
        return false;
    }

    // Helper functions to check user status
    function hasUserJoined(address _user) external view returns (bool) {
        return userJoined[_user];
    }


    function getUserProofStatus(address _user, string memory _proofName) external view returns (bool) {
        return userProofs[_user][_proofName];
    }

    receive() external payable {}
}