// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RangeProofVerifier
 * @notice Verifies ZK range proofs for DID "Verified Mode"
 * @dev Proves balance > threshold without revealing exact balance
 */
contract RangeProofVerifier is Ownable, ReentrancyGuard {
    
    // ============ EVENTS ============
    event RangeProofVerified(
        address indexed user,
        bytes32 indexed balanceCommitment,
        uint256 threshold,
        uint256 timestamp
    );
    
    event ThresholdUpdated(uint256 newThreshold);
    
    // ============ STATE ============
    
    // Default threshold for "Verified Mode" (e.g., 1000 USDC = 1000 * 10^6)
    uint256 public verifiedModeThreshold;
    
    // Users with verified range proofs
    mapping(address => bool) public isVerified;
    
    // Verification timestamps
    mapping(address => uint256) public verificationTimestamp;
    
    // Verification expiry (24 hours by default)
    uint256 public verificationExpiry = 24 hours;
    
    // External Groth16 verifier
    address public groth16Verifier;
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _groth16Verifier, uint256 _threshold) Ownable(msg.sender) {
        groth16Verifier = _groth16Verifier;
        verifiedModeThreshold = _threshold;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Verify a range proof to become a "verified" user
     * @param proofA Groth16 proof point A
     * @param proofB Groth16 proof point B
     * @param proofC Groth16 proof point C
     * @param publicSignals [threshold, balanceCommitment, isAboveThreshold]
     * @return verified True if the proof is valid
     */
    function verifyRangeProof(
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC,
        uint256[3] calldata publicSignals
    ) external nonReentrant returns (bool verified) {
        // ========== CHECKS ==========
        require(publicSignals[0] >= verifiedModeThreshold, "Threshold too low");
        require(publicSignals[2] == 1, "Not above threshold");
        
        // ========== EFFECTS ==========
        isVerified[msg.sender] = true;
        verificationTimestamp[msg.sender] = block.timestamp;
        
        // ========== INTERACTIONS ==========
        verified = _verifyProof(proofA, proofB, proofC, publicSignals);
        require(verified, "Invalid range proof");
        
        emit RangeProofVerified(
            msg.sender,
            bytes32(publicSignals[1]),
            publicSignals[0],
            block.timestamp
        );
        
        return verified;
    }
    
    /**
     * @notice Check if a user is currently verified
     * @param user Address to check
     * @return True if verified and not expired
     */
    function isUserVerified(address user) external view returns (bool) {
        if (!isVerified[user]) return false;
        if (block.timestamp > verificationTimestamp[user] + verificationExpiry) return false;
        return true;
    }
    
    /**
     * @notice Internal proof verification
     */
    function _verifyProof(
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC,
        uint256[3] calldata publicSignals
    ) internal view returns (bool) {
        if (groth16Verifier == address(0)) {
            // Simplified mode for testing
            return proofA[0] != 0 && proofB[0][0] != 0 && proofC[0] != 0;
        }
        
        // Call external Groth16 verifier
        (bool success, bytes memory data) = groth16Verifier.staticcall(
            abi.encodeWithSignature(
                "verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[3])",
                proofA,
                proofB,
                proofC,
                publicSignals
            )
        );
        
        return success && abi.decode(data, (bool));
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function updateThreshold(uint256 _newThreshold) external onlyOwner {
        verifiedModeThreshold = _newThreshold;
        emit ThresholdUpdated(_newThreshold);
    }
    
    function updateExpiry(uint256 _newExpiry) external onlyOwner {
        verificationExpiry = _newExpiry;
    }
    
    function updateVerifier(address _newVerifier) external onlyOwner {
        groth16Verifier = _newVerifier;
    }
}

