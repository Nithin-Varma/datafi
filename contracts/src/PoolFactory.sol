// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Pool.sol";

contract PoolFactory {
    address[] public allPools;
    mapping(address => address[]) public creatorPools;

    event PoolCreated(address indexed creator, address indexed poolAddress, string name);

    function createPool(
        string memory _name,
        string memory _description,
        string memory _dataType,
        uint256 _pricePerData,
        uint256 _totalBudget,
        uint256 _deadline,
        uint256 _owner
    ) external returns (address) {
        require(_pricePerData > 0, "Price must be greater than 0");
        require(_totalBudget > 0, "Budget must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        
        Pool newPool = new Pool(
            _name,
            _description,
            _dataType,
            _pricePerData,
            _totalBudget,
            _deadline,
            _owner
        );
        
        address poolAddress = address(newPool);
        allPools.push(poolAddress);
        creatorPools[msg.sender].push(poolAddress);
        
        emit PoolCreated(msg.sender, poolAddress, _name);
        return poolAddress;
    }

    function joinPool(address _poolAddress) external {
        Pool pool = Pool(payable(_poolAddress));
        pool.joinPool();
    }

    function verifySeller(address _poolAddress, address _seller, bool _verified) external {
        Pool pool = Pool(payable(_poolAddress));
        pool.verifySeller(_seller, _verified);
    }

    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }

    function getCreatorPools(address _creator) external view returns (address[] memory) {
        return creatorPools[_creator];
    }

    function getTotalPools() external view returns (uint256) {
        return allPools.length;
    }

    function getActivePools() external view returns (address[] memory) {
        address[] memory activePools = new address[](allPools.length);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < allPools.length; i++) {
            Pool pool = Pool(payable(allPools[i]));
            Pool.PoolInfo memory poolInfo = pool.getPoolInfo();
            
            if (poolInfo.isActive && block.timestamp <= poolInfo.deadline) {
                activePools[activeCount] = allPools[i];
                activeCount++;
            }
        }
        
        address[] memory result = new address[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activePools[i];
        }
        
        return result;
    }

    function getPoolsByDataType(string memory _dataType) external view returns (address[] memory) {
        address[] memory matchingPools = new address[](allPools.length);
        uint256 matchCount = 0;
        
        for (uint256 i = 0; i < allPools.length; i++) {
            Pool pool = Pool(payable(allPools[i]));
            Pool.PoolInfo memory poolInfo = pool.getPoolInfo();
            if (keccak256(bytes(poolInfo.dataType)) == keccak256(bytes(_dataType))) {
                matchingPools[matchCount] = allPools[i];
                matchCount++;
            }
        }
        
        address[] memory result = new address[](matchCount);
        for (uint256 i = 0; i < matchCount; i++) {
            result[i] = matchingPools[i];
        }
        
        return result;
    }
}