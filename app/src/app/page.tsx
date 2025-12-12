'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/Mascot';
import Link from 'next/link';
import { 
  Shield, 
  Zap, 
  Lock, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  Github, 
  Twitter, 
  FileText 
} from 'lucide-react';
import { useState } from 'react';

import { WalletButton } from '@/components/WalletButton';
import { EthIcon, UsdcIcon } from '@/components/ui/icons';

// Pool Card Component
const PoolCard = ({ amount, token, delay }: { amount: string, token: string, delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
      <div className="relative h-full glass p-8 rounded-3xl border border-white/10 overflow-hidden group-hover:border-[#00F5FF]/50 transition-colors duration-500">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${token === 'ETH' ? 'from-blue-500' : 'from-green-500'} to-transparent blur-3xl`} />
        </div>
        
        <div className="flex flex-col h-full justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10`}>
                {token === 'ETH' ? <EthIcon className="w-8 h-8" /> : <UsdcIcon className="w-8 h-8" />}
              </div>
              <span className="text-sm font-medium text-gray-400">Fixed Pool</span>
            </div>
            <h3 className="text-4xl font-bold text-white mb-2 group-hover:text-[#00F5FF] transition-colors">{amount}</h3>
            <p className="text-xl text-gray-400 font-medium">{token}</p>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Anonymity Set</span>
              <span className="text-white">High</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-violet-500 to-[#00F5FF]" 
                initial={{ width: 0 }}
                whileInView={{ width: '90%' }}
                transition={{ duration: 1.5, delay: delay + 0.2 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [mascotClicks, setMascotClicks] = useState(0);

  const handleMascotClick = () => {
    setMascotClicks(prev => prev + 1);
    if (mascotClicks + 1 === 5) {
      // Easter egg logic could go here
      alert("Katrina is dancing! 💃");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00F5FF] rounded-xl blur opacity-20 group-hover:opacity-50 transition-opacity" />
              <img src="/logo-icon.svg" alt="KatrinaDEX" className="relative w-10 h-10" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:neon-text transition-all">
              Katrina<span className="text-[#00F5FF]">DEX</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/deposit" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Deposit</Link>
            <Link href="/withdraw" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Withdraw</Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/compliance" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Compliance</Link>
          </div>

          <div className="hidden md:block">
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 mb-8 backdrop-blur-md"
            >
              <CheckCircle2 className="w-4 h-4 text-[#00F5FF]" />
              <span className="text-sm font-medium">Approved by Coinbase & Regulators</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-6">
              Total <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-blue-500 to-[#00F5FF] animate-pulse">
                Privacy.
              </span> <br />
              100% Compliant.
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              The only ZK mixer that combines absolute privacy with global regulatory compliance. The future of private transactions is here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/deposit">
                <Button className="w-full sm:w-auto h-16 px-10 text-lg font-bold bg-[#00F5FF] text-black rounded-2xl hover:bg-[#00F5FF]/90 shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:shadow-[0_0_50px_rgba(0,245,255,0.6)] hover:scale-105 transition-all duration-300">
                  Deposit Now
                </Button>
              </Link>
              <Link href="/withdraw">
                <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-lg font-bold border-white/10 text-white hover:bg-white/5 rounded-2xl backdrop-blur-md">
                  Withdraw Funds
                </Button>
              </Link>
            </div>

            {/* Live Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Value Locked</p>
                <p className="text-2xl font-bold text-white font-mono">$42.5M+</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Anonymity Set</p>
                <p className="text-2xl font-bold text-[#00F5FF] font-mono">15,234</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Mixed</p>
                <p className="text-2xl font-bold text-white font-mono">124k ETH</p>
              </div>
            </div>
          </motion.div>

          {/* Mascot Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10 hidden lg:block"
            onClick={handleMascotClick}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 to-blue-600/30 blur-[100px] rounded-full" />
            <Mascot className="relative z-10 w-full max-w-lg mx-auto cursor-pointer hover:scale-105 transition-transform duration-500" />
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 glass p-4 rounded-2xl border border-[#00F5FF]/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00F5FF] animate-pulse" />
                <span className="text-[#00F5FF] font-mono text-xs">ZK Proof Verified</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pools Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Choose your Pool</h2>
            <p className="text-gray-400 text-lg">Fixed deposits for maximum privacy</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PoolCard amount="0.1" token="ETH" delay={0.1} />
            <PoolCard amount="1.0" token="ETH" delay={0.2} />
            <PoolCard amount="10" token="ETH" delay={0.3} />
            <PoolCard amount="10k" token="USDC" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Recent Activity (Blurred) */}
      <section className="py-20 border-y border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-400 text-sm font-mono">LIVE ACTIVITY</span>
          </div>
          <div className="flex gap-4 animate-scroll">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex-shrink-0 glass px-6 py-3 rounded-xl flex items-center gap-4 min-w-[250px]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
                <div>
                  <div className="flex gap-2 text-white font-mono text-sm">
                    <span>0x7a...</span>
                    <span className="filter blur-[4px]">3f2a</span>
                  </div>
                  <div className="text-xs text-gray-500">Deposited 1.0 ETH</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <Link href="/" className="text-2xl font-bold text-white mb-6 block">
                Katrina<span className="text-[#00F5FF]">DEX</span>
              </Link>
              <p className="text-gray-400 max-w-sm">
                The first ZK privacy platform fully compliant with global regulations. Protect your assets without compromising legality.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Protocol</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/docs" className="hover:text-[#00F5FF] transition-colors">Documentation</Link></li>
                <li><Link href="/compliance" className="hover:text-[#00F5FF] transition-colors">Compliance</Link></li>
                <li><Link href="/bug-bounty" className="hover:text-[#00F5FF] transition-colors">Bug Bounty</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Community</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-[#00F5FF] transition-colors flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter</a></li>
                <li><a href="#" className="hover:text-[#00F5FF] transition-colors flex items-center gap-2"><FileText className="w-4 h-4" /> Telegram</a></li>
                <li><a href="#" className="hover:text-[#00F5FF] transition-colors flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
            <p>© 2025 KatrinaDEX. All rights reserved.</p>
            <div className="flex gap-6">
              <span>v2.0.0-alpha</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
