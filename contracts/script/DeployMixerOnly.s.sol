// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {KatrinaDEXMixer} from "../src/Mixer.sol";
import {KatrinaDEXRelayer} from "../src/Relayer.sol";

contract DeployMixerOnly is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Arc Testnet Config
        address usdcAddress = 0x3600000000000000000000000000000000000000;
        address eurcAddress = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;
        
        // REUSE DEPLOYED VERIFIER to save gas
        address verifier = 0xcF3139fce035898499078E4b746868fda8291fFA;

        // Pool Sizes
        uint256[] memory ethPools = new uint256[](4);
        ethPools[0] = 10 ether;
        ethPools[1] = 100 ether;
        ethPools[2] = 1000 ether;
        ethPools[3] = 10000 ether;
        
        uint256[] memory usdcPools = new uint256[](6);
        usdcPools[0] = 10 * 1e18; usdcPools[1] = 100 * 1e18; usdcPools[2] = 500 * 1e18; 
        usdcPools[3] = 1000 * 1e18; usdcPools[4] = 5000 * 1e18; usdcPools[5] = 10000 * 1e18;
        
        uint256[] memory eurcPools = new uint256[](6);
        eurcPools[0] = 10000000; eurcPools[1] = 100000000; eurcPools[2] = 500000000; 
        eurcPools[3] = 1000000000; eurcPools[4] = 5000000000; eurcPools[5] = 10000000000;

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Mixer using the SAME verifier for both to save gas
        // This is a temporary hack for testnet due to low funds
        KatrinaDEXMixer mixer = new KatrinaDEXMixer(
            verifier, // MixerVerifier
            verifier, // LicitProofVerifier (reused)
            usdcAddress,
            eurcAddress,
            ethPools,
            usdcPools,
            eurcPools
        );
        console.log("KatrinaDEXMixer deployed at:", address(mixer));

        // Deploy relayer
        // KatrinaDEXRelayer relayer = new KatrinaDEXRelayer(address(mixer), usdcAddress, eurcAddress);
        // console.log("KatrinaDEXRelayer deployed at:", address(relayer));

        vm.stopBroadcast();
    }
}

