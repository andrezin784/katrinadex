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
 * Safely convert string to bigint with validation
 */
function safeBigInt(value: string | number | bigint, fieldName: string): bigint {
  try {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    if (typeof value === 'string') {
      if (!value || value.trim() === '') {
        throw new Error(`${fieldName} is empty`);
      }
      return BigInt(value);
    }
    throw new Error(`${fieldName} has invalid type: ${typeof value}`);
  } catch (error: any) {
    throw new Error(`Failed to convert ${fieldName} to bigint: ${error.message}`);
  }
}

/**
 * Detect if response is HTML (404, error page, etc.)
 */
function isHTMLResponse(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim().toLowerCase();
  return (
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.includes('<body') ||
    trimmed.includes('404') ||
    trimmed.includes('not found') ||
    trimmed.includes('error')
  );
}

/**
 * Encode relayWithdrawalETH or relayWithdrawalUSDC call
 */
async function encodeRelayCall(params: GaslessWithdrawParams): Promise<`0x${string}`> {
  const { relayerAddress, proofA, proofB, proofC, proofInput, recipient, amount, poolIndex, isETH } = params;

  // Validate and convert proof arrays to proper format with error handling
  const proofAFormatted: [bigint, bigint] = [
    safeBigInt(proofA[0], 'proofA[0]'),
    safeBigInt(proofA[1], 'proofA[1]'),
  ];
  const proofBFormatted: [[bigint, bigint], [bigint, bigint]] = [
    [safeBigInt(proofB[0][0], 'proofB[0][0]'), safeBigInt(proofB[0][1], 'proofB[0][1]')],
    [safeBigInt(proofB[1][0], 'proofB[1][0]'), safeBigInt(proofB[1][1], 'proofB[1][1]')],
  ];
  const proofCFormatted: [bigint, bigint] = [
    safeBigInt(proofC[0], 'proofC[0]'),
    safeBigInt(proofC[1], 'proofC[1]'),
  ];
  const proofInputFormatted: [bigint, bigint, bigint] = [
    safeBigInt(proofInput[0], 'proofInput[0]'),
    safeBigInt(proofInput[1], 'proofInput[1]'),
    safeBigInt(proofInput[2], 'proofInput[2]'),
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
  // Check feature flag (rollback mechanism)
  const enabled = process.env.NEXT_PUBLIC_ENABLE_GASLESS === 'true';
  if (!enabled) {
    throw new Error('Gasless withdraw is disabled. Set NEXT_PUBLIC_ENABLE_GASLESS=true');
  }

  // Validate relayer address
  const relayerAddress = (process.env.NEXT_PUBLIC_RELAYER_ADDRESS || params.relayerAddress) as `0x${string}`;
  if (!relayerAddress || 
      relayerAddress === '0x0000000000000000000000000000000000000000' ||
      !relayerAddress.startsWith('0x') ||
      relayerAddress.length !== 42) {
    throw new Error(`Invalid RELAYER_ADDRESS: ${relayerAddress || 'not set'}. Configure NEXT_PUBLIC_RELAYER_ADDRESS`);
  }

  // Validate all proof fields are valid strings/numbers
  if (!params.proofA || !Array.isArray(params.proofA) || params.proofA.length !== 2) {
    throw new Error('Invalid proofA: must be array of 2 strings');
  }
  if (!params.proofB || !Array.isArray(params.proofB) || params.proofB.length !== 2) {
    throw new Error('Invalid proofB: must be array of 2x2 strings');
  }
  if (!params.proofC || !Array.isArray(params.proofC) || params.proofC.length !== 2) {
    throw new Error('Invalid proofC: must be array of 2 strings');
  }
  if (!params.proofInput || !Array.isArray(params.proofInput) || params.proofInput.length !== 3) {
    throw new Error('Invalid proofInput: must be array of 3 strings');
  }

  // Validate recipient
  if (!params.recipient || !params.recipient.startsWith('0x') || params.recipient.length !== 42) {
    throw new Error(`Invalid recipient address: ${params.recipient}`);
  }

  // Validate amount
  if (!params.amount || params.amount <= 0n) {
    throw new Error(`Invalid amount: ${params.amount?.toString() || 'undefined'}`);
  }

  // Calculate fee and net amount (0.4% = 0.004n)
  const fee = (params.amount * BigInt(4)) / BigInt(1000); // amount * 0.004n
  const netAmount = params.amount - fee;

  // Mask sensitive data for logging
  const maskedRecipient = `${params.recipient.slice(0, 6)}...${params.recipient.slice(-4)}`;
  const maskedRelayer = `${relayerAddress.slice(0, 6)}...${relayerAddress.slice(-4)}`;

  // Log attempt with detailed info (never empty)
  const logData = {
    type: 'gasless-attempt',
    chainId: params.chainId,
    relayer: maskedRelayer,
    recipient: maskedRecipient,
    amount: params.amount.toString(),
    netAmount: netAmount.toString(),
    fee: fee.toString(),
    isETH: params.isETH,
    poolIndex: params.poolIndex,
    timestamp: new Date().toISOString(),
  };
  console.log('[Gasless Attempt]', JSON.stringify(logData, null, 2));

  try {
    // Encode function call with validated relayer address
    const paramsWithValidatedRelayer = {
      ...params,
      relayerAddress,
    };
    const data = await encodeRelayCall(paramsWithValidatedRelayer);

    // Prepare Gelato sponsored call request
    const request: SponsoredCallRequest = {
      chainId: BigInt(params.chainId),
      target: relayerAddress,
      data,
    };

    // Submit to Gelato Relay
    const taskId = await gelatoRelay.sponsoredCall(request);

    // Log success with detailed info
    const successLog = {
      type: 'gasless-success',
      taskId,
      chainId: params.chainId,
      status: 'pending',
      relayer: maskedRelayer,
      timestamp: new Date().toISOString(),
    };
    console.log('[Gasless Success]', JSON.stringify(successLog, null, 2));

    return {
      taskId,
      status: 'pending',
      netAmount,
      fee,
    };
  } catch (error: any) {
    // Enhanced error handling with detailed diagnostics
    const errorMessage = error?.message || String(error) || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace available';
    const stackSummary = errorStack.split('\n').slice(0, 5).join(' | ').substring(0, 300);

    // Check if error is from HTML response (404, etc.)
    let diagnosticInfo = '';
    if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
      diagnosticInfo = 'Edge Function returned 404 - check if /api/relayer/withdraw exists';
    } else if (errorMessage.includes('HTML') || errorMessage.includes('<!DOCTYPE')) {
      diagnosticInfo = 'Edge Function returned HTML instead of JSON - likely 404 or error page';
    } else if (errorMessage.includes('JSON')) {
      diagnosticInfo = 'Failed to parse JSON response - check Edge Function return format';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      diagnosticInfo = 'Network error - check if Edge Function is accessible';
    }

    // Log error with comprehensive details (never empty)
    const errorLog = {
      type: 'gasless-error',
      error: errorMessage,
      diagnostic: diagnosticInfo || 'Unknown error type',
      chainId: params.chainId,
      relayer: maskedRelayer,
      recipient: maskedRecipient,
      amount: params.amount.toString(),
      status: 'failed',
      stackSummary,
      timestamp: new Date().toISOString(),
    };

    // Use console.error with string prefix to ensure it's never empty
    console.error('[Gasless Error]', JSON.stringify(errorLog, null, 2));

    // Re-throw with user-friendly error message
    const userFriendlyMessage = `O relayer não respondeu. Seus fundos estão seguros. Você pode: (1) Tentar novamente, (2) Fazer saque normal (com gas), ou (3) Esperar e tentar mais tarde.`;
    
    throw new Error(userFriendlyMessage);
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
    const errorMessage = error?.message || String(error) || 'Unknown error';
    console.error('[Task Status Error]', {
      taskId,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    return {
      status: 'pending',
    };
  }
}
