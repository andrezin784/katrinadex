// Range Proof ZK Generation (Client-Side)
// Proves balance > threshold without revealing exact balance

import { buildPoseidon } from 'circomlibjs';

export interface RangeProofInput {
  balance: bigint;
  secret: bigint;
  threshold: bigint;
}

export interface RangeProofResult {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  balanceCommitment: bigint;
}

/**
 * Create balance commitment
 * commitment = poseidon(balance, secret)
 */
export async function createBalanceCommitment(
  balance: bigint,
  secret: bigint
): Promise<bigint> {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  
  const commitment = F.toObject(poseidon([balance, secret]));
  return commitment;
}

/**
 * Generate ZK proof that balance > threshold
 * Used for DID "Verified Mode"
 */
export async function generateRangeProof(
  input: RangeProofInput
): Promise<RangeProofResult | null> {
  try {
    const snarkjs = await import('snarkjs');
    
    // Calculate balance commitment
    const balanceCommitment = await createBalanceCommitment(input.balance, input.secret);
    
    // Build circuit input
    const circuitInput = {
      threshold: input.threshold.toString(),
      balanceCommitment: balanceCommitment.toString(),
      balance: input.balance.toString(),
      secret: input.secret.toString(),
    };
    
    console.log("Generating Range Proof with input:", circuitInput);
    
    // Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      "/circuits/rangeProof.wasm",
      "/circuits/rangeProof_final.zkey"
    );
    
    console.log("Range Proof generated!", proof);
    
    return {
      proof,
      publicSignals,
      balanceCommitment,
    };
  } catch (error) {
    console.error("Range Proof Generation Failed:", error);
    return null;
  }
}

/**
 * Format range proof for Solidity contract
 */
export function formatRangeProofForContract(proofData: RangeProofResult) {
  const { proof, publicSignals } = proofData;
  
  return {
    a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])] as const,
    b: [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ] as const,
    c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])] as const,
    input: publicSignals.map((x: string) => BigInt(x)) as [bigint, bigint, bigint],
  };
}

/**
 * Generate random secret for balance commitment
 */
export function generateBalanceSecret(): bigint {
  const array = new Uint8Array(31);
  crypto.getRandomValues(array);
  return BigInt('0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join(''));
}

