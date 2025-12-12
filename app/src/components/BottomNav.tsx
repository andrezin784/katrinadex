'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowDownUp, Shield, BarChart3, Menu } from 'lucide-react';
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="relative flex flex-col items-center justify-center w-full h-full">
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-0 right-0 h-0.5 bg-[#00F5FF] shadow-[0_0_10px_#00F5FF]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <link.icon
                className={`w-6 h-6 transition-colors duration-200 ${
                  isActive ? 'text-[#00F5FF]' : 'text-gray-400'
                }`}
              />
              <span className={`text-[10px] mt-1 ${isActive ? 'text-[#00F5FF]' : 'text-gray-400'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

