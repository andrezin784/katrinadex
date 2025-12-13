// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {KatrinaStaking} from "../src/KatrinaStaking.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 for local testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Test Token", "TEST") {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract DeployKatrinaStaking is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy mock token for testing
        MockERC20 token = new MockERC20();
        console.log("MockERC20 deployed at:", address(token));
        
        // Deploy staking contract
        KatrinaStaking staking = new KatrinaStaking(address(token));
        console.log("KatrinaStaking deployed at:", address(staking));
        
        // Mint tokens to staking contract for rewards
        token.mint(address(staking), 100000 * 10**18);
        console.log("Minted 100,000 tokens to staking contract for rewards");
        
        vm.stopBroadcast();
        
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Token:", address(token));
        console.log("Staking:", address(staking));
        console.log("===========================");
        console.log("\n=== TEST COMMANDS ===");
        console.log("1. Add pool:");
        console.log("   cast send", address(staking), "'addPool(uint256)' 1000000000000000 --rpc-url http://localhost:8545 --private-key <KEY>");
        console.log("\n2. Approve tokens:");
        console.log("   cast send", address(token), "'approve(address,uint256)'", address(staking), "1000000000000000000000 --rpc-url http://localhost:8545 --private-key <KEY>");
        console.log("\n3. Stake tokens:");
        console.log("   cast send", address(staking), "'stake(uint256,uint256)' 0 1000000000000000000000 --rpc-url http://localhost:8545 --private-key <KEY>");
        console.log("\n4. Check reward:");
        console.log("   cast call", address(staking), "'calculateReward(address,uint256)' <USER_ADDRESS> 0 --rpc-url http://localhost:8545");
        console.log("\n5. Claim rewards:");
        console.log("   cast send", address(staking), "'claim(uint256)' 0 --rpc-url http://localhost:8545 --private-key <KEY>");
        console.log("=====================");
    }
}

