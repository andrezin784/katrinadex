pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

// Simplified Mixer circuit for ZK privacy
// Verifies knowledge of secret and nullifier that create a valid commitment
template Mixer() {
    // Public inputs
    signal input root;              // Commitment (used as "root" for compatibility)
    signal input nullifierHash;     // Expected hash of nullifier
    
    // Private inputs  
    signal input nullifier;         // Private nullifier
    signal input secret;            // Private secret

    // Public output
    signal output nullifierHashOut;

    // 1. Calculate commitment = poseidon(nullifier, secret)
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== nullifier;
    commitmentHasher.inputs[1] <== secret;
    
    // 2. Verify commitment matches the "root" (which is actually the commitment)
    root === commitmentHasher.out;

    // 3. Calculate nullifier hash = poseidon(nullifier)
    component nullifierHasher = Poseidon(1);
    nullifierHasher.inputs[0] <== nullifier;
    
    // 4. Verify provided nullifier hash is correct
    nullifierHash === nullifierHasher.out;
    
    // 5. Output the nullifier hash
    nullifierHashOut <== nullifierHasher.out;
}

component main {public [root, nullifierHash]} = Mixer();
