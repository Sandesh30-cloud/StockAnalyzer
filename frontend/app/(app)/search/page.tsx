'use client'

import { SymbolSearch } from '@/components/ui/symbol-search'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/features/marketing/components/empty-state'
import { useWatchlist } from '@/hooks/use-watchlist'
import { Search, LayoutGrid } from 'lucide-react'

export default function SearchPage() {
  const { selectedStocks, addStock, removeStock, maxStocks } = useWatchlist()

  return (
    <div className="space-y-16 py-6">
      {/* Header Section: Eyebrow -> H1 -> Subtext -> Primary Action */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <Search className="size-3" />
          Discovery
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Search & Watchlist
        </h1>

        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg leading-relaxed">
          Find stocks and build a focused comparison set of up to five symbols to analyze across our entire research suite.
        </p>

        {/* Primary Action: Symbol Search */}
        <div className="w-full max-w-2xl pt-4">
          <SymbolSearch
            selectedStocks={selectedStocks}
            onAddStock={addStock}
            onRemoveStock={removeStock}
            maxStocks={maxStocks}
          />
        </div>
      </div>

      {/* Content Grid / State */}
      <div className="space-y-10">
        {selectedStocks.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <EmptyState onAddStock={addStock} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <LayoutGrid className="size-5" />
                  <span className="font-bold uppercase tracking-widest text-xs">Your Set</span>
                </div>
                <div className="space-y-2">
                  {selectedStocks.map(symbol => (
                    <div key={symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group">
                      <span className="font-mono font-bold tabular-nums text-white">{symbol}</span>
                      <button 
                        onClick={() => removeStock(symbol)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center pt-4">
                  {selectedStocks.length} / {maxStocks} symbols selected
                </p>
              </CardContent>
            </Card>
            
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-semibold text-white">Next Steps</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Now that you have a watchlist, head to the Comparison or Charts tab to start analyzing these symbols side-by-side.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-semibold text-white">Pro Tip</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Try adding a sector leader and a smaller competitor to see the divergence in financial health.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
