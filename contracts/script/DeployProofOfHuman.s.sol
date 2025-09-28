// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { DataFiProof } from "../src/DataFiProof.sol";
import { Script } from "forge-std/Script.sol";
import { CountryCodes } from "@selfxyz/contracts/contracts/libraries/CountryCode.sol";
import { console } from "forge-std/console.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/// @title DeployDataFiProof
/// @notice Deployment script for DataFiProof contract using standard deployment
contract DeployDataFiProof is Script {
    // Custom errors for deployment verification
    error DeploymentFailed();

    /// @notice Main deployment function using standard deployment
    /// @return dataFiProof The deployed DataFiProof contract instance
    /// @dev Requires the following environment variables:
    ///      - IDENTITY_VERIFICATION_HUB_ADDRESS: Address of the Self Protocol verification hub
    ///      - SCOPE_SEED: Scope seed value (defaults to "datafi-verification")

    function run() public returns (DataFiProof dataFiProof) {

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        string[] memory forbiddenCountries = new string[](1);
        
        // Make sure this is the same as frontend config
        forbiddenCountries[0] = CountryCodes.UNITED_STATES;
        SelfUtils.UnformattedVerificationConfigV2 memory verificationConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: forbiddenCountries,
            ofacEnabled: false
        });

        // Deploy the contract using SCOPE_SEED from environment
        dataFiProof = new DataFiProof(hubAddress, scopeSeed, verificationConfig);

        // Log deployment information
        console.log("DataFiProof deployed to:", address(dataFiProof));
        console.log("Identity Verification Hub:", hubAddress);
        console.log("Scope Value:", dataFiProof.scope());

        // Verify deployment was successful
        if (address(dataFiProof) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
        console.log("Scope automatically generated from SCOPE_SEED:", scopeSeed);
        vm.stopBroadcast();
    }
}
