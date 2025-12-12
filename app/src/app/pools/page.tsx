'use client';

import { 
  Lock,
  Search,
  TrendingUp,
  Users,
  Shield,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function PoolsPage() {
  const pools = [
    { token: 'ETH', amount: '0.1', tvl: '$145,230', deposits: 1245, anonymity: '98%', color: 'from-blue-400 to-blue-600' },
    { token: 'ETH', amount: '0.5', tvl: '$423,890', deposits: 876, anonymity: '96%', color: 'from-blue-400 to-blue-600' },
    { token: 'ETH', amount: '1.0', tvl: '$892,456', deposits: 1532, anonymity: '99%', color: 'from-blue-400 to-blue-600' },
    { token: 'ETH', amount: '5.0', tvl: '$567,123', deposits: 234, anonymity: '94%', color: 'from-blue-400 to-blue-600' },
    { token: 'ETH', amount: '10.0', tvl: '$234,567', deposits: 89, anonymity: '92%', color: 'from-blue-400 to-blue-600' },
    { token: 'USDC', amount: '100', tvl: '$98,234', deposits: 456, anonymity: '97%', color: 'from-green-400 to-green-600' },
    { token: 'USDC', amount: '1,000', tvl: '$345,678', deposits: 321, anonymity: '95%', color: 'from-green-400 to-green-600' },
    { token: 'USDC', amount: '10,000', tvl: '$189,456', deposits: 67, anonymity: '91%', color: 'from-green-400 to-green-600' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">katrina</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { name: 'Mix', href: '/' },
                { name: 'Pools', href: '/pools', active: true },
                { name: 'Stats', href: '/stats' },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.active ? 'text-[#a3e635]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 text-sm">Search</span>
            </div>
            <button className="bg-white/10 hover:bg-white/15 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors">
              Connect wallet
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Pools</h1>
          <p className="text-gray-400">Select a pool to mix your assets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total TVL', value: '$2.89M', icon: TrendingUp },
            { label: 'Total Deposits', value: '4,820', icon: Users },
            { label: 'Active Pools', value: '8', icon: Shield },
            { label: 'Avg Wait', value: '~2h', icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111] border border-white/10 rounded-xl p-4">
              <stat.icon className="w-5 h-5 text-gray-500 mb-2" />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/5 text-sm text-gray-500">
            <div>Pool</div>
            <div>TVL</div>
            <div>Deposits</div>
            <div>Anonymity</div>
            <div></div>
          </div>

          {pools.map((pool) => (
            <div
              key={`${pool.token}-${pool.amount}`}
              className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${pool.color}`} />
                <div>
                  <p className="font-medium">{pool.amount} {pool.token}</p>
                  <p className="text-xs text-gray-500">Fixed Pool</p>
                </div>
              </div>
              <div className="font-medium">{pool.tvl}</div>
              <div className="text-gray-400">{pool.deposits.toLocaleString()}</div>
              <div className="text-[#a3e635]">{pool.anonymity}</div>
              <div>
                <Link href="/deposit">
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                    Deposit
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}