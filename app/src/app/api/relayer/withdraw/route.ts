/**
 * Edge Function for Gasless Withdraw via Gelato Relay
 * 
 * Prepares transaction data for Relayer.sol::relayWithdrawalETH/USDC
 * Returns encoded data for Gelato Relay sponsored call
 * 
 * @module api/relayer/withdraw
 */

import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData } from 'viem';

// Runtime Edge for low latency
export const runtime = 'edge';
export const maxDuration = 10;

// Relayer ABI - Exact match with Relayer.sol
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

interface WithdrawRequest {
  relayerAddress: string;
  chainId: number;
  proofA: [string, string];
  proofB: [[string, string], [string, string]];
  proofC: [string, string];
  proofInput: [string, string, string];
  recipient: string;
  amount: string;
  poolIndex: number;
  token: string; // ETH address (0x0) or token address
  isETH: boolean;
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
      // Remove any whitespace
      const cleaned = value.trim();
      return BigInt(cleaned);
    }
    throw new Error(`${fieldName} has invalid type: ${typeof value}`);
  } catch (error: any) {
    throw new Error(`Failed to convert ${fieldName} to bigint: ${error.message}`);
  }
}

/**
 * POST /api/relayer/withdraw
 * 
 * Encodes transaction data for Relayer.sol::relayWithdrawalETH/USDC
 * Returns: { data, to, chainId, gasLimit }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    let body: WithdrawRequest;
    try {
      body = await req.json();
    } catch (parseError: any) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          message: parseError?.message || 'Failed to parse JSON',
        },
        { status: 400 }
      );
    }

    const {
      relayerAddress,
      chainId,
      proofA,
      proofB,
      proofC,
      proofInput,
      recipient,
      amount,
      poolIndex,
      token,
      isETH,
    } = body;

    // Validate required fields
    if (!relayerAddress || !chainId || !recipient || !amount || !token) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missing: {
            relayerAddress: !relayerAddress,
            chainId: !chainId,
            recipient: !recipient,
            amount: !amount,
            token: !token,
          },
        },
        { status: 400 }
      );
    }

    // Validate address formats
    if (!relayerAddress.startsWith('0x') || relayerAddress.length !== 42) {
      return NextResponse.json(
        { error: `Invalid relayerAddress format: ${relayerAddress}` },
        { status: 400 }
      );
    }

    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      return NextResponse.json(
        { error: `Invalid recipient format: ${recipient}` },
        { status: 400 }
      );
    }

    // Validate proofs structure
    if (!proofA || !Array.isArray(proofA) || proofA.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid proofA: must be array of 2 strings' },
        { status: 400 }
      );
    }

    if (!proofB || !Array.isArray(proofB) || proofB.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid proofB: must be array of 2x2 strings' },
        { status: 400 }
      );
    }

    if (!proofC || !Array.isArray(proofC) || proofC.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid proofC: must be array of 2 strings' },
        { status: 400 }
      );
    }

    if (!proofInput || !Array.isArray(proofInput) || proofInput.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid proofInput: must be array of 3 strings' },
        { status: 400 }
      );
    }

    // Convert to bigint with validation (string → bigint)
    let amountBigInt: bigint;
    let proofAFormatted: [bigint, bigint];
    let proofBFormatted: [[bigint, bigint], [bigint, bigint]];
    let proofCFormatted: [bigint, bigint];
    let proofInputFormatted: [bigint, bigint, bigint];

    try {
      amountBigInt = safeBigInt(amount, 'amount');
      proofAFormatted = [
        safeBigInt(proofA[0], 'proofA[0]'),
        safeBigInt(proofA[1], 'proofA[1]'),
      ];
      proofBFormatted = [
        [safeBigInt(proofB[0][0], 'proofB[0][0]'), safeBigInt(proofB[0][1], 'proofB[0][1]')],
        [safeBigInt(proofB[1][0], 'proofB[1][0]'), safeBigInt(proofB[1][1], 'proofB[1][1]')],
      ];
      proofCFormatted = [
        safeBigInt(proofC[0], 'proofC[0]'),
        safeBigInt(proofC[1], 'proofC[1]'),
      ];
      proofInputFormatted = [
        safeBigInt(proofInput[0], 'proofInput[0]'),
        safeBigInt(proofInput[1], 'proofInput[1]'),
        safeBigInt(proofInput[2], 'proofInput[2]'),
      ];
    } catch (conversionError: any) {
      return NextResponse.json(
        {
          error: 'Proof conversion failed',
          message: conversionError.message,
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (amountBigInt <= 0n) {
      return NextResponse.json(
        { error: `Invalid amount: must be greater than 0` },
        { status: 400 }
      );
    }

    // Encode function call
    const functionName = isETH ? 'relayWithdrawalETH' : 'relayWithdrawalUSDC';
    
    let data: `0x${string}`;
    try {
      data = encodeFunctionData({
        abi: RELAYER_ABI,
        functionName,
        args: [
          proofAFormatted,
          proofBFormatted,
          proofCFormatted,
          proofInputFormatted,
          recipient as `0x${string}`,
          amountBigInt,
          BigInt(poolIndex),
        ],
      }) as `0x${string}`;
    } catch (encodeError: any) {
      return NextResponse.json(
        {
          error: 'Failed to encode function call',
          message: encodeError.message,
          functionName,
        },
        { status: 500 }
      );
    }

    // Log for monitoring (masked addresses)
    const maskedRecipient = `${recipient.slice(0, 6)}...${recipient.slice(-4)}`;
    const maskedRelayer = `${relayerAddress.slice(0, 6)}...${relayerAddress.slice(-4)}`;
    
    console.log('[Relayer Withdraw]', {
      chainId,
      relayer: maskedRelayer,
      recipient: maskedRecipient,
      amount: amountBigInt.toString(),
      isETH,
      functionName,
      poolIndex,
    });

    // Return encoded data
    return NextResponse.json({
      data,
      to: relayerAddress,
      chainId,
      functionName,
      gasLimit: '500000', // Estimated gas limit for relayWithdraw
    });
  } catch (error: any) {
    // Comprehensive error logging (never empty)
    const errorMessage = error?.message || String(error) || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace';
    
    console.error('[Relayer Withdraw Error]', {
      error: errorMessage,
      stack: errorStack.split('\n').slice(0, 5).join(' | ').substring(0, 300),
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      {
        error: 'Failed to encode transaction',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
