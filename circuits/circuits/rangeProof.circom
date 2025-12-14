pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// RangeProof Circuit - Proves balance > threshold without revealing exact balance
// Used for DID "Verified Mode" to prove solvency
template RangeProof(maxBits) {
    // Public Inputs
    signal input threshold;          // Minimum threshold to prove against
    signal input balanceCommitment;  // Commitment to the balance
    
    // Private Inputs
    signal input balance;            // Actual balance (private)
    signal input secret;             // Secret for commitment (private)
    
    // Output
    signal output isAboveThreshold;  // 1 if balance > threshold

    // 1. Verify balance commitment = poseidon(balance, secret)
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== balance;
    commitmentHasher.inputs[1] <== secret;
    
    // Commitment must match
    balanceCommitment === commitmentHasher.out;
    
    // 2. Prove balance > threshold
    component gt = GreaterThan(maxBits);
    gt.in[0] <== balance;
    gt.in[1] <== threshold;
    
    isAboveThreshold <== gt.out;
    
    // Constrain: must be above threshold
    isAboveThreshold === 1;
}

component main {public [threshold, balanceCommitment]} = RangeProof(128);

