'use client'

import { WatchlistGuard } from '@/components/layout/watchlist-guard'
import { HoldersView } from '@/features/stocks/components/holders-view'
import { Users } from 'lucide-react'

export default function HoldersPage() {
  return (
    <div className="space-y-16 py-6">
      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <Users className="size-3" />
          Ownership Analysis
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Holders
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg leading-relaxed">
          Review institutional, insider, and mutual fund ownership for each watchlist symbol to gauge smart money conviction.
        </p>
      </div>
      <div className="w-full">
        <WatchlistGuard>
          {(symbols) => (
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl">
              <HoldersView symbols={symbols} />
            </div>
          )}
        </WatchlistGuard>
      </div>
    </div>
  )
}
