// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Pool {
    // Simplified errors
    error InvalidAction();
    error AccessDenied();
    error InsufficientFunds();

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
    mapping(address => mapping(string => bool)) public userProofs; // Track which proofs user has provided
    mapping(address => bool) public userFullyVerified; // Track if user has all required proofs
    mapping(address => mapping(string => bytes32)) public userProofHashes; // Track unique proof hashes per user
    mapping(bytes32 => bool) public globalProofHashes; // Track global proof hashes to prevent duplicates
    uint256 public totalDataCollected;

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
        require(msg.sender != poolInfo.creator && poolInfo.isActive && !userJoined[msg.sender], "Invalid");
        userJoined[msg.sender] = true;
        joinedSellers.push(msg.sender);
        emit SellerJoined(msg.sender);
    }

    function joinPoolBySender(address _sender) external {
        require(_sender != poolInfo.creator && poolInfo.isActive && !userJoined[_sender], "Invalid");
        userJoined[_sender] = true;
        joinedSellers.push(_sender);
        emit SellerJoined(_sender);
    }

    function submitProof(string memory _proofName, bytes32 _proofHash) external {
        require(poolInfo.isActive && userJoined[msg.sender] && !userFullyVerified[msg.sender], "Invalid");
        require(!userProofs[msg.sender][_proofName], "Already submitted");

        // Check if this proof is required for the pool
        bool isRequiredProof = false;
        for (uint256 i = 0; i < poolInfo.proofRequirements.length; i++) {
            if (keccak256(bytes(poolInfo.proofRequirements[i].name)) == keccak256(bytes(_proofName))) {
                isRequiredProof = true;
                break;
            }
        }
        require(isRequiredProof, "Proof not required");

        // Generate unique proof hash to prevent reuse
        bytes32 uniqueProofHash = keccak256(abi.encodePacked(msg.sender, _proofName, _proofHash, address(this)));
        require(!globalProofHashes[uniqueProofHash], "Proof already used");

        userProofs[msg.sender][_proofName] = true;
        userProofHashes[msg.sender][_proofName] = uniqueProofHash;
        globalProofHashes[uniqueProofHash] = true;

        emit ProofSubmitted(msg.sender, _proofName, true);
        _checkFullVerification(msg.sender);
    }

    function submitProofBySender(address _sender, string memory _proofName, bytes32 _proofHash) external {
        require(poolInfo.isActive && userJoined[_sender] && !userFullyVerified[_sender], "Invalid");
        require(!userProofs[_sender][_proofName], "Already submitted");

        // Check if this proof is required for the pool
        bool isRequiredProof = false;
        for (uint256 i = 0; i < poolInfo.proofRequirements.length; i++) {
            if (keccak256(bytes(poolInfo.proofRequirements[i].name)) == keccak256(bytes(_proofName))) {
                isRequiredProof = true;
                break;
            }
        }
        require(isRequiredProof, "Proof not required");

        // Generate unique proof hash to prevent reuse
        bytes32 uniqueProofHash = keccak256(abi.encodePacked(_sender, _proofName, _proofHash, address(this)));
        require(!globalProofHashes[uniqueProofHash], "Proof already used");

        userProofs[_sender][_proofName] = true;
        userProofHashes[_sender][_proofName] = uniqueProofHash;
        globalProofHashes[uniqueProofHash] = true;

        emit ProofSubmitted(_sender, _proofName, true);
        _checkFullVerification(_sender);
    }

    function submitSelfProof(string memory _proofName, bytes32 _selfProofHash) external {
        require(poolInfo.isActive && userJoined[msg.sender] && !userFullyVerified[msg.sender], "Invalid");
        require(!userProofs[msg.sender][_proofName], "Already submitted");

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
        require(isSelfProofType, "Not a Self proof");

        // Generate unique proof hash for Self proofs
        bytes32 uniqueProofHash = keccak256(abi.encodePacked(msg.sender, _proofName, _selfProofHash, address(this)));
        require(!globalProofHashes[uniqueProofHash], "Proof already used");

        userProofs[msg.sender][_proofName] = true;
        userProofHashes[msg.sender][_proofName] = uniqueProofHash;
        globalProofHashes[uniqueProofHash] = true;

        emit ProofSubmitted(msg.sender, _proofName, true);
        _checkFullVerification(msg.sender);
    }

    function submitSelfProofBySender(address _sender, string memory _proofName, bytes32 _selfProofHash) external {
        require(poolInfo.isActive && userJoined[_sender] && !userFullyVerified[_sender], "Invalid");
        require(!userProofs[_sender][_proofName], "Already submitted");

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
        require(isSelfProofType, "Not a Self proof");

        // Generate unique proof hash for Self proofs
        bytes32 uniqueProofHash = keccak256(abi.encodePacked(_sender, _proofName, _selfProofHash, address(this)));
        require(!globalProofHashes[uniqueProofHash], "Proof already used");

        userProofs[_sender][_proofName] = true;
        userProofHashes[_sender][_proofName] = uniqueProofHash;
        globalProofHashes[uniqueProofHash] = true;

        emit ProofSubmitted(_sender, _proofName, true);
        _checkFullVerification(_sender);
    }

    function verifySeller(address _seller, bool _verified, bytes32 _proof) external {
        require(msg.sender == poolInfo.creator && poolInfo.isActive, "Access denied");
        userVerified[_seller] = _verified;
        verifiedSellers.push(_seller);
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

            // Automatically transfer payment to verified seller
            _transferPaymentToSeller(_seller);
        }
    }

    function _transferPaymentToSeller(address _seller) internal {
        if (poolInfo.remainingBudget >= poolInfo.pricePerData) {
            poolInfo.remainingBudget -= poolInfo.pricePerData;
            totalDataCollected += 1;
            (bool success, ) = payable(_seller).call{value: poolInfo.pricePerData}("");
            require(success, "Payment failed");
            emit DataPurchased(poolInfo.creator, poolInfo.pricePerData, 1);
        }
    }

    function purchaseData() external payable {
        require(msg.sender == poolInfo.creator && poolInfo.isActive, "Access denied");
        uint256 dataCount = joinedSellers.length;
        uint256 totalCost = poolInfo.pricePerData * dataCount;
        poolInfo.remainingBudget -= totalCost;
        totalDataCollected += dataCount;
        for (uint256 i = 0; i < joinedSellers.length; i++) {
            payable(joinedSellers[i]).call{value: poolInfo.pricePerData}("");
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

    function hasUserJoined(address _user) external view returns (bool) {
        return userJoined[_user];
    }

    function isUserFullyVerified(address _user) external view returns (bool) {
        return userFullyVerified[_user];
    }

    function getUserProofStatus(address _user, string memory _proofName) external view returns (bool) {
        return userProofs[_user][_proofName];
    }

    function getProofRequirements() external view returns (ProofRequirement[] memory) {
        return poolInfo.proofRequirements;
    }

    function getVerifiedSellers() external view returns (address[] memory) {
        return verifiedSellers;
    }

    function getVerifiedSellersCount() external view returns (uint256) {
        return verifiedSellers.length;
    }

    receive() external payable {}
}