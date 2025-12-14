pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// PrivateSwap Circuit - Proves a swap is valid without revealing amount or addresses
// Uses range proofs and commitment verification
template PrivateSwap(maxBits) {
    // Public Inputs
    signal input minAmount;        // Minimum allowed amount
    signal input maxAmount;        // Maximum allowed amount
    signal input swapCommitment;   // Hash commitment of the swap details
    
    // Private Inputs
    signal input amount;           // Actual swap amount (private)
    signal input fromSecret;       // Secret linked to sender (private)
    signal input toSecret;         // Secret linked to receiver (private)
    signal input nonce;            // Unique nonce for this swap (private)
    
    // Output
    signal output validSwap;       // 1 if valid, 0 if not

    // 1. Verify amount is within range [minAmount, maxAmount]
    component geMin = GreaterEqThan(maxBits);
    geMin.in[0] <== amount;
    geMin.in[1] <== minAmount;
    
    component leMax = LessEqThan(maxBits);
    leMax.in[0] <== amount;
    leMax.in[1] <== maxAmount;
    
    signal rangeValid;
    rangeValid <== geMin.out * leMax.out;
    
    // 2. Verify swap commitment = poseidon(amount, fromSecret, toSecret, nonce)
    component commitmentHasher = Poseidon(4);
    commitmentHasher.inputs[0] <== amount;
    commitmentHasher.inputs[1] <== fromSecret;
    commitmentHasher.inputs[2] <== toSecret;
    commitmentHasher.inputs[3] <== nonce;
    
    // Check commitment matches
    signal commitmentMatch;
    component isEqual = IsEqual();
    isEqual.in[0] <== commitmentHasher.out;
    isEqual.in[1] <== swapCommitment;
    commitmentMatch <== isEqual.out;
    
    // 3. Output: swap is valid if both range and commitment are valid
    validSwap <== rangeValid * commitmentMatch;
    
    // Constrain output to be 1 (valid swap required)
    validSwap === 1;
}

component main {public [minAmount, maxAmount, swapCommitment]} = PrivateSwap(128);

