'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowDownUp, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/deposit', icon: ArrowDownUp, label: 'Mix' },
    { href: '/withdraw', icon: Shield, label: 'Withdraw' },
    { href: '/dashboard', icon: BarChart3, label: 'Dash' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-cyan-500/10 pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="relative flex flex-col items-center justify-center w-full h-full group">
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <link.icon
                className={`w-6 h-6 transition-colors duration-200 ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
