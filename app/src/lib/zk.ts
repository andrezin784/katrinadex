// Utility to generate ZK Proofs in the browser using snarkjs
// This runs purely on the client side

import { buildPoseidon } from 'circomlibjs';

// We dynamically import snarkjs to avoid SSR issues
export async function generateMixerProof(input: any) {
  try {
    // Dynamic import inside the function
    const snarkjs = await import('snarkjs');
    
    console.log("Generating ZK Proof with input:", input);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      "/circuits/mixer.wasm", // Path to wasm file in public folder
      "/circuits/mixer_final.zkey" // Path to zkey file in public folder
    );

    console.log("Proof generated!", proof);
    console.log("Public Signals:", publicSignals);

    return { proof, publicSignals };
  } catch (error) {
    console.error("ZK Proof Generation Failed:", error);
    return null;
  }
}

// Helper to format proof for Solidity
export function formatProofForContract(proof: any, publicSignals: any) {
  if (!proof) return null;
  
  const formattedInput = publicSignals.map((x: string) => BigInt(x)) as [bigint, bigint, bigint];

  return {
    a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])] as const,
    b: [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ] as const,
    c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])] as const,
    input: formattedInput,
  };
}

export async function createCommitment() {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  
  // Generate random 31-byte numbers for secret and nullifier
  const secret = BigInt(randomHex(31));
  const nullifier = BigInt(randomHex(31));
  
  // Calculate commitment = poseidon(nullifier, secret)
  const commitmentBigInt = F.toObject(poseidon([nullifier, secret]));
  
  // Calculate nullifierHash = poseidon(nullifier)
  const nullifierHashBigInt = F.toObject(poseidon([nullifier]));
  
  return {
    secret,
    nullifier,
    commitment: commitmentBigInt,
    nullifierHash: nullifierHashBigInt
  };
}

function randomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return '0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}
