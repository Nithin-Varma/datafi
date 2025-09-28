// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

/**
 * @title DataFiProof
 * @notice Stores Self Protocol verification data for DataFi marketplace
 * @dev Manages user verification data for privacy-preserving data trading
 */
contract DataFiProof is SelfVerificationRoot {
    // Basic storage (for compatibility)
    bool public verificationSuccessful;
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bytes public lastUserData;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    address public lastUserAddress;

    // DataFi specific storage
    struct UserVerificationData {
        string gender;           // "M", "T", or "F"
        string nationality;      // Country code like "IND", "USA", etc.
        bool isAdult;           // true if olderThan >= 18
        uint256 ageThreshold;   // The actual age threshold (18, 21, etc.)
        address walletAddress;  // User wallet address
        bool isVerified;
        uint256 verificationTimestamp;
        string dataType;        // Type of data user can provide (e.g., "email", "social", "identity")
    }

    // Mapping: User Address -> Verification Data
    mapping(address => UserVerificationData) public userVerifications;
    
    // Array to track all verified users
    address[] public verifiedUsers;
    
    // Mapping: User Address -> Data Types they can provide
    mapping(address => string[]) public userDataTypes;
    
    // Events
    event VerificationCompleted(
        ISelfVerificationRoot.GenericDiscloseOutputV2 output,
        bytes userData,
        address userAddress,
        string indexed dataType
    );

    event UserVerificationStored(
        address indexed userAddress,
        string gender,
        string nationality,
        bool isAdult,
        string dataType,
        uint256 timestamp
    );

    event DataTypeAdded(
        address indexed userAddress,
        string indexed dataType
    );

    /**
     * @notice Constructor
     * @param identityVerificationHubV2Address Hub V2 address
     * @param scopeSeed Scope seed for your app
     * @param _verificationConfig Verification requirements
     */
    constructor(
        address identityVerificationHubV2Address,
        string memory scopeSeed, 
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed)
    {
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId =
     IIdentityVerificationHubV2(identityVerificationHubV2Address).setVerificationConfigV2(verificationConfig);
    }

    /**
     * @notice Called when Self Protocol verification succeeds
     * @param output Verification results from Self Protocol
     * @param userData Data type (passed as userDefinedData)
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        // Update basic storage
        verificationSuccessful = true;
        lastOutput = output;
        lastUserData = userData;
        lastUserAddress = address(uint160(output.userIdentifier)); 

        // Extract data type from userData (bytes to string conversion)
        // userData contains the data type string like "email", "social", "identity"
        string memory dataType = string(userData);
        
        // Check if user is adult (olderThan >= 18)
        bool isAdult = output.olderThan >= 18;
        
        // Store verification data by user address
        userVerifications[lastUserAddress] = UserVerificationData({
            gender: output.gender,             // Already comes as "M", "F", or "T"
            nationality: output.nationality,    // Country code like "IND", "USA"
            isAdult: isAdult,                  // true if age >= 18
            ageThreshold: output.olderThan,    // Actual age threshold (18, 21, etc.)
            walletAddress: lastUserAddress,    // User wallet address
            isVerified: true,
            verificationTimestamp: block.timestamp,
            dataType: dataType
        });
        
        // Add user to verified users array if not already present
        if (!isUserInVerifiedArray(lastUserAddress)) {
            verifiedUsers.push(lastUserAddress);
        }

        // Add data type to user's available data types
        if (!isDataTypeAlreadyAdded(lastUserAddress, dataType)) {
            userDataTypes[lastUserAddress].push(dataType);
        }

        // Emit events
        emit VerificationCompleted(output, userData, lastUserAddress, dataType);
        emit UserVerificationStored(
            lastUserAddress,
            output.gender,
            output.nationality,
            isAdult,
            dataType,
            block.timestamp
        );
        emit DataTypeAdded(lastUserAddress, dataType);
    }


    // -------------Internal & helpers-------------

    /**
     * @notice Check if user is already in verified array
     * @param userAddress The user address to check
     * @return exists Whether it exists in the array
     */
    function isUserInVerifiedArray(address userAddress) 
        internal 
        view 
        returns (bool exists) 
    {
        for (uint256 i = 0; i < verifiedUsers.length; i++) {
            if (verifiedUsers[i] == userAddress) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Check if data type is already added for user
     * @param userAddress The user address
     * @param dataType The data type to check
     * @return exists Whether it exists in the user's data types
     */
    function isDataTypeAlreadyAdded(address userAddress, string memory dataType) 
        internal 
        view 
        returns (bool exists) 
    {
        for (uint256 i = 0; i < userDataTypes[userAddress].length; i++) {
            if (keccak256(bytes(userDataTypes[userAddress][i])) == keccak256(bytes(dataType))) {
                return true;
            }
        }
        return false;
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get verification data for multiple users
     * @param userAddresses Array of user addresses
     * @return results Array of verification data
     */
    function getBatchVerificationData(address[] memory userAddresses)
        external
        view
        returns (UserVerificationData[] memory results)
    {
        results = new UserVerificationData[](userAddresses.length);
        for (uint256 i = 0; i < userAddresses.length; i++) {
            results[i] = userVerifications[userAddresses[i]];
        }
        return results;
    }

    /**
     * @notice Get total number of verified users
     * @return count Total verified users
     */
    function getTotalVerifiedCount() external view returns (uint256 count) {
        return verifiedUsers.length;
    }

    /**
     * @notice Get verified user address by index
     * @param index Index in the verified array
     * @return userAddress The user address at that index
     */
    function getVerifiedUserByIndex(uint256 index) 
        external 
        view 
        returns (address userAddress) 
    {
        require(index < verifiedUsers.length, "Index out of bounds");
        return verifiedUsers[index];
    }

    /**
     * @notice Get data types available for a user
     * @param userAddress The user address
     * @return dataTypes Array of data types the user can provide
     */
    function getUserDataTypes(address userAddress) 
        external 
        view 
        returns (string[] memory dataTypes) 
    {
        return userDataTypes[userAddress];
    }

    /**
     * @notice Check if user is verified
     * @param userAddress The user address to check
     * @return isVerified Whether the user is verified
     */
    function isUserVerified(address userAddress) 
        external 
        view 
        returns (bool isVerified) 
    {
        return userVerifications[userAddress].isVerified;
    }

    // ========== INTERNAL FUNCTIONS ==========



    // ========== REQUIRED OVERRIDES ==========

    /**
     * @notice Get config ID for verification
     */
    function getConfigId(
        bytes32 /* destinationChainId */,
        bytes32 /* userIdentifier */,
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }



    /**
     * @notice Update config ID (admin only - add access control if needed)
     * @param configId New config ID
     */
    function setConfigId(bytes32 configId) external {
        verificationConfigId = configId;
    }



}
