'use client'

import { WatchlistGuard } from '@/components/layout/watchlist-guard'
import { PriceChart } from '@/features/stocks/components/price-chart'
import { LineChart } from 'lucide-react'

export default function ChartsPage() {
  return (
    <div className="space-y-16 py-6">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <LineChart className="size-3" />
          Price Action
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Price Charts
        </h1>

        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg leading-relaxed">
          Review historical price action and trends for each symbol in your watchlist to identify support, resistance, and momentum.
        </p>
      </div>

      {/* Content */}
      <div className="w-full">
        <WatchlistGuard>
          {(symbols) => (
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl">
              <PriceChart symbols={symbols} />
            </div>
          )}
        </WatchlistGuard>
      </div>
    </div>
  )
}
