// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Interface for Poseidon hasher (2 inputs)
interface IPoseidonHasher {
    function poseidon(uint256[2] memory inputs) external pure returns (uint256);
}

// Merkle Tree with history - stores last N roots for async withdrawals
contract MerkleTreeWithHistory {
    uint256 public constant FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 public constant ZERO_VALUE = 21663839004416932945382355908790599225266501822907911457504978515578255421292; // poseidon(keccak256("katrinadex"))
    
    IPoseidonHasher public immutable hasher;
    uint32 public immutable levels;

    // Merkle tree data
    mapping(uint256 => uint256) public filledSubtrees;
    mapping(uint256 => uint256) public roots;
    uint32 public constant ROOT_HISTORY_SIZE = 30;
    uint32 public currentRootIndex = 0;
    uint32 public nextIndex = 0;

    constructor(uint32 _levels, address _hasher) {
        require(_levels > 0 && _levels <= 32, "Invalid levels");
        levels = _levels;
        hasher = IPoseidonHasher(_hasher);

        // Initialize with zero values
        uint256 currentZero = ZERO_VALUE;
        for (uint32 i = 0; i < _levels; i++) {
            filledSubtrees[i] = currentZero;
            currentZero = hashLeftRight(currentZero, currentZero);
        }

        roots[0] = currentZero;
    }

    // Hash two leaves together using Poseidon
    function hashLeftRight(uint256 _left, uint256 _right) public view returns (uint256) {
        require(_left < FIELD_SIZE, "Left value too large");
        require(_right < FIELD_SIZE, "Right value too large");
        uint256[2] memory inputs;
        inputs[0] = _left;
        inputs[1] = _right;
        return hasher.poseidon(inputs);
    }

    // Insert a new leaf into the Merkle tree
    function _insert(uint256 _leaf) internal returns (uint32 index) {
        uint32 _nextIndex = nextIndex;
        require(_nextIndex != uint32(2)**levels, "Merkle tree is full");
        uint32 currentIndex = _nextIndex;
        uint256 currentLevelHash = _leaf;
        uint256 left;
        uint256 right;

        for (uint32 i = 0; i < levels; i++) {
            if (currentIndex % 2 == 0) {
                left = currentLevelHash;
                right = zeros(i);
                filledSubtrees[i] = currentLevelHash;
            } else {
                left = filledSubtrees[i];
                right = currentLevelHash;
            }
            currentLevelHash = hashLeftRight(left, right);
            currentIndex /= 2;
        }

        uint32 newRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        currentRootIndex = newRootIndex;
        roots[newRootIndex] = currentLevelHash;
        nextIndex = _nextIndex + 1;
        return _nextIndex;
    }

    // Check if a root is known (within history)
    function isKnownRoot(uint256 _root) public view returns (bool) {
        if (_root == 0) return false;
        uint32 _currentRootIndex = currentRootIndex;
        uint32 i = _currentRootIndex;
        do {
            if (_root == roots[i]) return true;
            if (i == 0) i = ROOT_HISTORY_SIZE;
            i--;
        } while (i != _currentRootIndex);
        return false;
    }

    // Get the current root
    function getLastRoot() public view returns (uint256) {
        return roots[currentRootIndex];
    }

    // Get zero value at level
    function zeros(uint256 i) public view returns (uint256) {
        if (i == 0) return ZERO_VALUE;
        uint256 currentZero = ZERO_VALUE;
        for (uint256 j = 0; j < i; j++) {
            currentZero = hashLeftRight(currentZero, currentZero);
        }
        return currentZero;
    }
}



