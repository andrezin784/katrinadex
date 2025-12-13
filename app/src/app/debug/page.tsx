'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount, useConfig } from 'wagmi';
import { toHex } from 'viem';
import { readContract } from '@wagmi/core';
import { CONTRACTS_CONFIG } from '@/lib/contracts';
import { MIXER_ABI } from '@/lib/abi';
import { buildPoseidon } from 'circomlibjs';

export default function DebugPage() {
  const config = useConfig();
  const { chain } = useAccount();
  const [note, setNote] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const contracts = CONTRACTS_CONFIG[(chain?.id as keyof typeof CONTRACTS_CONFIG) ?? 84532];

  const analyzeNote = async () => {
    if (!note) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      // Parse note
      const parts = note.trim().split('-');
      if (parts.length !== 5 || parts[0] !== 'katrina') {
        throw new Error("Invalid note format. Expected: katrina-{token}-{amount}-{secret}-{nullifier}");
      }
      
      const tokenType = parts[1].toUpperCase();
      const amountWei = parts[2];
      const secret = parts[3];
      const nullifier = parts[4];
      
      // Calculate commitment using Poseidon
      const poseidon = await buildPoseidon();
      const F = poseidon.F;
      const secretBigInt = BigInt(secret);
      const nullifierBigInt = BigInt(nullifier);
      
      // commitment = poseidon(nullifier, secret)
      const commitment = F.toObject(poseidon([nullifierBigInt, secretBigInt]));
      const commitmentHex = toHex(commitment, { size: 32 });
      
      // nullifierHash = poseidon(nullifier)
      const nullifierHash = F.toObject(poseidon([nullifierBigInt]));
      const nullifierHashHex = toHex(nullifierHash, { size: 32 });
      
      // Check if commitment exists in contract
      let commitmentExists = false;
      try {
        commitmentExists = await readContract(config, {
          address: contracts.MIXER as `0x${string}`,
          abi: MIXER_ABI,
          functionName: 'commitments',
          args: [commitmentHex],
        }) as boolean;
      } catch (e) {
        console.error("Error checking commitment:", e);
      }
      
      setResult({
        parsed: {
          token: tokenType,
          amount: amountWei,
          secret: secret.substring(0, 20) + '...',
          nullifier: nullifier.substring(0, 20) + '...',
        },
        calculated: {
          commitmentBigInt: commitment.toString(),
          commitmentHex,
          nullifierHashBigInt: nullifierHash.toString(),
          nullifierHashHex,
        },
        verification: {
          commitmentExists,
          contractAddress: contracts.MIXER,
        }
      });
      
      if (commitmentExists) {
        toast.success("Commitment found in contract! This note is valid.");
      } else {
        toast.error("Commitment NOT found in contract. This note cannot be used for withdrawal.");
      }
      
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze note");
      setResult({ error: error.message });
    }
    
    setLoading(false);
  };

  // Known commitments from the contract
  const knownCommitments = [
    { 
      commitment: '0x0935baee36878ed1b1c348bc199e4e5c06ecae3ff8c509b3928ff66b88fa2a6f',
      token: 'EURC',
      amount: '10 EURC (10000000)'
    },
    {
      commitment: '0x2eb240587b437d691786576cd17128659495d30ecc28bdde4fe29ebffde97a28',
      token: 'USDC (native)',
      amount: '10 USDC (10000000000000000000)'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Note Debugger</h1>
        <div className="w-10" />
      </div>

      <div className="glass p-6 rounded-3xl border border-white/10 space-y-6">
        <div>
          <label className="text-gray-400 text-sm font-medium mb-2 block">Paste your note to analyze</label>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="katrina-eth-10000000000000000000-SECRET-NULLIFIER"
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 font-mono text-sm h-24 resize-none"
          />
        </div>

        <Button 
          onClick={analyzeNote}
          disabled={!note || loading}
          className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl"
        >
          <Search className="w-5 h-5 mr-2" />
          {loading ? 'Analyzing...' : 'Analyze Note'}
        </Button>

        {result && !result.error && (
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-xl">
              <h3 className="text-white font-bold mb-2">Parsed Note</h3>
              <div className="text-sm text-gray-300 space-y-1 font-mono">
                <p>Token: <span className="text-violet-400">{result.parsed.token}</span></p>
                <p>Amount: <span className="text-violet-400">{result.parsed.amount}</span></p>
                <p>Secret: <span className="text-gray-500">{result.parsed.secret}</span></p>
                <p>Nullifier: <span className="text-gray-500">{result.parsed.nullifier}</span></p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl">
              <h3 className="text-white font-bold mb-2">Calculated Values</h3>
              <div className="text-sm text-gray-300 space-y-1 font-mono break-all">
                <p>Commitment (hex): <span className="text-cyan-400">{result.calculated.commitmentHex}</span></p>
                <p>NullifierHash (hex): <span className="text-cyan-400">{result.calculated.nullifierHashHex}</span></p>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              result.verification.commitmentExists 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {result.verification.commitmentExists ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-green-400 font-bold">Commitment EXISTS in contract</p>
                    <p className="text-green-300/70 text-sm">This note can be used for withdrawal</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-red-400 font-bold">Commitment NOT FOUND</p>
                    <p className="text-red-300/70 text-sm">This note cannot be used - the deposit may be on an old contract</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {result?.error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
            <p className="text-red-400">{result.error}</p>
          </div>
        )}

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-white font-bold mb-3">Known Deposits in Current Contract</h3>
          <p className="text-gray-400 text-sm mb-4">These commitments exist and can be withdrawn:</p>
          <div className="space-y-2">
            {knownCommitments.map((c, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-lg">
                <p className="text-sm text-violet-400 font-bold">{c.token} - {c.amount}</p>
                <p className="text-xs text-gray-500 font-mono break-all">{c.commitment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



