'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, Shield, Eye, Lock } from 'lucide-react';

export default function Dashboard() {
  const history = [
    { type: 'Deposit', amount: '1.0 ETH', date: '2025-05-12', hash: '0x7a...3f2a' },
    { type: 'Withdraw', amount: '0.5 ETH', date: '2025-05-10', hash: '0x3b...9c1d' },
    { type: 'Deposit', amount: '10 ETH', date: '2025-04-28', hash: '0x1c...8d4e' },
  ];

  return (
    <div className="min-h-screen pt-24 px-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
        <h1 className="text-3xl font-bold text-white">Private Dashboard</h1>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Lock className="w-4 h-4 mr-2" /> Lock View
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="glass p-6 rounded-3xl border border-white/10">
          <h3 className="text-gray-400 mb-2">Total Mixed Volume</h3>
          <p className="text-4xl font-bold text-white">11.5 ETH</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/10">
          <h3 className="text-gray-400 mb-2">Compliance Score</h3>
          <p className="text-4xl font-bold text-[#00F5FF]">100%</p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
          <Button size="sm" variant="ghost" className="text-[#00F5FF] hover:text-[#00F5FF]/80">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {history.map((tx, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'Deposit' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {tx.type === 'Deposit' ? <Shield className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-white">{tx.type}</p>
                    <p className="text-sm text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{tx.amount}</p>
                  <p className="text-sm text-gray-500 font-mono">{tx.hash}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

