// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {GaslessRelayer} from "../src/GaslessRelayer.sol";

contract DeployGaslessRelayer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Configuração por chain
        uint256 chainId = block.chainid;
        
        address mixer;
        address treasury;
        uint256[] memory poolAmounts;
        
        if (chainId == 84532) {
            // Base Sepolia
            mixer = 0x46f123107B2E4f9042de8c6Fb8762f8824ef90f4;
            treasury = 0x4D149a54658d310C9487671d868A4ce0B6fdEd96; // Protocol owner
            // Pool amounts: 0.01 ETH, 0.1 ETH, 0.5 ETH, 1 ETH, 5 ETH
            // E: 10 USDC, 100 USDC, 500 USDC, 1000 USDC, 5000 USDC, 10000 USDC
            poolAmounts = new uint256[](11);
            poolAmounts[0] = 0.01 ether;
            poolAmounts[1] = 0.1 ether;
            poolAmounts[2] = 0.5 ether;
            poolAmounts[3] = 1 ether;
            poolAmounts[4] = 5 ether;
            poolAmounts[5] = 10 * 1e6; // 10 USDC (6 decimals)
            poolAmounts[6] = 100 * 1e6; // 100 USDC
            poolAmounts[7] = 500 * 1e6; // 500 USDC
            poolAmounts[8] = 1000 * 1e6; // 1000 USDC
            poolAmounts[9] = 5000 * 1e6; // 5000 USDC
            poolAmounts[10] = 10000 * 1e6; // 10000 USDC
        } else if (chainId == 5042002) {
            // Arc Testnet
            mixer = 0x3441cF331Cb75c6BBCa7a34718224C7983eF4636;
            treasury = 0x4D149a54658d310C9487671d868A4ce0B6fdEd96;
            // Pool amounts: 10 USDC (native, 18 decimals), 100, 1000, 10000
            // E: 10 EURC, 100, 500, 1000, 5000, 10000 (6 decimals)
            poolAmounts = new uint256[](10);
            poolAmounts[0] = 10 ether; // 10 USDC native
            poolAmounts[1] = 100 ether; // 100 USDC native
            poolAmounts[2] = 1000 ether; // 1000 USDC native
            poolAmounts[3] = 10000 ether; // 10000 USDC native
            poolAmounts[4] = 10 * 1e6; // 10 EURC
            poolAmounts[5] = 100 * 1e6; // 100 EURC
            poolAmounts[6] = 500 * 1e6; // 500 EURC
            poolAmounts[7] = 1000 * 1e6; // 1000 EURC
            poolAmounts[8] = 5000 * 1e6; // 5000 EURC
            poolAmounts[9] = 10000 * 1e6; // 10000 EURC
        } else {
            revert("Unsupported chain");
        }

        console.log("Deploying GaslessRelayer...");
        console.log("Mixer:", mixer);
        console.log("Treasury:", treasury);
        console.log("Chain ID:", chainId);

        // Deploy GaslessRelayer
        GaslessRelayer relayer = new GaslessRelayer(mixer, treasury);
        console.log("GaslessRelayer deployed at:", address(relayer));

        // Whitelist pool amounts
        console.log("Whitelisting pool amounts...");
        relayer.batchWhitelistPoolAmounts(poolAmounts, true);
        console.log("Pool amounts whitelisted");

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("GaslessRelayer:", address(relayer));
        console.log("Mixer:", mixer);
        console.log("Treasury:", treasury);
        console.log("Pool amounts whitelisted:", poolAmounts.length);
    }
}

