// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./PoolFactory.sol";

contract User {
    address public owner;
    address[] public createdPools;
    address[] public joinedPools;
    uint256 public totalSpent;
    uint256 public totalEarned;
    address public poolFactory;
    PoolFactory public factory;

    event PoolCreated(address indexed poolAddress);
    event PoolJoined(address indexed poolAddress);

    constructor(address _owner, address _poolFactory) {
        owner = _owner;
        poolFactory = _poolFactory;
        factory = PoolFactory(poolFactory);
    }

    function createPool(
        string memory _name,
        string memory _description,
        string memory _dataType,
        uint256 _pricePerData,
        uint256 _totalBudget,
        uint256 _deadline
    ) external returns (address) {
        require(msg.sender == owner, "Only owner can create pools");
        
        address poolAddress = factory.createPool(
            _name,
            _description,
            _dataType,
            _pricePerData,
            _totalBudget,
            _deadline
        );
        
        createdPools.push(poolAddress);
        emit PoolCreated(poolAddress);
        
        return poolAddress;
    }

    function joinPool(address _poolAddress) external {
        require(msg.sender == owner, "Only owner can join pools");
        factory.joinPool(_poolAddress);
        joinedPools.push(_poolAddress);
        emit PoolJoined(_poolAddress);
    }

    function verifySeller(address _poolAddress, address _seller, bool _verified) external {
        require(msg.sender == owner, "Only owner can verify sellers");
        factory.verifySeller(_poolAddress, _seller, _verified);
    }

    function recordSpending(uint256 _amount) external {
        totalSpent += _amount;
    }

    function recordEarning(uint256 _amount) external {
        totalEarned += _amount;
    }

    function getCreatedPools() external view returns (address[] memory) {
        return createdPools;
    }

    function getJoinedPools() external view returns (address[] memory) {
        return joinedPools;
    }

    function getCreatedPoolsCount() external view returns (uint256) {
        return createdPools.length;
    }

    function getJoinedPoolsCount() external view returns (uint256) {
        return joinedPools.length;
    }

    receive() external payable {}
}