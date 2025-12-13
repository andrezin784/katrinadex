// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {KatrinaDEXMixer} from "../src/Mixer.sol";
import {LicitProofVerifier} from "../src/LicitProofVerifier.sol";
import {ComplianceOracle} from "../src/ComplianceOracle.sol";
import {KatrinaDEXRelayer} from "../src/Relayer.sol";

contract DeployKatrinaDEX is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        address usdcAddress;
        address eurcAddress;
        uint256 chainId = block.chainid;
        uint256[] memory ethPools = new uint256[](5);
        uint256[] memory usdcPools = new uint256[](6);
        uint256[] memory eurcPools = new uint256[](6);

        if (chainId == 84532) { // Base Sepolia
            usdcAddress = 0xA0b86a33E6441e88C5F2712C3e9b74B6e44e8e77;
            eurcAddress = address(0); // No EURC on Base Sepolia
            console.log("Deploying to Base Sepolia");
            
            // ETH pools (18 decimals)
            ethPools[0] = 0.01 ether;
            ethPools[1] = 0.1 ether;
            ethPools[2] = 0.5 ether;
            ethPools[3] = 1 ether;
            ethPools[4] = 5 ether;
            
            // USDC pools (6 decimals)
            usdcPools[0] = 10000000;       // 10 USDC
            usdcPools[1] = 100000000;      // 100 USDC
            usdcPools[2] = 500000000;      // 500 USDC
            usdcPools[3] = 1000000000;     // 1,000 USDC
            usdcPools[4] = 5000000000;     // 5,000 USDC
            usdcPools[5] = 10000000000;    // 10,000 USDC
            
            // EURC pools (empty for Base Sepolia)
            eurcPools = new uint256[](0);
            
        } else if (chainId == 5042002) { // Arc Testnet
            // USDC nativo (18 decimals) - usado para approve/deposit
            usdcAddress = 0x3600000000000000000000000000000000000000;
            // EURC ERC20 (6 decimals)
            eurcAddress = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;
            console.log("Deploying to Arc Testnet");
            
            // Native token (USDC with 18 decimals) - pools: 10, 100, 1000, 10000
            ethPools = new uint256[](4);
            ethPools[0] = 10 ether;      // 10 USDC
            ethPools[1] = 100 ether;     // 100 USDC
            ethPools[2] = 1000 ether;    // 1,000 USDC
            ethPools[3] = 10000 ether;   // 10,000 USDC
            
            // USDC native (18 decimals) - Note: Arc uses USDC as native with 18 decimals
            usdcPools[0] = 10 * 1e18;        // 10 USDC
            usdcPools[1] = 100 * 1e18;       // 100 USDC
            usdcPools[2] = 500 * 1e18;       // 500 USDC
            usdcPools[3] = 1000 * 1e18;      // 1,000 USDC
            usdcPools[4] = 5000 * 1e18;      // 5,000 USDC
            usdcPools[5] = 10000 * 1e18;     // 10,000 USDC
            
            // EURC pools (6 decimals)
            eurcPools[0] = 10000000;       // 10 EURC
            eurcPools[1] = 100000000;      // 100 EURC
            eurcPools[2] = 500000000;      // 500 EURC
            eurcPools[3] = 1000000000;     // 1,000 EURC
            eurcPools[4] = 5000000000;     // 5,000 EURC
            eurcPools[5] = 10000000000;    // 10,000 EURC
            
        } else {
            console.log("Warning: Unknown chain ID:", chainId);
            // Default to Base Sepolia configuration
            usdcAddress = 0xA0b86a33E6441e88C5F2712C3e9b74B6e44e8e77;
            eurcAddress = address(0);
            
            ethPools[0] = 0.01 ether;
            ethPools[1] = 0.1 ether;
            ethPools[2] = 0.5 ether;
            ethPools[3] = 1 ether;
            ethPools[4] = 5 ether;
            
            usdcPools[0] = 10000000;       // 10 USDC
            usdcPools[1] = 100000000;      // 100 USDC
            usdcPools[2] = 500000000;      // 500 USDC
            usdcPools[3] = 1000000000;     // 1,000 USDC
            usdcPools[4] = 5000000000;     // 5,000 USDC
            usdcPools[5] = 10000000000;    // 10,000 USDC
            
            eurcPools = new uint256[](0);
        }

        console.log("USDC Address:", usdcAddress);
        console.log("EURC Address:", eurcAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Use existing verifiers (already deployed and verified)
        address mixerVerifierAddress;
        address licitProofVerifierAddress;
        
        if (chainId == 84532) { // Base Sepolia
            mixerVerifierAddress = 0x0b1e0846c410e81E1901f58032805FE7D8119E66;
            licitProofVerifierAddress = 0xF8061fFd76F27ca74294B943c0150751Ed881898;
        } else if (chainId == 5042002) { // Arc Testnet
            mixerVerifierAddress = 0xF53F0115dd476fab6Bf3F58B33Ad6f88402f23C7;
            licitProofVerifierAddress = 0xD3CfF6CB9308d6e20E2c07d6258491e8e019cFff;
        } else {
            revert("Unknown chain ID");
        }

        console.log("Using existing MixerVerifier at:", mixerVerifierAddress);
        console.log("Using existing LicitProofVerifier at:", licitProofVerifierAddress);

        // 1. Deploy ComplianceOracle (for sanctions/blacklist checking)
        ComplianceOracle complianceOracle = new ComplianceOracle();
        console.log("ComplianceOracle deployed at:", address(complianceOracle));

        // 2. Update LicitProofVerifier to use new ComplianceOracle
        // Note: This requires the verifier to have setComplianceOracle function
        // If it doesn't, we'll need to deploy a new LicitProofVerifier
        try LicitProofVerifier(licitProofVerifierAddress).setComplianceOracle(address(complianceOracle)) {
            console.log("LicitProofVerifier configured with new ComplianceOracle");
        } catch {
            console.log("Warning: Could not update LicitProofVerifier. Using existing configuration.");
        }

        // 3. Deploy mixer with pool sizes
        KatrinaDEXMixer mixer = new KatrinaDEXMixer(
            mixerVerifierAddress,
            licitProofVerifierAddress,
            usdcAddress,
            eurcAddress,
            ethPools,
            usdcPools,
            eurcPools
        );
        console.log("KatrinaDEXMixer deployed at:", address(mixer));

        // 4. Deploy relayer
        KatrinaDEXRelayer relayer = new KatrinaDEXRelayer(address(mixer), usdcAddress, eurcAddress);
        console.log("KatrinaDEXRelayer deployed at:", address(relayer));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== KATRINADEX DEPLOYMENT SUMMARY ===");
        console.log("Chain ID:", chainId);
        console.log("ComplianceOracle:", address(complianceOracle));
        console.log("MixerVerifier (existing):", mixerVerifierAddress);
        console.log("LicitProofVerifier (existing):", licitProofVerifierAddress);
        console.log("KatrinaDEXMixer (NEW):", address(mixer));
        console.log("KatrinaDEXRelayer (NEW):", address(relayer));
        console.log("=====================================");
        console.log("\n=== COMPLIANCE COMMANDS ===");
        console.log("Blacklist: cast send <ORACLE> 'addToBlacklist(address,string)' <ADDR> 'reason'");
        console.log("Whitelist: cast send <ORACLE> 'addToWhitelist(address)' <ADDR>");
        console.log("Check: cast call <ORACLE> 'isCompliant(address)' <ADDR>");
        console.log("=====================================");
    }
}
