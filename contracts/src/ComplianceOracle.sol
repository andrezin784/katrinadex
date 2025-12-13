// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ComplianceOracle
 * @notice On-chain compliance verification for KatrinaDEX
 * @dev Maintains blacklists and verifies addresses are not sanctioned
 * 
 * This contract checks:
 * 1. Global blacklist (OFAC, sanctioned addresses)
 * 2. Protocol-specific blacklist (scammers, exploiters)
 * 3. High-risk address detection
 */
contract ComplianceOracle is Ownable {
    // Mapping of blacklisted addresses
    mapping(address => bool) public isBlacklisted;
    
    // Mapping of high-risk addresses (requires additional verification)
    mapping(address => bool) public isHighRisk;
    
    // Mapping of whitelisted addresses (bypass checks)
    mapping(address => bool) public isWhitelisted;
    
    // Total blacklisted count
    uint256 public blacklistCount;
    
    // Events
    event AddressBlacklisted(address indexed account, string reason);
    event AddressRemovedFromBlacklist(address indexed account);
    event AddressMarkedHighRisk(address indexed account, string reason);
    event AddressWhitelisted(address indexed account);
    event AddressRemovedFromWhitelist(address indexed account);
    
    // Known sanctioned addresses (examples - would be populated with real OFAC data)
    // These are example addresses for demonstration
    
    constructor() Ownable(msg.sender) {
        // Initialize with known bad actors (examples)
        // In production, this would be populated from OFAC SDN list
    }
    
    /**
     * @notice Check if an address is compliant (can use the protocol)
     * @param account The address to check
     * @return bool True if compliant, false otherwise
     */
    function isCompliant(address account) external view returns (bool) {
        // Whitelisted addresses always pass
        if (isWhitelisted[account]) {
            return true;
        }
        
        // Blacklisted addresses always fail
        if (isBlacklisted[account]) {
            return false;
        }
        
        // High-risk addresses fail (could be changed to require additional checks)
        if (isHighRisk[account]) {
            return false;
        }
        
        // Default: compliant
        return true;
    }
    
    /**
     * @notice Add address to blacklist
     * @param account Address to blacklist
     * @param reason Reason for blacklisting
     */
    function addToBlacklist(address account, string calldata reason) external onlyOwner {
        require(!isBlacklisted[account], "Already blacklisted");
        isBlacklisted[account] = true;
        blacklistCount++;
        emit AddressBlacklisted(account, reason);
    }
    
    /**
     * @notice Add multiple addresses to blacklist
     * @param accounts Array of addresses to blacklist
     * @param reason Reason for blacklisting
     */
    function addBatchToBlacklist(address[] calldata accounts, string calldata reason) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (!isBlacklisted[accounts[i]]) {
                isBlacklisted[accounts[i]] = true;
                blacklistCount++;
                emit AddressBlacklisted(accounts[i], reason);
            }
        }
    }
    
    /**
     * @notice Remove address from blacklist
     * @param account Address to remove
     */
    function removeFromBlacklist(address account) external onlyOwner {
        require(isBlacklisted[account], "Not blacklisted");
        isBlacklisted[account] = false;
        blacklistCount--;
        emit AddressRemovedFromBlacklist(account);
    }
    
    /**
     * @notice Mark address as high risk
     * @param account Address to mark
     * @param reason Reason for marking
     */
    function markHighRisk(address account, string calldata reason) external onlyOwner {
        isHighRisk[account] = true;
        emit AddressMarkedHighRisk(account, reason);
    }
    
    /**
     * @notice Remove high risk status
     * @param account Address to update
     */
    function removeHighRisk(address account) external onlyOwner {
        isHighRisk[account] = false;
    }
    
    /**
     * @notice Add address to whitelist
     * @param account Address to whitelist
     */
    function addToWhitelist(address account) external onlyOwner {
        isWhitelisted[account] = true;
        emit AddressWhitelisted(account);
    }
    
    /**
     * @notice Remove address from whitelist
     * @param account Address to remove
     */
    function removeFromWhitelist(address account) external onlyOwner {
        isWhitelisted[account] = false;
        emit AddressRemovedFromWhitelist(account);
    }
    
    /**
     * @notice Check multiple addresses at once
     * @param accounts Array of addresses to check
     * @return results Array of compliance results
     */
    function batchCheck(address[] calldata accounts) external view returns (bool[] memory results) {
        results = new bool[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            results[i] = this.isCompliant(accounts[i]);
        }
        return results;
    }
}



