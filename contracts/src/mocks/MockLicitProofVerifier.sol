// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Mock verifier that always returns true. For testnet/dev use only.
contract MockLicitProofVerifier {
    function verifyProof(
        uint256[2] memory,
        uint256[2][2] memory,
        uint256[2] memory,
        uint256[3] memory
    ) external pure returns (bool) {
        return true;
    }
}



