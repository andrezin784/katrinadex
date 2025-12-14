// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {PrivateSwapVerifier} from "../src/PrivateSwapVerifier.sol";
import {RangeProofVerifier} from "../src/RangeProofVerifier.sol";
import {DIDRegistry} from "../src/DIDRegistry.sol";

contract DeployPrivacyFeatures is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        uint256 chainId = block.chainid;
        console.log("Deploying Privacy Features to chain:", chainId);

        // Deploy PrivateSwapVerifier
        // groth16Verifier = address(0) for now (simplified mode)
        PrivateSwapVerifier privateSwapVerifier = new PrivateSwapVerifier(address(0));
        console.log("PrivateSwapVerifier deployed at:", address(privateSwapVerifier));

        // Deploy RangeProofVerifier
        // groth16Verifier = address(0), threshold = 10000 USDC (10000 * 10^6)
        uint256 threshold = 10000 * 1e6; // $10,000 USDC
        RangeProofVerifier rangeProofVerifier = new RangeProofVerifier(address(0), threshold);
        console.log("RangeProofVerifier deployed at:", address(rangeProofVerifier));
        console.log("Verified Mode threshold:", threshold);

        // Deploy DIDRegistry
        DIDRegistry didRegistry = new DIDRegistry();
        console.log("DIDRegistry deployed at:", address(didRegistry));

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Chain ID:", chainId);
        console.log("PrivateSwapVerifier:", address(privateSwapVerifier));
        console.log("RangeProofVerifier:", address(rangeProofVerifier));
        console.log("DIDRegistry:", address(didRegistry));
        console.log("===========================");
        console.log("\nUpdate contracts.ts with these addresses!");
    }
}

