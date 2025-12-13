'use client';

import Link from 'next/link';
import { WalletButton } from './WalletButton';

export default function Header() {
  return (
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
  );
}


