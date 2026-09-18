'use client'

import { WatchlistGuard } from '@/components/layout/watchlist-guard'
import { ComparisonTable } from '@/features/stocks/components/comparison-table'
import { BarChart3 } from 'lucide-react'

export default function ComparePage() {
  return (
    <div className="space-y-16 py-6">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <BarChart3 className="size-3" />
          Metric Analysis
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Stock Comparison
        </h1>

        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg leading-relaxed">
          Compare valuation, profitability, leverage, momentum, and dividend metrics across your watchlist to identify the strongest players.
        </p>
      </div>

      {/* Content */}
      <div className="w-full">
        <WatchlistGuard
          minStocks={2}
          message="Add at least two stocks on the Search page to run a side-by-side comparison."
        >
          {(symbols) => (
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <ComparisonTable symbols={symbols} />
            </div>
          )}
        </WatchlistGuard>
      </div>
    </div>
  )
}
