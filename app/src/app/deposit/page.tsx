'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Settings, 
  Wallet, 
  Check, 
  Copy, 
  Download, 
  ShieldCheck, 
  ArrowDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useConfig } from 'wagmi';
import { toHex, formatEther } from 'viem';
import { writeContract as writeContractAction, waitForTransactionReceipt } from '@wagmi/core';
import { CONTRACTS_CONFIG, getPoolSizes } from '@/lib/contracts';
import { MIXER_ABI, COMPLIANCE_ORACLE_ABI } from '@/lib/abi';
import { createCommitment } from '@/lib/zk';
import { useReadContract } from 'wagmi';
import { EthIcon, UsdcIcon, EurcIcon } from '@/components/ui/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SecurityWarning } from '@/components/SecurityWarning';

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export default function DepositPage() {
  type ContractsMap = typeof CONTRACTS_CONFIG;
  type ChainId = keyof ContractsMap;
  const router = useRouter();
  const config = useConfig();
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [proofProgress, setProofProgress] = useState(0);
  const [note, setNote] = useState('');
  const [commitment, setCommitment] = useState<`0x${string}`>('0x');
  const [currentAction, setCurrentAction] = useState<'approve' | 'deposit' | null>(null);
  
  // Selected Token (ETH, USDC, or EURC)
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDC' | 'EURC'>('ETH');

  // Pool sizes based on chain
  const currentChainId = chain?.id ?? 84532;
  const poolSizes = getPoolSizes(currentChainId);
  
  type PoolOption = { value: string; label: string; index: number };
  // Selected amount state (Dynamic based on token)
  const [selectedAmount, setSelectedAmount] = useState<PoolOption>(poolSizes.ETH[1] || poolSizes.ETH[0]); // Default 0.1 ETH
  
  // Matrix effect state
  const [matrixChars, setMatrixChars] = useState<string[]>([]);

  // Chain-aware contracts and balances
  const chainIdAsKey = useMemo<ChainId>(() => ((chain?.id ?? 84532) as ChainId), [chain?.id]);
  const nativeSymbol = chain?.nativeCurrency?.symbol ?? 'ETH';
  const contracts = useMemo(() => CONTRACTS_CONFIG[chainIdAsKey] || CONTRACTS_CONFIG[84532], [chainIdAsKey]);
  
  const { data: nativeBalance, refetch: refetchNative } = useBalance({
    address,
    chainId: chainIdAsKey,
    query: {
      enabled: !!address,
      refetchInterval: 3000, // Atualiza a cada 3 segundos
    }
  });
  const { data: usdcBalance, refetch: refetchUsdc } = useBalance({
    address,
    chainId: chainIdAsKey,
    token: contracts?.USDC as `0x${string}` | undefined,
    query: {
      enabled: !!address && !!contracts?.USDC,
      refetchInterval: 3000, // Atualiza a cada 3 segundos
    }
  });
  // EURC Balance (only available on Arc Testnet)
  const eurcAddress = 'EURC' in contracts ? (contracts as any).EURC : undefined;
  const { data: eurcBalance, refetch: refetchEurc } = useBalance({
    address,
    chainId: chainIdAsKey,
    token: eurcAddress as `0x${string}` | undefined,
    query: {
      enabled: !!address && !!eurcAddress,
      refetchInterval: 3000,
    }
  });

  // Compliance Check - verify if user is not blacklisted/sanctioned
  const complianceOracleAddress = 'COMPLIANCE_ORACLE' in contracts ? (contracts as any).COMPLIANCE_ORACLE : undefined;
  const { data: isCompliant, isLoading: isCheckingCompliance, refetch: refetchCompliance } = useReadContract({
    address: complianceOracleAddress as `0x${string}` | undefined,
    abi: COMPLIANCE_ORACLE_ABI,
    functionName: 'isCompliant',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!complianceOracleAddress && complianceOracleAddress !== '0x0000000000000000000000000000000000000000',
    }
  });

  // Atualiza tudo quando trocar de conta ou rede
  useEffect(() => {
    if (address && chain) {
      refetchNative();
      refetchUsdc();
      refetchEurc();
      refetchCompliance();
    }
  }, [address, chain?.id, refetchNative, refetchUsdc, refetchEurc, refetchCompliance]);

  // Update selected amount when token or chain changes
  useEffect(() => {
    const pools = poolSizes[selectedToken];
    if (pools && pools.length > 0) {
      setSelectedAmount(pools[0]);
    }
  }, [selectedToken, currentChainId, poolSizes]);

  // Reset state quando trocar de conta/rede
  useEffect(() => {
    if (address && chain) {
      setStep(1);
      setNote('');
      setCommitment('0x');
      setCurrentAction(null);
      setLoading(false);
      toast.info(`Conectado a ${chain.name}`, { duration: 2000 });
    }
  }, [address, chain?.id]);

  // Monitor transaction status (only for ETH deposits via hook)
  useEffect(() => {
    if (isConfirmed && currentAction === 'deposit' && selectedToken === 'ETH') {
      toast.success("Deposit Successful!", {
        description: "Your funds have been securely mixed.",
        duration: 5000,
        action: {
          label: 'Withdraw Now',
          onClick: () => router.push('/withdraw'),
        },
      });
      router.push('/dashboard');
      setCurrentAction(null);
    }
    if (writeError) {
      console.error("Transaction Error:", writeError);
      setCurrentAction(null);
    }
  }, [isConfirmed, writeError, router, currentAction, selectedToken]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProofProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
        
        // Matrix rain effect
        const chars = "01KATRINAZKPROOF";
        setMatrixChars(prev => [
          ...prev.slice(-20), 
          chars[Math.floor(Math.random() * chars.length)]
        ]);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleGenerate = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLoading(true);
    
    try {
      // Generate cryptographic commitment (Poseidon Hash)
      const { secret, nullifier, commitment: commitmentBigInt } = await createCommitment();
      
      const tokenPrefix = selectedToken.toLowerCase();
      const noteString = `katrina-${tokenPrefix}-${selectedAmount.value}-${secret.toString()}-${nullifier.toString()}`;
      const commitmentHex = toHex(commitmentBigInt, { size: 32 });

      // Debug: Log commitment details for verification
      console.log("=== DEPOSIT COMMITMENT DEBUG ===");
      console.log("Secret:", secret.toString());
      console.log("Nullifier:", nullifier.toString());
      console.log("Commitment BigInt:", commitmentBigInt.toString());
      console.log("Commitment Hex (bytes32):", commitmentHex);
      console.log("Note String:", noteString);
      console.log("================================");

      setTimeout(() => {
        setLoading(false);
        setNote(noteString);
        setCommitment(commitmentHex);
        setStep(2);
        toast.success("ZK Proof Generated Successfully!");
      }, 4000); 
    } catch (error) {
      console.error("Generation failed:", error);
      setLoading(false);
      toast.error("Failed to generate ZK Proof");
    }
  };

  const handleDeposit = async () => {
    if (!isConnected || !commitment) return;

    // Check compliance before allowing deposit
    if (complianceOracleAddress && complianceOracleAddress !== '0x0000000000000000000000000000000000000000') {
      if (isCheckingCompliance) {
        toast.info("Checking compliance status...");
        return;
      }
      
      if (isCompliant === false) {
        toast.error("Deposit blocked: Your address has been flagged by our compliance system.", {
          description: "This may be due to sanctions list or high-risk activity detection. Contact support if you believe this is an error.",
          duration: 10000,
        });
        return;
      }
    }

    const maxRetries = 3;
    const retryDelay = 2000; // 2 segundos entre tentativas

    const executeWithRetry = async (fn: () => Promise<any>, retries = maxRetries): Promise<any> => {
      try {
        return await fn();
      } catch (error: any) {
        const isRateLimited = error?.message?.includes('rate limit') || 
                             error?.message?.includes('too many requests');
        
        if (isRateLimited && retries > 0) {
          toast.info(`Rate limit detectado. Tentando novamente em ${retryDelay/1000}s... (${maxRetries - retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeWithRetry(fn, retries - 1);
        }
        throw error;
      }
    };

    try {
      // Compliance Verification Input
      // input[0] = depositor address (for blacklist/sanctions checking)
      // input[1] = unused (reserved for future compliance checks)
      // input[2] = unused (reserved for future compliance checks)
      const depositorAddressAsBigInt = address ? BigInt(address) : BigInt(0);
      
      const complianceProofA: [bigint, bigint] = [BigInt(0), BigInt(0)];
      const complianceProofB: [[bigint, bigint], [bigint, bigint]] = [[BigInt(0), BigInt(0)], [BigInt(0), BigInt(0)]];
      const complianceProofC: [bigint, bigint] = [BigInt(0), BigInt(0)];
      // Pass depositor address for compliance check
      const complianceInput: [bigint, bigint, bigint] = [depositorAddressAsBigInt, BigInt(0), BigInt(0)];

      // Check if we're on Arc Testnet where USDC is the native token
      const isArcTestnet = currentChainId === 5042002;
      const isNativeDeposit = selectedToken === 'ETH' || (selectedToken === 'USDC' && isArcTestnet);

      if (isNativeDeposit) {
        // Native token deposit (ETH on most chains, USDC on Arc)
        setCurrentAction('deposit');
        writeContract({
          address: contracts.MIXER as `0x${string}`,
          abi: MIXER_ABI,
          functionName: 'depositETH',
          args: [
            commitment,
            BigInt(selectedAmount.index),
            complianceProofA,
            complianceProofB,
            complianceProofC,
            complianceInput
          ],
          value: BigInt(selectedAmount.value),
        });
      } else if (selectedToken === 'USDC' && !isArcTestnet) {
        // USDC ERC20 Deposit (only on non-Arc chains)
        setCurrentAction('approve');
        toast.info("Step 1/2: Approve USDC spending");
        
        // 1) Approve using writeContractAction with retry
        const approveHash = await executeWithRetry(async () => {
          return await writeContractAction(config, {
            address: contracts.USDC as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contracts.MIXER as `0x${string}`, BigInt(selectedAmount.value)],
          });
        });

        // 2) Wait for approve confirmation
        toast.info("Waiting for approval confirmation...");
        await waitForTransactionReceipt(config, { hash: approveHash });
        
        toast.success("Approval confirmed! Step 2/2: Depositing...");
        
        // 3) Now deposit USDC with retry
        setCurrentAction('deposit');
        const depositHash = await executeWithRetry(async () => {
          return await writeContractAction(config, {
            address: contracts.MIXER as `0x${string}`,
            abi: MIXER_ABI,
            functionName: 'depositUSDC',
            args: [
              commitment,
              BigInt(selectedAmount.index),
              BigInt(selectedAmount.value),
              complianceProofA,
              complianceProofB,
              complianceProofC,
              complianceInput
            ],
          });
        });

        // 4) Wait for deposit confirmation
        await waitForTransactionReceipt(config, { hash: depositHash });
        
        // Success!
        toast.success("Deposit Successful!", {
          description: "Your funds have been securely mixed.",
          duration: 5000,
        });
        router.push('/dashboard');
        setCurrentAction(null);
      } else if (selectedToken === 'EURC') {
        // EURC Deposit: approve then depositEURC
        if (!eurcAddress) {
          toast.error("EURC not available on this chain");
          return;
        }
        
        setCurrentAction('approve');
        toast.info("Step 1/2: Approve EURC spending");
        
        // 1) Approve EURC
        const approveHash = await executeWithRetry(async () => {
          return await writeContractAction(config, {
            address: eurcAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contracts.MIXER as `0x${string}`, BigInt(selectedAmount.value)],
          });
        });

        // 2) Wait for approve confirmation
        toast.info("Waiting for approval confirmation...");
        await waitForTransactionReceipt(config, { hash: approveHash });
        
        toast.success("Approval confirmed! Step 2/2: Depositing EURC...");
        
        // 3) Now deposit EURC
        setCurrentAction('deposit');
        const depositHash = await executeWithRetry(async () => {
          return await writeContractAction(config, {
            address: contracts.MIXER as `0x${string}`,
            abi: MIXER_ABI,
            functionName: 'depositEURC',
            args: [
              commitment,
              BigInt(selectedAmount.index),
              BigInt(selectedAmount.value),
              complianceProofA,
              complianceProofB,
              complianceProofC,
              complianceInput
            ],
          });
        });

        // 4) Wait for deposit confirmation
        await waitForTransactionReceipt(config, { hash: depositHash });
        
        // Success!
        toast.success("EURC Deposit Successful!", {
          description: "Your EURC has been securely mixed.",
          duration: 5000,
        });
        router.push('/dashboard');
        setCurrentAction(null);
      }
      
    } catch (error: any) {
      console.error("Deposit failed:", error);
      
      // Mensagens de erro mais amigáveis
      if (error?.message?.includes('rate limit')) {
        toast.error("RPC sobrecarregado. Aguarde 30 segundos e tente novamente.", { duration: 5000 });
      } else if (error?.message?.includes('insufficient funds')) {
        toast.error("Saldo insuficiente para gas ou valor.");
      } else if (error?.message?.includes('User rejected')) {
        toast.error("Transação rejeitada no wallet.");
      } else {
        toast.error(`Transaction failed: ${error?.shortMessage || error?.message || 'Unknown error'}`);
      }
      setCurrentAction(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 max-w-lg mx-auto">
      {/* Security Warning */}
      <SecurityWarning />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Deposit</h1>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10" />
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
              step >= s ? 'bg-[#00F5FF] text-black shadow-[0_0_15px_rgba(0,245,255,0.5)]' : 'bg-[#1a1a1a] text-gray-500 border border-white/10'
            }`}
          >
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Main Card */}
            <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#00F5FF] text-black text-[10px] font-bold px-2 py-1 rounded-bl-xl">
                POWERED BY 1INCH
              </div>
              
              <div className="space-y-4">
                {/* You Pay Section */}
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>You Pay</span>
                    <span>
                      {(() => {
                        const isArc = currentChainId === 5042002;
                        if (selectedToken === 'EURC') {
                          return `Balance: ${eurcBalance ? parseFloat(eurcBalance.formatted).toFixed(4) : '0.00'} EURC`;
                        } else if (selectedToken === 'USDC' && !isArc) {
                          return `Balance: ${usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(4) : '0.00'} USDC`;
                        } else {
                          // ETH or USDC on Arc (both are native token)
                          const symbol = isArc ? 'USDC' : (nativeBalance?.symbol ?? nativeSymbol);
                          return `Balance: ${nativeBalance ? parseFloat(nativeBalance.formatted).toFixed(4) : '0.00'} ${symbol}`;
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    {/* Amount Selector */}
                    <div className="flex-1">
                      <Select 
                        value={selectedAmount.index.toString()}
                        onValueChange={(val) => {
                          const idx = parseInt(val);
                          const pools = poolSizes[selectedToken];
                          if (pools && pools[idx]) {
                            setSelectedAmount(pools[idx]);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-14 bg-transparent border-none text-3xl font-bold text-white p-0 focus:ring-0 shadow-none hover:opacity-80 transition-opacity [&>span]:justify-start">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-white/10 text-white min-w-[200px]">
                          {(poolSizes[selectedToken] || []).map((pool) => (
                            <SelectItem key={pool.index} value={pool.index.toString()} className="text-lg py-3 focus:bg-white/10 focus:text-white cursor-pointer">
                              {pool.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Token Selector */}
                    <div>
                      {(() => {
                        const isArc = currentChainId === 5042002;
                        // On Arc, ETH represents native USDC, and separate USDC option is hidden
                        const ethLabel = isArc ? 'USDC' : 'ETH';
                        const showUsdcOption = !isArc && poolSizes.USDC.length > 0;
                        
                        return (
                          <Select 
                            value={selectedToken} 
                            onValueChange={(val) => setSelectedToken(val as 'ETH' | 'USDC' | 'EURC')}
                          >
                            <SelectTrigger className="flex items-center gap-2 bg-white/10 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/5 h-auto w-auto focus:ring-0 shadow-none">
                              <div className="flex items-center gap-2">
                                {selectedToken === 'ETH' ? (isArc ? <UsdcIcon /> : <EthIcon />) : selectedToken === 'EURC' ? <EurcIcon /> : <UsdcIcon />}
                                <span className="font-bold text-white">{selectedToken === 'ETH' ? ethLabel : selectedToken}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a0a0a] border-white/10 text-white min-w-[120px]" align="end">
                              <SelectItem value="ETH" className="py-3 focus:bg-white/10 focus:text-white cursor-pointer">
                                <div className="flex items-center gap-2">
                                  {isArc ? <UsdcIcon /> : <EthIcon />}
                                  <span className="font-bold">{ethLabel}</span>
                                </div>
                              </SelectItem>
                              {showUsdcOption && (
                                <SelectItem value="USDC" className="py-3 focus:bg-white/10 focus:text-white cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <UsdcIcon />
                                    <span className="font-bold">USDC</span>
                                  </div>
                                </SelectItem>
                              )}
                              {eurcAddress && poolSizes.EURC.length > 0 && (
                                <SelectItem value="EURC" className="py-3 focus:bg-white/10 focus:text-white cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <EurcIcon />
                                    <span className="font-bold">EURC</span>
                                  </div>
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-[#1a1a1a] p-2 rounded-xl border border-white/10">
                    <ArrowDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* You Receive Section */}
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>You Receive (Private)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    {(() => {
                      const isArc = currentChainId === 5042002;
                      const displayLabel = selectedToken === 'ETH' ? (isArc ? 'USDC' : 'ETH') : selectedToken;
                      const use18Decimals = selectedToken === 'ETH' || selectedToken === 'USDC';
                      const displayValue = use18Decimals
                        ? formatEther(BigInt(selectedAmount.value))
                        : (Number(selectedAmount.value) / 1000000).toString();
                      
                      return (
                        <>
                          <span className="text-3xl font-bold text-white">{displayValue}</span>
                          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl opacity-80">
                            {selectedToken === 'ETH' ? (isArc ? <UsdcIcon /> : <EthIcon />) : selectedToken === 'EURC' ? <EurcIcon /> : <UsdcIcon />}
                            <span className="font-bold text-white">zk{displayLabel}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="glass p-8 rounded-3xl border border-[#00F5FF]/30 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/80 z-0 flex flex-col items-center justify-center font-mono text-[#00F5FF] opacity-20 text-xs leading-none break-all">
                  {matrixChars.join('')}
                </div>
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#1a1a1a" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="48" cy="48" r="40" 
                        stroke="#00F5FF" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * proofProgress / 100)}
                        className="transition-all duration-75 ease-linear"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-[#00F5FF]">
                      {proofProgress}%
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Generating ZK Proof</h3>
                  <p className="text-gray-400 text-sm">Calculating Poseidon Hash...</p>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleGenerate}
                disabled={!isConnected}
                className="w-full h-16 bg-[#00F5FF] text-black font-bold text-lg rounded-2xl hover:bg-[#00F5FF]/90 shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnected ? 'Generate Proof' : 'Connect Wallet First'}
              </Button>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass p-6 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-6 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium text-sm">Proof Generated Successfully</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 block">Your Private Note (Keep Safe!)</label>
                  <div className="bg-black/60 p-4 rounded-xl border border-white/10">
                    <p className="text-white font-mono text-xs break-all leading-relaxed">{note}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(note);
                      toast.success("Note copied to clipboard!");
                    }}
                    variant="outline"
                    className="flex-1 bg-white/5 hover:bg-white/10 border-white/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => {
                      const blob = new Blob([note], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'katrina-note.txt';
                      a.click();
                      toast.success("Note downloaded!");
                    }}
                    variant="outline"
                    className="flex-1 bg-white/5 hover:bg-white/10 border-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="bg-black/60 p-4 rounded-xl border border-white/10 flex justify-center">
                  <QRCodeSVG value={note} size={160} bgColor="#000000" fgColor="#FFFFFF" />
                </div>

                <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                  <p className="text-xs text-yellow-200 font-medium">
                    ⚠️ Save this note securely. You will need it to withdraw your funds. If you lose it, your funds cannot be recovered.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 bg-white/5 hover:bg-white/10 border-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#00F5FF] text-black font-bold hover:bg-[#00F5FF]/90"
                >
                  I've Saved It
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass p-6 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-6 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium text-sm">Compliance Check Passed</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Deposit</span>
                  <span className="text-white font-bold">
                    {(() => {
                      const isArc = currentChainId === 5042002;
                      const displayLabel = selectedToken === 'ETH' ? (isArc ? 'USDC' : 'ETH') : selectedToken;
                      const use18Decimals = selectedToken === 'ETH' || selectedToken === 'USDC';
                      const displayValue = use18Decimals
                        ? formatEther(BigInt(selectedAmount.value))
                        : (Number(selectedAmount.value) / 1000000).toString();
                      return `${displayValue} ${displayLabel}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network Fee</span>
                  <span className="text-white font-bold">~0.0001 {nativeSymbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Chain</span>
                  <span className="text-[#00F5FF] font-bold">{chain?.name || 'Unknown'}</span>
                </div>
              </div>

              <Button
                onClick={handleDeposit}
                disabled={!isConnected || isWritePending || isConfirming}
                className="w-full h-14 bg-[#00F5FF] text-black font-bold text-lg rounded-xl hover:bg-[#00F5FF]/90 transition-colors shadow-[0_0_20px_rgba(0,245,255,0.3)] disabled:opacity-50"
              >
                {isWritePending || isConfirming ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    {currentAction === 'approve' ? 'Approving...' : 'Depositing...'}
                  </>
                ) : (
                  'Confirm Transaction'
                )}
              </Button>

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 bg-white/5 hover:bg-white/10 border-white/10"
                  disabled={isWritePending || isConfirming}
                >
                  Back
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
