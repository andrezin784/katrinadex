import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Rate limiting (simple in-memory store - use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

function checkRateLimit(req: NextRequest): boolean {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      to,
      poolAmount,
      poolIndex,
      token,
      proofA,
      proofB,
      proofC,
      proofInput,
      signature,
      deadline,
      chainId,
    } = body;

    // Validate required fields
    if (!to || !poolAmount || poolIndex === undefined || !token || !signature || !deadline || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate deadline
    const deadlineNum = BigInt(deadline);
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (deadlineNum <= now) {
      return NextResponse.json(
        { error: 'Signature expired' },
        { status: 400 }
      );
    }

    // Get RPC URL and relayer config from environment
    const RPC_URL = process.env[`RPC_URL_${chainId}`] || process.env.RPC_URL;
    const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
    const GASLESS_RELAYER_ADDRESS = process.env[`GASLESS_RELAYER_${chainId}`] || process.env.GASLESS_RELAYER_ADDRESS;

    if (!RPC_URL || !RELAYER_PRIVATE_KEY || !GASLESS_RELAYER_ADDRESS) {
      console.error('Missing environment variables:', {
        hasRpc: !!RPC_URL,
        hasKey: !!RELAYER_PRIVATE_KEY,
        hasRelayer: !!GASLESS_RELAYER_ADDRESS,
      });
      return NextResponse.json(
        { error: 'Relayer not configured' },
        { status: 500 }
      );
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

    // Verify signature off-chain (optional but recommended)
    // Note: The contract will verify it on-chain, but we can do a quick check here
    // This requires the EIP-712 domain and types - simplified for now

    // Estimate gas
    const gaslessRelayer = new ethers.Contract(
      GASLESS_RELAYER_ADDRESS,
      [
        'function withdrawGasless(address to, uint256 poolAmount, uint256 poolIndex, address token, uint256[2] memory proofA, uint256[2][2] memory proofB, uint256[2] memory proofC, uint256[3] memory proofInput, bytes calldata signature, uint256 deadline)',
      ],
      wallet
    );

    // Prepare transaction
    const tx = await gaslessRelayer.withdrawGasless.populateTransaction(
      to,
      poolAmount,
      poolIndex,
      token,
      proofA,
      proofB,
      proofC,
      proofInput,
      signature,
      deadline
    );

    // Estimate gas (with buffer)
    let gasEstimate;
    try {
      gasEstimate = await provider.estimateGas(tx);
      gasEstimate = gasEstimate * BigInt(120) / BigInt(100); // 20% buffer
    } catch (error: any) {
      console.error('Gas estimation failed:', error);
      return NextResponse.json(
        { error: 'Transaction would fail. Please check your inputs.' },
        { status: 400 }
      );
    }

    // Check relayer balance
    const balance = await provider.getBalance(wallet.address);
    const gasPrice = await provider.getFeeData();
    const maxFee = gasEstimate * (gasPrice.gasPrice || BigInt(0));

    if (balance < maxFee) {
      return NextResponse.json(
        { error: 'Relayer out of funds. Please contact support.' },
        { status: 503 }
      );
    }

    // Send transaction
    try {
      const txResponse = await wallet.sendTransaction({
        ...tx,
        gasLimit: gasEstimate,
      });

      return NextResponse.json({
        success: true,
        txHash: txResponse.hash,
        message: 'Transaction submitted successfully',
      });
    } catch (error: any) {
      console.error('Transaction failed:', error);
      return NextResponse.json(
        { error: error.message || 'Transaction failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Relay error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

