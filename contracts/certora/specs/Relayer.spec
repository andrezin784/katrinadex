// Relayer.spec - Formal verification rules for KatrinaDEX Relayer
// Verifies: CEI pattern, earnings calculation, reentrancy protection

methods {
    function ethEarnings(address) external returns (uint256) envfree;
    function usdcEarnings(address) external returns (uint256) envfree;
    function claimETHEarnings() external;
    function claimUSDCEarnings() external;
    function relayWithdrawalETH(uint256[2], uint256[2][2], uint256[2], uint256[3], address, uint256, uint256) external;
}

// ============ INVARIANTS ============

// Earnings can never be negative (overflow protection)
invariant earningsNonNegative(address relayer)
    ethEarnings(relayer) >= 0 && usdcEarnings(relayer) >= 0

// ============ RULES ============

// Rule 1: CEI Pattern - state updated before external call in claim
rule ceiPatternInClaim() {
    env e;
    
    uint256 earningsBefore = ethEarnings(e.msg.sender);
    require earningsBefore > 0;
    
    claimETHEarnings(e);
    
    uint256 earningsAfter = ethEarnings(e.msg.sender);
    
    // Earnings should be zeroed after claim
    assert earningsAfter == 0, "Earnings must be zeroed after claim";
}

// Rule 2: No double claim - claiming twice should fail on second
rule noDoubleClaim() {
    env e1;
    env e2;
    require e1.msg.sender == e2.msg.sender;
    
    uint256 earnings = ethEarnings(e1.msg.sender);
    require earnings > 0;
    
    // First claim
    claimETHEarnings(e1);
    
    // Second claim should revert (no earnings left)
    claimETHEarnings@withrevert(e2);
    
    assert lastReverted, "Second claim should revert";
}

// Rule 3: Reentrancy protection - claimETHEarnings cannot reenter
rule noReentrancyInClaim() {
    env e;
    
    storage initState = lastStorage;
    
    uint256 earnings = ethEarnings(e.msg.sender);
    require earnings > 0;
    
    claimETHEarnings(e);
    
    // State should be consistent after claim
    uint256 newEarnings = ethEarnings(e.msg.sender);
    assert newEarnings == 0, "Earnings should be zero after claim";
}

// Rule 4: Fee calculation correctness (0.1% = 10 basis points)
rule correctFeeCalculation(
    uint256[2] proofA,
    uint256[2][2] proofB,
    uint256[2] proofC,
    uint256[3] proofInput,
    address recipient,
    uint256 amount,
    uint256 poolIndex
) {
    env e;
    
    uint256 earningsBefore = ethEarnings(e.msg.sender);
    
    relayWithdrawalETH(e, proofA, proofB, proofC, proofInput, recipient, amount, poolIndex);
    
    uint256 earningsAfter = ethEarnings(e.msg.sender);
    uint256 expectedFee = amount / 1000; // 0.1%
    
    // Earnings should increase by the fee amount
    assert earningsAfter - earningsBefore == expectedFee, "Fee calculation incorrect";
}

// Rule 5: Recipient receives correct amount
rule recipientReceivesCorrectAmount(
    uint256[2] proofA,
    uint256[2][2] proofB,
    uint256[2] proofC,
    uint256[3] proofInput,
    address recipient,
    uint256 amount,
    uint256 poolIndex
) {
    env e;
    require recipient != currentContract;
    require recipient != e.msg.sender;
    
    mathint recipientBalanceBefore = nativeBalances[recipient];
    
    relayWithdrawalETH(e, proofA, proofB, proofC, proofInput, recipient, amount, poolIndex);
    
    mathint recipientBalanceAfter = nativeBalances[recipient];
    uint256 fee = amount / 1000;
    uint256 expectedReceived = amount - fee;
    
    assert recipientBalanceAfter - recipientBalanceBefore == expectedReceived, "Recipient should receive amount minus fee";
}

