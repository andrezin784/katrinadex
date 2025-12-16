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

// Relayer ABI
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

// Helper: Convert proof components to uint256[8] format
// Groth16 proof: [a[0], a[1], b[0][0], b[0][1], b[1][0], b[1][1], c[0], c[1]]
function convertProofToUint256Array(
  proofA: [string, string],
  proofB: [[string, string], [string, string]],
  proofC: [string, string]
): [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] {
  return [
    BigInt(proofA[0]),
    BigInt(proofA[1]),
    BigInt(proofB[0][0]),
    BigInt(proofB[0][1]),
    BigInt(proofB[1][0]),
    BigInt(proofB[1][1]),
    BigInt(proofC[0]),
    BigInt(proofC[1]),
  ];
}

/**
 * POST /api/relayer/withdraw
 * 
 * Encodes transaction data for Relayer.sol::relayWithdrawalETH/USDC
 */
export async function POST(req: NextRequest) {
  try {
    const body: WithdrawRequest = await req.json();
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
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate proofs
    if (!proofA || !proofB || !proofC || !proofInput) {
      return NextResponse.json(
        { error: 'Missing proof data' },
        { status: 400 }
      );
    }

    // Validate and convert all proof fields to bigint
    if (!proofA || !proofB || !proofC || !proofInput) {
      return NextResponse.json(
        { error: 'Missing proof data' },
        { status: 400 }
      );
    }

    // Convert to bigint (ensure all fields are properly converted)
    const amountBigInt = BigInt(amount);
    const proofAFormatted: [bigint, bigint] = [
      BigInt(proofA[0]),
      BigInt(proofA[1]),
    ];
    const proofBFormatted: [[bigint, bigint], [bigint, bigint]] = [
      [BigInt(proofB[0][0]), BigInt(proofB[0][1])],
      [BigInt(proofB[1][0]), BigInt(proofB[1][1])],
    ];
    const proofCFormatted: [bigint, bigint] = [
      BigInt(proofC[0]),
      BigInt(proofC[1]),
    ];
    const proofInputFormatted: [bigint, bigint, bigint] = [
      BigInt(proofInput[0]),
      BigInt(proofInput[1]),
      BigInt(proofInput[2]),
    ];

    // Encode function call
    const functionName = isETH ? 'relayWithdrawalETH' : 'relayWithdrawalUSDC';
    
    const data = encodeFunctionData({
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
    });

    // Log for monitoring
    console.log('[Relayer Withdraw]', {
      chainId,
      relayer: relayerAddress,
      recipient,
      amount: amountBigInt.toString(),
      isETH,
      functionName,
    });

    return NextResponse.json({
      data,
      to: relayerAddress,
      chainId,
      functionName,
      gasLimit: '500000', // Estimated gas limit for relayWithdraw
    });
  } catch (error: any) {
    console.error('[Relayer Withdraw Error]', error);
    
    return NextResponse.json(
      {
        error: 'Failed to encode transaction',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

