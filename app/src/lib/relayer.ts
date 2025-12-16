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
 * Uses: netAmount = amount - (amount * 0.004n)
 */
export function calculateNetAmount(amount: bigint): { netAmount: bigint; fee: bigint } {
  // 0.4% = 0.004 = 4/1000
  const fee = (amount * BigInt(4)) / BigInt(1000);
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

  // Validate relayer address
  const relayerAddress = process.env.NEXT_PUBLIC_RELAYER_ADDRESS || params.relayerAddress;
  if (!relayerAddress || relayerAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('RELAYER_ADDRESS not configured. Set NEXT_PUBLIC_RELAYER_ADDRESS');
  }

  // Validate all proof fields are valid strings/numbers
  if (!params.proofA || !params.proofB || !params.proofC || !params.proofInput) {
    throw new Error('Invalid proof data: missing proof components');
  }

  // Calculate fee and net amount (0.4% = 0.004n)
  const fee = (params.amount * BigInt(4)) / BigInt(1000); // amount * 0.004n
  const netAmount = params.amount - fee;

  // Convert all proof fields to bigint (ensure proper conversion)
  const proofAFormatted: [bigint, bigint] = [
    BigInt(params.proofA[0]),
    BigInt(params.proofA[1]),
  ];
  const proofBFormatted: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(params.proofB[0][0]), BigInt(params.proofB[0][1])],
    [BigInt(params.proofB[1][0]), BigInt(params.proofB[1][1])],
  ];
  const proofCFormatted: [bigint, bigint] = [
    BigInt(params.proofC[0]),
    BigInt(params.proofC[1]),
  ];
  const proofInputFormatted: [bigint, bigint, bigint] = [
    BigInt(params.proofInput[0]),
    BigInt(params.proofInput[1]),
    BigInt(params.proofInput[2]),
  ];

  // Encode function call with validated relayer address
  const paramsWithValidatedRelayer = {
    ...params,
    relayerAddress: relayerAddress as `0x${string}`,
  };
  const data = await encodeRelayCall(paramsWithValidatedRelayer);

  // Prepare Gelato sponsored call request
  const request: SponsoredCallRequest = {
    chainId: BigInt(params.chainId),
    target: relayerAddress as `0x${string}`,
    data,
  };

  // Log attempt with masked sensitive data
  const maskedRecipient = `${params.recipient.slice(0, 6)}...${params.recipient.slice(-4)}`;
  console.log({
    type: 'gasless-attempt',
    chainId: params.chainId,
    relayer: `${relayerAddress.slice(0, 6)}...${relayerAddress.slice(-4)}`,
    recipient: maskedRecipient,
    amount: params.amount.toString(),
    netAmount: netAmount.toString(),
    fee: fee.toString(),
    isETH: params.isETH,
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
      relayer: `${relayerAddress.slice(0, 6)}...${relayerAddress.slice(-4)}`,
    });

    return {
      taskId,
      status: 'pending',
      netAmount,
      fee,
    };
  } catch (error: any) {
    // Log error with masked params and stack trace summary
    const errorMessage = error?.message || 'Unknown error';
    const stackSummary = error?.stack?.split('\n').slice(0, 3).join(' | ') || 'No stack trace';
    
    // Use console.error with string format for better compatibility
    console.error('[Gasless Error]', {
      type: 'gasless-error',
      error: errorMessage,
      chainId: params.chainId,
      relayer: `${relayerAddress.slice(0, 6)}...${relayerAddress.slice(-4)}`,
      recipient: maskedRecipient,
      status: 'failed',
      stackSummary: stackSummary.substring(0, 200), // Limit stack trace length
    });

    // Re-throw with descriptive error for toast
    throw new Error(`Gelato Relay failed: ${errorMessage}`);
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

