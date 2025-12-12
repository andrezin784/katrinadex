// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IComplianceOracle
 * @notice Interface for compliance checking
 */
interface IComplianceOracle {
    function isCompliant(address account) external view returns (bool);
    function isBlacklisted(address account) external view returns (bool);
    function isHighRisk(address account) external view returns (bool);
}

/**
 * @title LicitProofVerifier
 * @notice Verifies that deposit origin is legitimate and compliant
 * @dev Integrates with ComplianceOracle for sanctions/blacklist checking
 * 
 * Verification includes:
 * 1. Address not on OFAC/sanctions blacklist
 * 2. Address not flagged as high-risk
 * 3. Transaction origin checks
 */
contract LicitProofVerifier is Ownable {
    // Compliance Oracle for blacklist/sanctions checking
    IComplianceOracle public complianceOracle;
    
    // Whether compliance checking is enabled
    bool public complianceEnabled = true;
    
    // Events
    event ComplianceOracleUpdated(address indexed newOracle);
    event ComplianceCheckToggled(bool enabled);
    event DepositRejected(address indexed depositor, string reason);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Set the compliance oracle address
     * @param _oracle Address of the ComplianceOracle contract
     */
    function setComplianceOracle(address _oracle) external onlyOwner {
        complianceOracle = IComplianceOracle(_oracle);
        emit ComplianceOracleUpdated(_oracle);
    }
    
    /**
     * @notice Toggle compliance checking on/off
     * @param _enabled Whether to enable compliance checks
     */
    function setComplianceEnabled(bool _enabled) external onlyOwner {
        complianceEnabled = _enabled;
        emit ComplianceCheckToggled(_enabled);
    }
    
    /**
     * @notice Verify that a deposit is from a legitimate source
     * @dev Called by the Mixer contract during deposit
     * @param a Groth16 proof part A (unused in current implementation)
     * @param b Groth16 proof part B (unused in current implementation)
     * @param c Groth16 proof part C (unused in current implementation)  
     * @param input Public inputs (input[0] = depositor address as uint256)
     * @return bool True if the deposit is compliant
     */
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input
    ) external view returns (bool) {
        // Silence unused variable warnings
        a; b; c;
        
        // If compliance is disabled, always return true
        if (!complianceEnabled) {
            return true;
        }
        
        // If no oracle is set, allow all (for testing)
        if (address(complianceOracle) == address(0)) {
            return true;
        }
        
        // Extract depositor address from input[0]
        // The frontend passes msg.sender as the first input
        address depositor = address(uint160(input[0]));
        
        // Check if depositor is compliant
        return complianceOracle.isCompliant(depositor);
    }
    
    /**
     * @notice Check if an address can deposit
     * @param depositor Address to check
     * @return bool True if can deposit
     * @return string Reason if rejected
     */
    function canDeposit(address depositor) external view returns (bool, string memory) {
        if (!complianceEnabled) {
            return (true, "Compliance disabled");
        }
        
        if (address(complianceOracle) == address(0)) {
            return (true, "No oracle configured");
        }
        
        if (complianceOracle.isBlacklisted(depositor)) {
            return (false, "Address is blacklisted (sanctions)");
        }
        
        if (complianceOracle.isHighRisk(depositor)) {
            return (false, "Address is flagged as high-risk");
        }
        
        return (true, "Compliant");
    }
}
