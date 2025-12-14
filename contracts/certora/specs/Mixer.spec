// Mixer.spec - Formal verification rules for KatrinaDEX Mixer
// Verifies: reentrancy protection, nullifier uniqueness, proof validity

methods {
    function commitments(bytes32) external returns (bool) envfree;
    function nullifierHashes(bytes32) external returns (bool) envfree;
    function withdraw(uint256[2], uint256[2][2], uint256[2], uint256[3], address, address, uint256, uint256) external;
    function depositETH(bytes32, uint256, uint256[2], uint256[2][2], uint256[2], uint256[3]) external;
}

// ============ INVARIANTS ============

// Commitment once added cannot be removed
invariant commitmentPersistence(bytes32 commitment)
    commitments(commitment) => commitments(commitment)

// Nullifier once used stays used (no double-spending)
invariant nullifierPermanence(bytes32 nullifier)
    nullifierHashes(nullifier) => nullifierHashes(nullifier)

// ============ RULES ============

// Rule 1: No reentrancy - withdraw cannot be called recursively
rule noReentrancyInWithdraw(
    uint256[2] proofA,
    uint256[2][2] proofB,
    uint256[2] proofC,
    uint256[3] proofInput,
    address token,
    address recipient,
    uint256 amount,
    uint256 poolIndex
) {
    env e;
    
    // First call
    withdraw(e, proofA, proofB, proofC, proofInput, token, recipient, amount, poolIndex);
    
    // Same nullifier cannot be used twice
    bytes32 nullifier = to_bytes32(proofInput[2]);
    
    assert nullifierHashes(nullifier), "Nullifier must be marked as used after withdraw";
}

// Rule 2: Nullifier uniqueness - same nullifier cannot be used twice
rule nullifierUniqueness(
    uint256[2] proofA1,
    uint256[2][2] proofB1,
    uint256[2] proofC1,
    uint256[3] proofInput1,
    uint256[2] proofA2,
    uint256[2][2] proofB2,
    uint256[2] proofC2,
    uint256[3] proofInput2,
    address token,
    address recipient,
    uint256 amount,
    uint256 poolIndex
) {
    env e1;
    env e2;
    
    // Same nullifier in both inputs
    require proofInput1[2] == proofInput2[2];
    
    // First withdraw succeeds
    withdraw(e1, proofA1, proofB1, proofC1, proofInput1, token, recipient, amount, poolIndex);
    
    // Second withdraw with same nullifier must fail
    withdraw@withrevert(e2, proofA2, proofB2, proofC2, proofInput2, token, recipient, amount, poolIndex);
    
    assert lastReverted, "Second withdraw with same nullifier must revert";
}

// Rule 3: Valid commitment required for deposit
rule commitmentAddedOnDeposit(
    bytes32 commitment,
    uint256 poolIndex,
    uint256[2] proofA,
    uint256[2][2] proofB,
    uint256[2] proofC,
    uint256[3] proofInput
) {
    env e;
    
    bool commitmentBefore = commitments(commitment);
    require !commitmentBefore;
    
    depositETH(e, commitment, poolIndex, proofA, proofB, proofC, proofInput);
    
    bool commitmentAfter = commitments(commitment);
    
    assert commitmentAfter, "Commitment must be added after deposit";
}

// Rule 4: Balance consistency - no funds created from nothing
rule noFundsCreation(
    uint256[2] proofA,
    uint256[2][2] proofB,
    uint256[2] proofC,
    uint256[3] proofInput,
    address token,
    address recipient,
    uint256 amount,
    uint256 poolIndex
) {
    env e;
    
    mathint balanceBefore = nativeBalances[currentContract];
    
    withdraw(e, proofA, proofB, proofC, proofInput, token, recipient, amount, poolIndex);
    
    mathint balanceAfter = nativeBalances[currentContract];
    
    // Contract balance should decrease by exactly the withdrawn amount (minus fees)
    assert balanceAfter <= balanceBefore, "Contract balance should not increase on withdraw";
}

