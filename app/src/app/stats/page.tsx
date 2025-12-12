'use client';

import { 
  Lock,
  Search,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  Globe,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function StatsPage() {
  const activity = [
    { amount: '1.0', token: 'ETH', time: '2 min ago' },
    { amount: '0.5', token: 'ETH', time: '5 min ago' },
    { amount: '5,000', token: 'USDC', time: '8 min ago' },
    { amount: '0.1', token: 'ETH', time: '12 min ago' },
    { amount: '1,000', token: 'USDC', time: '15 min ago' },
    { amount: '5.0', token: 'ETH', time: '23 min ago' },
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
                { name: 'Pools', href: '/pools' },
                { name: 'Stats', href: '/stats', active: true },
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
      <main className="max-w-6xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Protocol Stats</h1>
          <p className="text-gray-400">Real-time metrics and analytics</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Value Locked', value: '$2.89M', change: '+12.5%', icon: TrendingUp },
            { label: '24h Volume', value: '$892K', change: '+8.2%', icon: Activity },
            { label: 'Total Transactions', value: '15,847', change: '+156', icon: BarChart3 },
            { label: 'Unique Users', value: '4,231', change: '+89', icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111] border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5 text-gray-500" />
                <span className="text-xs px-2 py-1 rounded-full bg-[#a3e635]/20 text-[#a3e635]">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Volume (7d)</h2>
              <div className="flex gap-1">
                {['1D', '7D', '1M', 'ALL'].map((period, i) => (
                  <button
                    key={period}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      i === 1 ? 'bg-[#a3e635] text-black' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-end justify-between h-48 gap-3">
              {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-[#a3e635] to-[#a3e635]/50 rounded-t-lg transition-all"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Recent Activity</h2>
              <div className="w-2 h-2 bg-[#a3e635] rounded-full animate-pulse" />
            </div>

            <div className="space-y-4">
              {activity.map((tx, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                      tx.token === 'ETH' ? 'from-blue-400 to-blue-600' : 'from-green-400 to-green-600'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{tx.amount} {tx.token}</p>
                      <p className="text-xs text-gray-500">{tx.time}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#a3e635]">Mixed</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#111] border border-white/10 rounded-xl p-5">
            <Globe className="w-5 h-5 text-cyan-400 mb-3" />
            <p className="text-xl font-bold">Base</p>
            <p className="text-sm text-gray-500">L2 Network</p>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-xl p-5">
            <Clock className="w-5 h-5 text-violet-400 mb-3" />
            <p className="text-xl font-bold">2.8s</p>
            <p className="text-sm text-gray-500">Avg Proof Time</p>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-xl p-5">
            <TrendingUp className="w-5 h-5 text-[#a3e635] mb-3" />
            <p className="text-xl font-bold">99.98%</p>
            <p className="text-sm text-gray-500">Uptime (30d)</p>
          </div>
        </div>
      </main>
    </div>
  );
}