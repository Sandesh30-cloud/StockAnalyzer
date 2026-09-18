'use client'

import { WatchlistGuard } from '@/components/layout/watchlist-guard'
import { FinancialsView } from '@/features/stocks/components/financials-view'
import { FileText } from 'lucide-react'

export default function FinancialsPage() {
  return (
    <div className="space-y-16 py-6">
      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <FileText className="size-3" />
          Fundamental Data
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Financial Statements
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg leading-relaxed">
          Inspect income statements, balance sheets, and cash flow data for your selected stocks to validate the financial story.
        </p>
      </div>
      <div className="w-full">
        <WatchlistGuard>
          {(symbols) => (
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl">
              <FinancialsView symbols={symbols} />
            </div>
          )}
        </WatchlistGuard>
      </div>
    </div>
  )
}
