// Private Swap ZK Proof Generation (Client-Side)
// Generates proofs for private swaps without revealing amounts or addresses

import { buildPoseidon } from 'circomlibjs';

export interface PrivateSwapInput {
  amount: bigint;
  fromSecret: bigint;
  toSecret: bigint;
  nonce: bigint;
  minAmount: bigint;
  maxAmount: bigint;
}

export interface PrivateSwapProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  swapCommitment: bigint;
}

/**
 * Generate a private swap commitment
 * commitment = poseidon(amount, fromSecret, toSecret, nonce)
 */
export async function createSwapCommitment(
  amount: bigint,
  fromSecret: bigint,
  toSecret: bigint,
  nonce: bigint
): Promise<bigint> {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  
  const commitment = F.toObject(poseidon([amount, fromSecret, toSecret, nonce]));
  return commitment;
}

/**
 * Generate ZK proof for private swap
 * Proves: amount is in [minAmount, maxAmount] AND commitment is valid
 */
export async function generatePrivateSwapProof(
  input: PrivateSwapInput
): Promise<PrivateSwapProof | null> {
  try {
    // Dynamic import snarkjs (client-side only)
    const snarkjs = await import('snarkjs');
    
    // Calculate commitment
    const swapCommitment = await createSwapCommitment(
      input.amount,
      input.fromSecret,
      input.toSecret,
      input.nonce
    );
    
    // Build circuit input
    const circuitInput = {
      minAmount: input.minAmount.toString(),
      maxAmount: input.maxAmount.toString(),
      swapCommitment: swapCommitment.toString(),
      amount: input.amount.toString(),
      fromSecret: input.fromSecret.toString(),
      toSecret: input.toSecret.toString(),
      nonce: input.nonce.toString(),
    };
    
    console.log("Generating Private Swap Proof with input:", circuitInput);
    
    // Generate proof using snarkjs
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      "/circuits/privateSwap.wasm",
      "/circuits/privateSwap_final.zkey"
    );
    
    console.log("Private Swap Proof generated!", proof);
    
    return {
      proof,
      publicSignals,
      swapCommitment,
    };
  } catch (error) {
    console.error("Private Swap Proof Generation Failed:", error);
    return null;
  }
}

/**
 * Format proof for Solidity contract
 */
export function formatPrivateSwapProofForContract(proofData: PrivateSwapProof) {
  const { proof, publicSignals } = proofData;
  
  return {
    a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])] as const,
    b: [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ] as const,
    c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])] as const,
    input: publicSignals.map((x: string) => BigInt(x)) as [bigint, bigint, bigint, bigint],
  };
}

/**
 * Generate random secrets for swap
 */
export function generateSwapSecrets(): { fromSecret: bigint; toSecret: bigint; nonce: bigint } {
  const randomBytes = (size: number) => {
    const array = new Uint8Array(size);
    crypto.getRandomValues(array);
    return BigInt('0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join(''));
  };
  
  return {
    fromSecret: randomBytes(31),
    toSecret: randomBytes(31),
    nonce: randomBytes(31),
  };
}

