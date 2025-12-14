// DID (Decentralized Identity) Utilities
// Compatible with did:pkh (SpruceID) standard

import { signMessage } from '@wagmi/core';

export interface DIDCredential {
  did: string;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
  signature: string;
}

/**
 * Generate DID string in did:pkh format
 * Format: did:pkh:eip155:CHAIN_ID:ADDRESS
 */
export function generateDIDString(chainId: number, address: string): string {
  return `did:pkh:eip155:${chainId}:${address.toLowerCase()}`;
}

/**
 * Parse DID string to extract chain and address
 */
export function parseDID(did: string): { chainId: number; address: string } | null {
  const parts = did.split(':');
  if (parts.length !== 5 || parts[0] !== 'did' || parts[1] !== 'pkh' || parts[2] !== 'eip155') {
    return null;
  }
  
  return {
    chainId: parseInt(parts[3]),
    address: parts[4],
  };
}

/**
 * Create a new DID by signing with wallet
 * Returns the DID and signature for on-chain registration
 */
export async function createDID(
  config: any,
  chainId: number,
  address: string
): Promise<{ did: string; signature: `0x${string}` } | null> {
  try {
    const did = generateDIDString(chainId, address);
    
    // Sign the DID string
    const signature = await signMessage(config, {
      message: did,
    });
    
    return { did, signature };
  } catch (error) {
    console.error("DID creation failed:", error);
    return null;
  }
}

/**
 * Verify a DID signature locally
 */
export async function verifyDIDSignature(
  did: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    const { verifyMessage } = await import('viem');
    
    const isValid = await verifyMessage({
      address: expectedAddress as `0x${string}`,
      message: did,
      signature: signature as `0x${string}`,
    });
    
    return isValid;
  } catch (error) {
    console.error("DID signature verification failed:", error);
    return false;
  }
}

/**
 * Check if user needs DID for a swap amount
 * Returns true if amount exceeds the verified mode threshold
 */
export function needsDIDForAmount(
  amount: bigint,
  thresholdUSD: number = 10000, // Default: $10,000
  tokenDecimals: number = 18,
  tokenPriceUSD: number = 1 // Default: 1 USD per token
): boolean {
  // Convert amount to USD
  const amountInToken = Number(amount) / Math.pow(10, tokenDecimals);
  const amountInUSD = amountInToken * tokenPriceUSD;
  
  return amountInUSD >= thresholdUSD;
}

/**
 * Store DID locally (for session persistence)
 */
export function storeDIDLocally(credential: DIDCredential): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('katrina_did', JSON.stringify(credential));
  }
}

/**
 * Retrieve stored DID
 */
export function getStoredDID(): DIDCredential | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('katrina_did');
  if (!stored) return null;
  
  try {
    const credential = JSON.parse(stored) as DIDCredential;
    
    // Check if expired
    if (Date.now() / 1000 > credential.expiresAt) {
      localStorage.removeItem('katrina_did');
      return null;
    }
    
    return credential;
  } catch {
    return null;
  }
}

/**
 * Clear stored DID
 */
export function clearStoredDID(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('katrina_did');
  }
}

