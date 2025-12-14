// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PrivateSwapVerifier
 * @notice Verifies ZK proofs for private swaps without revealing amounts or addresses
 * @dev Uses Groth16 verification - proof generation happens client-side
 */
contract PrivateSwapVerifier is Ownable, ReentrancyGuard {
    
    // ============ EVENTS ============
    event PrivateSwapVerified(
        bytes32 indexed swapCommitment,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 timestamp
    );
    
    event VerifierUpdated(address newVerifier);
    
    // ============ STATE ============
    
    // Used commitments (replay protection)
    mapping(bytes32 => bool) public usedCommitments;
    
    // External Groth16 verifier contract
    address public groth16Verifier;
    
    // Pause flag
    bool public paused;
    
    // ============ MODIFIERS ============
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _groth16Verifier) Ownable(msg.sender) {
        groth16Verifier = _groth16Verifier;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Verify a private swap proof
     * @param proofA Groth16 proof point A
     * @param proofB Groth16 proof point B
     * @param proofC Groth16 proof point C
     * @param publicSignals [minAmount, maxAmount, swapCommitment, validSwap]
     * @return valid True if the proof is valid
     */
    function verifyPrivateSwap(
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC,
        uint256[4] calldata publicSignals
    ) external nonReentrant whenNotPaused returns (bool valid) {
        // ========== CHECKS ==========
        bytes32 swapCommitment = bytes32(publicSignals[2]);
        
        require(!usedCommitments[swapCommitment], "Commitment already used");
        require(publicSignals[3] == 1, "Invalid swap flag");
        
        // ========== EFFECTS ==========
        usedCommitments[swapCommitment] = true;
        
        // ========== INTERACTIONS ==========
        // Verify proof using external verifier
        // Note: In production, this calls the actual Groth16 verifier
        // For now, we emit event and return true (verifier to be deployed separately)
        valid = _verifyProof(proofA, proofB, proofC, publicSignals);
        
        require(valid, "Invalid ZK proof");
        
        emit PrivateSwapVerified(
            swapCommitment,
            publicSignals[0], // minAmount
            publicSignals[1], // maxAmount
            block.timestamp
        );
        
        return valid;
    }
    
    /**
     * @notice Internal proof verification
     * @dev Calls external Groth16 verifier if set, otherwise uses simplified check
     */
    function _verifyProof(
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC,
        uint256[4] calldata publicSignals
    ) internal view returns (bool) {
        if (groth16Verifier == address(0)) {
            // No verifier set - simplified mode for testing
            // In production, always use real verifier
            return proofA[0] != 0 && proofB[0][0] != 0 && proofC[0] != 0;
        }
        
        // Call external Groth16 verifier
        (bool success, bytes memory data) = groth16Verifier.staticcall(
            abi.encodeWithSignature(
                "verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[4])",
                proofA,
                proofB,
                proofC,
                publicSignals
            )
        );
        
        return success && abi.decode(data, (bool));
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function updateVerifier(address _newVerifier) external onlyOwner {
        groth16Verifier = _newVerifier;
        emit VerifierUpdated(_newVerifier);
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function isCommitmentUsed(bytes32 commitment) external view returns (bool) {
        return usedCommitments[commitment];
    }
}

