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
  FileText,
  Sparkles,
  Activity,
  Wallet
} from 'lucide-react';
import { useState } from 'react';

import { WalletButton } from '@/components/WalletButton';
import { EthIcon, UsdcIcon } from '@/components/ui/icons';

// Arc-Style Pool Card Component
const PoolCard = ({ amount, token, delay }: { amount: string, token: string, delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="group relative"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-3xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-700" />
      
      <div className="relative h-full glass-card p-8 rounded-3xl overflow-hidden">
        {/* Animated Corner Accent */}
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-cyan-500/20 to-transparent" />
          <motion.div 
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        <div className="flex flex-col h-full justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                {token === 'ETH' ? <EthIcon className="w-8 h-8" /> : <UsdcIcon className="w-8 h-8" />}
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fixed Pool</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">Active</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-5xl font-black text-white mb-1 group-hover:text-gradient-static transition-all duration-500">{amount}</h3>
            <p className="text-xl text-slate-400 font-semibold">{token}</p>
          </div>
          
          <div className="mt-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Anonymity Set</span>
              <span className="text-cyan-400 font-mono">High</span>
            </div>
            <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" 
                initial={{ width: 0 }}
                whileInView={{ width: '90%' }}
                transition={{ duration: 1.5, delay: delay + 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    viewport={{ once: true }}
    className="glass-card p-6 rounded-2xl hover-lift"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-cyan-400" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function Home() {
  const [mascotClicks, setMascotClicks] = useState(0);

  const handleMascotClick = () => {
    setMascotClicks(prev => prev + 1);
    if (mascotClicks + 1 === 5) {
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
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity" />
              <img src="/logo-icon.svg" alt="KatrinaDEX" className="relative w-10 h-10" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white group-hover:neon-text transition-all duration-300">
              Katrina<span className="text-gradient-static">DEX</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/deposit" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors duration-300">Deposit</Link>
            <Link href="/withdraw" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors duration-300">Withdraw</Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors duration-300">Dashboard</Link>
            <Link href="/compliance" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors duration-300">Compliance</Link>
          </nav>

          <div className="hidden md:block">
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">building in arc</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 space-y-4"
            >
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl">
                Seu salário veio em ETH. Você comprou USDC na Binance.
              </p>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl">
                Mas agora… cada transação sua é <span className="text-red-400 font-semibold">pública</span> — e <span className="text-red-400 font-semibold">rastreável</span>.
              </p>
              <p className="text-lg md:text-xl text-cyan-400 leading-relaxed max-w-2xl font-semibold">
                O KatrinaDEX quebra essa cadeia — sem esconder o que é ilegal.
              </p>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tight mb-6">
              <span className="block">Private.</span>
              <span className="block text-gradient-static">Compliant.</span>
              <span className="block text-slate-400">Unstoppable.</span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/deposit">
                <Button className="w-full sm:w-auto h-16 px-10 text-lg font-bold glow-btn text-black rounded-2xl shimmer-btn">
                  <Wallet className="w-5 h-5 mr-2" />
                  Depositar com privacidade
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/compliance">
                <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-lg font-semibold border-slate-700 text-white hover:bg-white/5 rounded-2xl backdrop-blur-md group">
                  Ver como funciona (30s)
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Live Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-slate-500 text-sm mb-1">Total Value Locked</p>
                <p className="text-2xl font-black text-white font-mono">$42.5M<span className="text-cyan-400">+</span></p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-slate-500 text-sm mb-1">Anonymity Set</p>
                <p className="text-2xl font-black text-cyan-400 font-mono">15,234</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-slate-500 text-sm mb-1">Total Mixed</p>
                <p className="text-2xl font-black text-white font-mono">124k <span className="text-violet-400">ETH</span></p>
              </motion.div>
            </div>
          </motion.div>

          {/* Mascot Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 hidden lg:block"
            onClick={handleMascotClick}
          >
            {/* Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/20 via-violet-600/20 to-fuchsia-600/20 blur-[120px] rounded-full" />
            
            <Mascot className="relative z-10 w-full max-w-lg mx-auto cursor-pointer hover:scale-105 transition-transform duration-500" />
            
            {/* Floating ZK Badge */}
            <motion.div 
              animate={{ y: [0, -20, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 glass-card p-4 rounded-2xl border border-cyan-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-400 font-mono text-xs font-bold">ZK Proof Verified</span>
              </div>
            </motion.div>

            {/* Floating Security Badge */}
            <motion.div 
              animate={{ y: [0, 15, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 left-0 glass-card p-4 rounded-2xl border border-violet-500/30"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-violet-400" />
                <span className="text-violet-400 font-mono text-xs font-bold">Compliant</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Why <span className="text-gradient-static">KatrinaDEX</span>?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Built with cutting-edge ZK technology for maximum privacy and compliance</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Lock} title="ZK-SNARKs" description="Advanced zero-knowledge proofs ensure complete transaction privacy" delay={0.1} />
            <FeatureCard icon={Shield} title="Compliance Ready" description="Fully compliant with global AML and regulatory standards" delay={0.2} />
            <FeatureCard icon={Zap} title="Lightning Fast" description="Sub-second proof generation with minimal gas costs" delay={0.3} />
            <FeatureCard icon={Eye} title="Privacy First" description="No data collection, no tracking, complete anonymity" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Pools Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Choose your <span className="text-gradient-static">Pool</span></h2>
            <p className="text-slate-400 text-lg">Fixed deposits for maximum privacy and anonymity</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PoolCard amount="0.1" token="ETH" delay={0.1} />
            <PoolCard amount="1.0" token="ETH" delay={0.2} />
            <PoolCard amount="10" token="ETH" delay={0.3} />
            <PoolCard amount="10k" token="USDC" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Live Activity Section */}
      <section className="py-16 border-y border-white/5 bg-slate-950/50 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-slate-400 text-sm font-mono uppercase tracking-widest">Live Activity</span>
          </div>
          
          <div className="flex gap-4 animate-scroll">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-shrink-0 glass-card px-6 py-4 rounded-2xl flex items-center gap-4 min-w-[280px]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex gap-2 text-white font-mono text-sm">
                    <span>0x{Math.random().toString(16).slice(2, 6)}...</span>
                    <span className="filter blur-[3px] select-none">{Math.random().toString(16).slice(2, 6)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {['Deposited 0.1 ETH', 'Deposited 1.0 ETH', 'Withdrew 10 ETH', 'Deposited 10k USDC'][i % 4]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 relative z-10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <Link href="/" className="text-2xl font-black text-white mb-6 block">
                Katrina<span className="text-gradient-static">DEX</span>
              </Link>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                The first ZK privacy platform fully compliant with global regulations. Protect your assets without compromising legality.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="https://x.com/moon_fun1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-cyan-500/20 transition-colors group">
                  <Twitter className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                </a>
                <a href="https://github.com/andrezin784/katrinadex" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-cyan-500/20 transition-colors group">
                  <Github className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                </a>
                <a href="https://github.com/andrezin784/katrinadex#readme" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-cyan-500/20 transition-colors group">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Protocol</h4>
              <ul className="space-y-4 text-slate-400">
                <li><Link href="/docs" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
                <li><Link href="/compliance" className="hover:text-cyan-400 transition-colors">Compliance</Link></li>
                <li><Link href="/bug-bounty" className="hover:text-cyan-400 transition-colors">Bug Bounty</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Whitepaper</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Audit Reports</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Brand Assets</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
            <p>© 2025 KatrinaDEX. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="font-mono">v2.0.0-arc</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
