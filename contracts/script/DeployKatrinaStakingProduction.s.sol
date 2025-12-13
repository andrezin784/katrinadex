// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {KatrinaStaking} from "../src/KatrinaStaking.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DeployKatrinaStakingProduction is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 chainId = block.chainid;
        
        address tokenAddress;
        
        // Get token address based on chain
        if (chainId == 84532) { // Base Sepolia
            tokenAddress = 0xA0b86a33E6441e88C5F2712C3e9b74B6e44e8e77; // USDC
            console.log("Deploying to Base Sepolia");
        } else if (chainId == 5042002) { // Arc Testnet
            tokenAddress = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a; // EURC (or use USDC native)
            console.log("Deploying to Arc Testnet");
        } else {
            revert("Unsupported chain");
        }
        
        console.log("Token address:", tokenAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy staking contract
        KatrinaStaking staking = new KatrinaStaking(tokenAddress);
        console.log("KatrinaStaking deployed at:", address(staking));
        
        vm.stopBroadcast();
        
        console.log("\n=== KATRINA STAKING DEPLOYMENT SUMMARY ===");
        console.log("Chain ID:", chainId);
        console.log("Token:", tokenAddress);
        console.log("KatrinaStaking:", address(staking));
        console.log("==========================================");
        console.log("\nIMPORTANT: Fund the staking contract with tokens for rewards!");
        console.log("   Use: token.transfer(stakingAddress, amount)");
        console.log("==========================================");
    }
}

