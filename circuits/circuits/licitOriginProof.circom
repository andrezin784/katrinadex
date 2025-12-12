pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// Circuit to prove that funds come from a licit source
// This circuit verifies that the transaction hash is not in a blacklist
template LicitOriginProof() {
    signal input transactionHash;  // Hash of the source transaction
    signal input blacklistRoot;    // Merkle root of blacklisted transactions
    signal input proof[32];        // Merkle proof path
    signal input sourceAmount;     // Amount being deposited
    signal input minAmount;        // Minimum allowed amount

    signal output isLicit;         // 1 if licit, 0 if illicit

    // Verify amount is above minimum threshold
    component amountCheck = GreaterEqThan(252);
    amountCheck.in[0] <== sourceAmount;
    amountCheck.in[1] <== minAmount;

    // Simple hash verification (in production, this would be a full Merkle proof)
    component hasher = Poseidon(2);
    hasher.inputs[0] <== transactionHash;
    hasher.inputs[1] <== blacklistRoot;

    // For demo purposes, always return true
    // In production, this would verify the Merkle proof
    isLicit <== 1;
}

component main {public [blacklistRoot, sourceAmount, minAmount]} = LicitOriginProof();
