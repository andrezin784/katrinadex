// EIP-712 utilities for Gasless Relayer

import { TypedDataDomain, TypedDataField } from 'viem';

export interface WithdrawGaslessMessage {
  to: string;
  poolAmount: bigint;
  poolIndex: bigint;
  token: string;
  nonce: bigint;
  deadline: bigint;
}

/**
 * Get EIP-712 domain for GaslessRelayer
 */
export function getGaslessRelayerDomain(
  chainId: number,
  relayerAddress: string
): TypedDataDomain {
  return {
    name: 'KatrinaDEXGaslessRelayer',
    version: '1',
    chainId,
    verifyingContract: relayerAddress as `0x${string}`,
  };
}

/**
 * EIP-712 types for WithdrawGasless
 */
export const WITHDRAW_GASLESS_TYPES: Record<string, TypedDataField[]> = {
  WithdrawGasless: [
    { name: 'to', type: 'address' },
    { name: 'poolAmount', type: 'uint256' },
    { name: 'poolIndex', type: 'uint256' },
    { name: 'token', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

/**
 * Create EIP-712 typed data for gasless withdraw
 */
export function createWithdrawGaslessTypedData(
  chainId: number,
  relayerAddress: string,
  message: WithdrawGaslessMessage
) {
  return {
    domain: getGaslessRelayerDomain(chainId, relayerAddress),
    types: WITHDRAW_GASLESS_TYPES,
    primaryType: 'WithdrawGasless' as const,
    message: {
      to: message.to as `0x${string}`,
      poolAmount: message.poolAmount,
      poolIndex: message.poolIndex,
      token: message.token as `0x${string}`,
      nonce: message.nonce,
      deadline: message.deadline,
    },
  };
}

/**
 * Calculate gasless fee (0.4% = 40 bps)
 */
export function calculateGaslessFee(amount: bigint): bigint {
  return (amount * BigInt(40)) / BigInt(10000);
}

/**
 * Calculate final amount after all fees
 * Mixer fee: 0.3% (30 bps)
 * Gasless fee: 0.4% (40 bps)
 * Total: 0.7% (70 bps)
 */
export function calculateFinalAmount(poolAmount: bigint): {
  mixerFee: bigint;
  gaslessFee: bigint;
  finalAmount: bigint;
} {
  const mixerFee = (poolAmount * BigInt(30)) / BigInt(10000); // 0.3%
  const mixerNetAmount = poolAmount - mixerFee;
  const gaslessFee = (poolAmount * BigInt(40)) / BigInt(10000); // 0.4%
  const finalAmount = mixerNetAmount - gaslessFee;
  
  return {
    mixerFee,
    gaslessFee,
    finalAmount,
  };
}

