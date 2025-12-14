'use client';
/// <reference path="../../types/circomlibjs.d.ts" />

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Loader2, Banknote, Check, Wallet, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount, useConfig } from 'wagmi';
import { formatEther, isAddress, toHex } from 'viem';
import { writeContract as writeContractAction, waitForTransactionReceipt, readContract, signTypedData } from '@wagmi/core';
import { CONTRACTS_CONFIG, getPoolSizes } from '@/lib/contracts';
import { MIXER_ABI, GASLESS_RELAYER_ABI } from '@/lib/abi';
import { useRouter } from 'next/navigation';
import { generateMixerProof, formatProofForContract } from '@/lib/zk';
import { buildPoseidon } from 'circomlibjs';
import { SecurityWarning } from '@/components/SecurityWarning';
import { createWithdrawGaslessTypedData, calculateFinalAmount } from '@/lib/eip712';

export default function WithdrawPage() {
  const router = useRouter();
  const config = useConfig();
  type ContractsMap = typeof CONTRACTS_CONFIG;
  type ChainId = keyof ContractsMap;
  const { isConnected, chain, address } = useAccount();
  const nativeSymbol = chain?.nativeCurrency?.symbol ?? 'ETH';

  const [step, setStep] = useState(1);
  const [note, setNote] = useState('');
  const [parsedNote, setParsedNote] = useState<{amount: string, secret: string, nullifier: string, token: 'ETH' | 'USDC' | 'EURC'} | null>(null);
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [gaslessEnabled, setGaslessEnabled] = useState(false);
  
  // Get pool sizes based on chain
  const poolSizes = getPoolSizes(chain?.id ?? 84532);

  // Reset state quando trocar de conta/rede
  useEffect(() => {
    if (address && chain) {
      setStep(1);
      setNote('');
      setParsedNote(null);
      setRecipient('');
      setLoading(false);
      setSuccess(false);
      setTxHash(null);
      toast.info(`Connected to ${chain.name}`, { duration: 2000 });
    }
  }, [address, chain?.id]);

  const handleVerify = () => {
    if (!note) return;
    setLoading(true);
    setStatusMessage("Parsing Note...");
    
    try {
      // Parse note: katrina-{eth|usdc|eurc}-AMOUNT-SECRET-NULLIFIER
      const parts = note.trim().split('-');
      if (parts.length !== 5 || parts[0] !== 'katrina') {
        throw new Error("Invalid note format");
      }
      
      const tokenType = parts[1].toUpperCase() as 'ETH' | 'USDC' | 'EURC';
      if (tokenType !== 'ETH' && tokenType !== 'USDC' && tokenType !== 'EURC') {
        throw new Error("Invalid token type in note");
      }
      
      const amountWei = parts[2];
      const secret = parts[3];
      const nullifier = parts[4];
      
      setParsedNote({ amount: amountWei, secret, nullifier, token: tokenType });
      
      setTimeout(() => {
        setLoading(false);
        setStep(2);
        toast.success("Note Verified Successfully");
      }, 1500);
    } catch (e) {
      setLoading(false);
      toast.error("Invalid Note format");
    }
  };

  const handleWithdraw = async () => {
    if (!parsedNote || !recipient || !isConnected) return;
    
    if (!isAddress(recipient)) {
      toast.error("Invalid recipient address");
      return;
    }

    // Gasless withdraw flow
    if (gaslessEnabled) {
      return handleGaslessWithdraw();
    }

    // Normal withdraw flow
    try {
      const contracts = CONTRACTS_CONFIG[(chain?.id as keyof typeof CONTRACTS_CONFIG) ?? 84532];

      // Find pool index based on token type
      // On Arc Testnet, USDC is native so it uses ETH pool sizes
      const isArcTestnet = chain?.id === 5042002;
      let tokenPoolSizes;
      if (parsedNote.token === 'ETH' || (parsedNote.token === 'USDC' && isArcTestnet)) {
        tokenPoolSizes = poolSizes.ETH;
      } else if (parsedNote.token === 'EURC') {
        tokenPoolSizes = poolSizes.EURC;
      } else {
        tokenPoolSizes = poolSizes.USDC;
      }
      
      const poolIndex = tokenPoolSizes.findIndex(p => p.value === parsedNote.amount);
      if (poolIndex === -1) {
        toast.error(`Invalid pool amount in note for ${parsedNote.token}`);
        return;
      }

      // Get token address
      // On Arc Testnet, USDC is the native token (use ETH_ADDRESS)
      let tokenAddress: `0x${string}`;
      if (parsedNote.token === 'ETH' || (parsedNote.token === 'USDC' && isArcTestnet)) {
        tokenAddress = contracts.ETH_ADDRESS as `0x${string}`;
      } else if (parsedNote.token === 'EURC') {
        const eurcAddr = 'EURC' in contracts ? (contracts as any).EURC : null;
        if (!eurcAddr) {
          toast.error("EURC not available on this chain");
          return;
        }
        tokenAddress = eurcAddr as `0x${string}`;
      } else {
        tokenAddress = contracts.USDC as `0x${string}`;
      }

      setLoading(true);
      setStatusMessage("Verifying commitment exists...");

      // 1. Calculate inputs needed for the circuit
      const poseidon = await buildPoseidon();
      const F = poseidon.F;
      const secretBigInt = BigInt(parsedNote.secret);
      const nullifierBigInt = BigInt(parsedNote.nullifier);
      
      // commitment = poseidon(nullifier, secret)
      const commitment = F.toObject(poseidon([nullifierBigInt, secretBigInt]));
      // nullifierHash = poseidon(nullifier)
      const nullifierHash = F.toObject(poseidon([nullifierBigInt]));
      
      // Convert commitment to bytes32 format (same as deposit)
      const commitmentHex = toHex(commitment, { size: 32 });
      
      console.log("=== COMMITMENT DEBUG ===");
      console.log("Secret (from note):", parsedNote.secret);
      console.log("Nullifier (from note):", parsedNote.nullifier);
      console.log("Commitment BigInt:", commitment.toString());
      console.log("Commitment Hex (bytes32):", commitmentHex);
      console.log("========================");
      
      // Check if commitment exists in contract BEFORE generating proof
      let commitmentExists = false;
      try {
        commitmentExists = await readContract(config, {
          address: contracts.MIXER as `0x${string}`,
          abi: MIXER_ABI,
          functionName: 'commitments',
          args: [commitmentHex],
        }) as boolean;
        
        console.log("Commitment exists in contract:", commitmentExists);
        
        if (!commitmentExists) {
          toast.warning("Warning: This commitment was not found in the contract. The transaction may fail.", {
            duration: 5000,
          });
          // Continue anyway - let user try
        }
      } catch (checkError) {
        console.error("Error checking commitment:", checkError);
        toast.warning("Could not verify commitment. Proceeding anyway...");
        // Continue anyway
      }
      
      setStatusMessage("Generating ZK Proof... This may take a minute.");

      // 2. Build Input JSON for the ZK circuit
      // root = commitment (the circuit verifies root === poseidon(nullifier, secret))
      // nullifierHash = expected hash of nullifier
      // nullifier = private
      // secret = private
      const input = {
        root: commitment.toString(),
        nullifierHash: nullifierHash.toString(),
        nullifier: nullifierBigInt.toString(),
        secret: secretBigInt.toString()
      };

      // 3. Generate Real ZK Proof
      const proofData = await generateMixerProof(input);
      
      if (!proofData) {
        throw new Error("Failed to generate proof");
      }

      const { proof, publicSignals } = proofData;
      const formattedProof = formatProofForContract(proof, publicSignals);

      if (!formattedProof) {
        throw new Error("Invalid proof format");
      }

      setStatusMessage("Proof Generated! Sending Transaction...");

      // Debug: Log proof details
      console.log("=== ZK PROOF DEBUG ===");
      console.log("Commitment (root):", commitment.toString());
      console.log("NullifierHash:", nullifierHash.toString());
      console.log("Proof A:", formattedProof.a);
      console.log("Proof B:", formattedProof.b);
      console.log("Proof C:", formattedProof.c);
      console.log("Public Signals:", formattedProof.input);
      console.log("Token Address:", tokenAddress);
      console.log("Recipient:", recipient);
      console.log("Amount:", parsedNote.amount);
      console.log("Pool Index:", poolIndex);
      console.log("====================");

      // 4. Send Transaction using writeContractAction from @wagmi/core
      console.log("Sending withdraw transaction...");
      setStatusMessage("Please confirm in your wallet...");
      
      let hash: `0x${string}`;
      try {
        hash = await writeContractAction(config, {
          address: contracts.MIXER as `0x${string}`,
          abi: MIXER_ABI,
          functionName: 'withdraw',
          args: [
            formattedProof.a,
            formattedProof.b,
            formattedProof.c,
            formattedProof.input,
            tokenAddress,
            recipient as `0x${string}`,
            BigInt(parsedNote.amount),
            BigInt(poolIndex)
          ],
        });
      } catch (txError: any) {
        console.error("Transaction send error:", txError);
        
        if (txError?.message?.includes("User rejected") || txError?.message?.includes("denied")) {
          toast.error("Transaction was rejected by user");
        } else if (txError?.message?.includes("Unknown commitment")) {
          toast.error("Withdrawal failed: The commitment from your note does not match any deposit in the contract.", {
            description: "This note may be from a previous contract version.",
            duration: 10000,
          });
        } else {
          toast.error(`Transaction failed: ${txError?.shortMessage || txError?.message || "Unknown error"}`);
        }
        setLoading(false);
        return;
      }
      
      setTxHash(hash);
      setStatusMessage("Transaction sent! Waiting for confirmation...");
      toast.info("Transaction submitted. Waiting for confirmation...");
      
      // 5. Wait for transaction confirmation
      try {
        const receipt = await waitForTransactionReceipt(config, { hash });
        
        if (receipt.status === 'success') {
          setSuccess(true);
          toast.success("Withdrawal Successful!", {
            description: "Funds have been sent to your clean address.",
          });
        } else {
          toast.error("Transaction was reverted by the contract");
        }
      } catch (receiptError: any) {
        console.error("Receipt error:", receiptError);
        // Transaction was sent but we couldn't get the receipt
        toast.warning("Transaction sent but confirmation failed. Check the explorer.", {
          duration: 10000,
        });
      }
      
      setLoading(false);

    } catch (error: any) {
      console.error("Withdraw failed:", error);
      
      // Parse specific error messages
      let errorMessage = "Failed to process withdrawal";
      
      if (error?.message?.includes("Unknown commitment")) {
        errorMessage = "Commitment not found. Did you make a deposit after the last contract update?";
      } else if (error?.message?.includes("Invalid mixer proof")) {
        errorMessage = "ZK Proof verification failed. Please try again.";
      } else if (error?.message?.includes("Nullifier already used")) {
        errorMessage = "This note has already been used for withdrawal.";
      } else if (error?.message?.includes("insufficient funds") || error?.message?.includes("Insufficient")) {
        errorMessage = "Transaction simulation failed. The commitment may not exist in the contract.";
      } else if (error?.message?.includes("User rejected")) {
        errorMessage = "Transaction was rejected.";
      } else if (error?.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleGaslessWithdraw = async () => {
    if (!parsedNote || !recipient || !isConnected || !address || !chain) return;

    try {
      setLoading(true);
      setStatusMessage("Preparing gasless withdrawal...");

      const contracts = CONTRACTS_CONFIG[(chain.id as keyof typeof CONTRACTS_CONFIG) ?? 84532];
      const gaslessRelayerAddress = contracts.GASLESS_RELAYER as `0x${string}`;

      console.log("🔍 Gasless Relayer Debug:", {
        chainId: chain.id,
        gaslessRelayerAddress,
        contracts: contracts,
      });

      if (!gaslessRelayerAddress || gaslessRelayerAddress === '0x0000000000000000000000000000000000000000') {
        console.error("❌ Gasless Relayer not configured:", gaslessRelayerAddress);
        toast.error("Gasless relayer not configured for this network");
        setLoading(false);
        return;
      }

      // Find pool index and token address (same logic as normal withdraw)
      const isArc = chain.id === 5042002;
      let tokenAddress: `0x${string}`;
      let poolIndex: number;

      if (parsedNote.token === 'ETH') {
        tokenAddress = contracts.ETH_ADDRESS as `0x${string}`;
        const tokenPools = isArc ? poolSizes.ETH : poolSizes.ETH;
        poolIndex = tokenPools.findIndex(p => p.value === parsedNote.amount);
      } else if (parsedNote.token === 'USDC') {
        tokenAddress = contracts.USDC as `0x${string}`;
        const tokenPools = isArc ? poolSizes.USDC : poolSizes.USDC;
        poolIndex = tokenPools.findIndex(p => p.value === parsedNote.amount);
      } else {
        tokenAddress = contracts.EURC as `0x${string}`;
        poolIndex = poolSizes.EURC.findIndex(p => p.value === parsedNote.amount);
      }

      if (poolIndex === -1) {
        toast.error("Invalid pool amount");
        setLoading(false);
        return;
      }

      // Generate ZK proof (same as normal withdraw)
      setStatusMessage("Generating ZK Proof...");
      const poseidon = await buildPoseidon();
      const F = poseidon.F;
      const secretBigInt = BigInt(parsedNote.secret);
      const nullifierBigInt = BigInt(parsedNote.nullifier);
      
      const commitment = F.toObject(poseidon([nullifierBigInt, secretBigInt]));
      const nullifierHash = F.toObject(poseidon([nullifierBigInt]));
      
      const input = {
        root: commitment.toString(),
        nullifierHash: nullifierHash.toString(),
        nullifier: nullifierBigInt.toString(),
        secret: secretBigInt.toString()
      };

      const proofData = await generateMixerProof(input);
      if (!proofData) {
        throw new Error("Failed to generate proof");
      }

      const { proof, publicSignals } = proofData;
      const formattedProof = formatProofForContract(proof, publicSignals);
      if (!formattedProof) {
        throw new Error("Invalid proof format");
      }

      // Get nonce from relayer
      setStatusMessage("Getting nonce...");
      const nonce = await readContract(config, {
        address: gaslessRelayerAddress,
        abi: GASLESS_RELAYER_ABI,
        functionName: 'getNonce',
        args: [address],
      }) as bigint;

      // Create EIP-712 signature
      setStatusMessage("Signing message...");
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
      const poolAmount = BigInt(parsedNote.amount);

      const typedData = createWithdrawGaslessTypedData(
        chain.id,
        gaslessRelayerAddress,
        {
          to: recipient,
          poolAmount,
          poolIndex: BigInt(poolIndex),
          token: tokenAddress,
          nonce,
          deadline,
        }
      );

      const signature = await signTypedData(config, typedData);
      
      // Send to relayer API
      setStatusMessage("Submitting to relayer...");
      const response = await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          poolAmount: poolAmount.toString(),
          poolIndex,
          token: tokenAddress,
          proofA: formattedProof.a.map(x => x.toString()),
          proofB: formattedProof.b.map(row => row.map(x => x.toString())),
          proofC: formattedProof.c.map(x => x.toString()),
          proofInput: formattedProof.input.map(x => x.toString()),
          signature,
          deadline: deadline.toString(),
          chainId: chain.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Relayer request failed');
      }

      const { txHash: relayTxHash } = await response.json();
      setTxHash(relayTxHash as `0x${string}`);
      setStatusMessage("Transaction submitted! Waiting for confirmation...");
      toast.info("Gasless withdrawal submitted. Waiting for confirmation...");

      // Poll for transaction receipt
      try {
        const receipt = await waitForTransactionReceipt(config, { hash: relayTxHash });
        if (receipt.status === 'success') {
          setSuccess(true);
          toast.success("Gasless Withdrawal Successful!", {
            description: "Funds have been sent to your clean address.",
          });
        } else {
          toast.error("Transaction was reverted");
        }
      } catch (receiptError: any) {
        console.error("Receipt error:", receiptError);
        toast.warning("Transaction sent but confirmation failed. Check the explorer.", {
          duration: 10000,
        });
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Gasless withdraw failed:", error);
      toast.error(error?.message || "Gasless withdrawal failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-lg mx-auto relative">
      {/* Security Warning */}
      <SecurityWarning />
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-32 h-32 bg-[#00F5FF] rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_#00F5FF]"
            >
              <Check className="w-16 h-16 text-black stroke-[3]" />
            </motion.div>
            
            {/* Money Flying Particles (Simulated) */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 500, 
                  y: (Math.random() - 0.5) * 500, 
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute text-green-500"
              >
                <Banknote className="w-8 h-8" />
              </motion.div>
            ))}

            <h2 className="text-4xl font-bold text-white mb-4">Withdrawal Successful!</h2>
            <p className="text-gray-400 mb-8">Funds are on their way to your clean address.</p>
            
            <div className="flex gap-4">
               {txHash && (
                <a 
                  href={`${chain?.blockExplorers?.default?.url || 'https://sepolia.basescan.org'}/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-xl"
                >
                  View on Explorer
                </a>
               )}
              <Link href="/">
                <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 rounded-xl">
                  Return Home
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Withdraw</h1>
        <div className="w-10" />
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 relative">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-gray-400 text-sm font-medium mb-2 block">Your Private Note</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Paste your katrina-eth-... note here"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00F5FF]/50 transition-colors h-32 resize-none font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-3 bg-violet-500/10 p-4 rounded-xl border border-violet-500/20">
                <ShieldCheck className="w-5 h-5 text-violet-400" />
                <p className="text-xs text-violet-300">
                  Zero-Knowledge Verification happens securely.
                </p>
              </div>

              <Button 
                onClick={handleVerify}
                disabled={!note || loading}
                className="w-full h-14 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Verify Note'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 flex items-center justify-between">
                <span className="text-green-400 font-bold">Note Valid</span>
                <span className="text-white font-bold">
                  {(() => {
                    if (!parsedNote) return `0 ${nativeSymbol}`;
                    const isArc = chain?.id === 5042002;
                    // On Arc, ETH token means native USDC
                    const displayLabel = parsedNote.token === 'ETH' ? (isArc ? 'USDC' : 'ETH') : parsedNote.token;
                    const use18Decimals = parsedNote.token === 'ETH' || (parsedNote.token === 'USDC' && isArc);
                    const displayValue = use18Decimals
                      ? formatEther(BigInt(parsedNote.amount))
                      : (Number(parsedNote.amount) / 1000000).toString();
                    return `${displayValue} ${displayLabel}`;
                  })()}
                </span>
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium mb-2 block">Recipient Address</label>
                <input 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00F5FF]/50 font-mono"
                />
              </div>

              {/* Gasless Withdraw Toggle */}
              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gaslessEnabled}
                    onChange={(e) => setGaslessEnabled(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-black/40 text-[#00F5FF] focus:ring-[#00F5FF] focus:ring-offset-0"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">Gasless Withdraw</span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">0.4% fee</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      No gas required! Fee of 0.4% will be deducted from withdrawal amount.
                    </p>
                    {gaslessEnabled && parsedNote && (
                      <div className="mt-2 text-xs text-gray-300">
                        {(() => {
                          const poolAmount = BigInt(parsedNote.amount);
                          const { finalAmount, gaslessFee } = calculateFinalAmount(poolAmount);
                          const isArc = chain?.id === 5042002;
                          const use18Decimals = parsedNote.token === 'ETH' || (parsedNote.token === 'USDC' && isArc);
                          const tokenSymbol = parsedNote.token === 'ETH' ? (isArc ? 'USDC' : 'ETH') : parsedNote.token;
                          const finalDisplay = use18Decimals
                            ? formatEther(finalAmount)
                            : (Number(finalAmount) / 1000000).toFixed(6);
                          const feeDisplay = use18Decimals
                            ? formatEther(gaslessFee)
                            : (Number(gaslessFee) / 1000000).toFixed(6);
                          return (
                            <div className="space-y-1">
                              <div>You receive: <span className="text-green-400 font-bold">{finalDisplay} {tokenSymbol}</span></div>
                              <div>Gasless fee: <span className="text-yellow-400">{feeDisplay} {tokenSymbol}</span></div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                <p className="text-xs text-yellow-200 font-medium">
                  ⚠️ Ensure you are withdrawing to a fresh address that has no link to your deposit address.
                </p>
              </div>

              {isConnected ? (
                <Button 
                  onClick={handleWithdraw}
                  disabled={!recipient || loading}
                  className="w-full h-14 bg-[#00F5FF] text-black font-bold text-lg rounded-xl hover:bg-[#00F5FF]/90 transition-colors shadow-[0_0_20px_rgba(0,245,255,0.3)] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      {statusMessage || 'Processing...'}
                    </>
                  ) : (
                    'Withdraw Funds'
                  )}
                </Button>
              ) : (
                <div className="text-center p-4 border border-white/10 rounded-xl bg-white/5">
                   <p className="text-white mb-2">Connect wallet to withdraw</p>
                   <p className="text-xs text-gray-400">Ideally use a new, empty wallet for privacy.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
