/**
 * Gelato Relay SDK Integration for Gasless Withdraw
 * 
 * This module handles gasless withdrawals using Gelato Relay's sponsored calls.
 * Fee: 0.4% deducted from withdrawal amount (off-chain calculation)
 * 
 * @module lib/relayer
 */

import { GelatoRelay, SponsoredCallRequest } from '@gelatonetwork/relay-sdk';

// Gelato Relay instance
const gelatoRelay = new GelatoRelay();

// Fee configuration: 0.4% = 40 basis points
const GASLESS_FEE_BASIS_POINTS = 40;
const BASIS_POINTS = 10000;

export interface GaslessWithdrawParams {
  relayerAddress: `0x${string}`;
  chainId: number;
  proofA: [string, string];
  proofB: [[string, string], [string, string]];
  proofC: [string, string];
  proofInput: [string, string, string];
  recipient: `0x${string}`;
  amount: bigint;
  poolIndex: number;
  token: `0x${string}`; // ETH address (0x0) or token address
  isETH: boolean; // true for ETH, false for USDC/EURC
}

export interface GaslessWithdrawResult {
  taskId: string;
  status: 'pending' | 'success' | 'failed';
  txHash?: `0x${string}`;
  netAmount: bigint;
  fee: bigint;
}

/**
 * Calculate net amount after 0.4% fee
 */
export function calculateNetAmount(amount: bigint): { netAmount: bigint; fee: bigint } {
  const fee = (amount * BigInt(GASLESS_FEE_BASIS_POINTS)) / BigInt(BASIS_POINTS);
  const netAmount = amount - fee;
  return { netAmount, fee };
}

/**
 * Encode relayWithdrawalETH or relayWithdrawalUSDC call
 */
async function encodeRelayCall(params: GaslessWithdrawParams): Promise<`0x${string}`> {
  const { relayerAddress, proofA, proofB, proofC, proofInput, recipient, amount, poolIndex, isETH } = params;

  // Convert proof arrays to proper format
  const proofAFormatted: [bigint, bigint] = [BigInt(proofA[0]), BigInt(proofA[1])];
  const proofBFormatted: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(proofB[0][0]), BigInt(proofB[0][1])],
    [BigInt(proofB[1][0]), BigInt(proofB[1][1])],
  ];
  const proofCFormatted: [bigint, bigint] = [BigInt(proofC[0]), BigInt(proofC[1])];
  const proofInputFormatted: [bigint, bigint, bigint] = [
    BigInt(proofInput[0]),
    BigInt(proofInput[1]),
    BigInt(proofInput[2]),
  ];

  // Relayer ABI for relayWithdrawalETH and relayWithdrawalUSDC
  const RELAYER_ABI = [
    {
      name: 'relayWithdrawalETH',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'proofA', type: 'uint256[2]' },
        { name: 'proofB', type: 'uint256[2][2]' },
        { name: 'proofC', type: 'uint256[2]' },
        { name: 'proofInput', type: 'uint256[3]' },
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'poolIndex', type: 'uint256' },
      ],
    },
    {
      name: 'relayWithdrawalUSDC',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'proofA', type: 'uint256[2]' },
        { name: 'proofB', type: 'uint256[2][2]' },
        { name: 'proofC', type: 'uint256[2]' },
        { name: 'proofInput', type: 'uint256[3]' },
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'poolIndex', type: 'uint256' },
      ],
    },
  ] as const;

  const functionName = isETH ? 'relayWithdrawalETH' : 'relayWithdrawalUSDC';
  
  // Import viem for encoding (dynamic import to avoid SSR issues)
  const viem = await import('viem');
  const { encodeFunctionData } = viem;
  
  return encodeFunctionData({
    abi: RELAYER_ABI,
    functionName,
    args: [
      proofAFormatted,
      proofBFormatted,
      proofCFormatted,
      proofInputFormatted,
      recipient,
      amount,
      BigInt(poolIndex),
    ],
  }) as `0x${string}`;
}

/**
 * Submit gasless withdraw via Gelato Relay
 * 
 * @param params - Withdraw parameters
 * @returns Task ID and status
 */
export async function submitGaslessWithdraw(
  params: GaslessWithdrawParams
): Promise<GaslessWithdrawResult> {
  // Check feature flag
  const enabled = process.env.NEXT_PUBLIC_ENABLE_GASLESS === 'true';
  if (!enabled) {
    throw new Error('Gasless withdraw is disabled. Set NEXT_PUBLIC_ENABLE_GASLESS=true');
  }

  // Calculate fee and net amount
  const { netAmount, fee } = calculateNetAmount(params.amount);

  // Encode function call
  const data = await encodeRelayCall(params);

  // Prepare Gelato sponsored call request
  const request: SponsoredCallRequest = {
    chainId: BigInt(params.chainId),
    target: params.relayerAddress,
    data,
  };

  // Log attempt
  console.log({
    type: 'gasless-attempt',
    chainId: params.chainId,
    relayer: params.relayerAddress,
    recipient: params.recipient,
    amount: params.amount.toString(),
    netAmount: netAmount.toString(),
    fee: fee.toString(),
  });

  try {
    // Submit to Gelato Relay
    const taskId = await gelatoRelay.sponsoredCall(request);

    // Log success
    console.log({
      type: 'gasless-success',
      taskId,
      chainId: params.chainId,
      status: 'pending',
    });

    return {
      taskId,
      status: 'pending',
      netAmount,
      fee,
    };
  } catch (error: any) {
    // Log error
    console.error({
      type: 'gasless-error',
      error: error.message,
      chainId: params.chainId,
      status: 'failed',
    });

    throw new Error(`Gelato Relay failed: ${error.message}`);
  }
}

/**
 * Get task status from Gelato Relay
 */
export async function getTaskStatus(taskId: string): Promise<{
  status: 'pending' | 'success' | 'failed';
  txHash?: `0x${string}`;
}> {
  try {
    const taskStatus = await gelatoRelay.getTaskStatus(taskId);
    
    if (taskStatus?.taskState === 'ExecSuccess') {
      return {
        status: 'success',
        txHash: taskStatus.transactionHash as `0x${string}`,
      };
    } else if (taskStatus?.taskState === 'ExecReverted' || taskStatus?.taskState === 'Cancelled') {
      return {
        status: 'failed',
      };
    }
    
    return {
      status: 'pending',
    };
  } catch (error: any) {
    console.error('Failed to get task status:', error);
    return {
      status: 'pending',
    };
  }
}

