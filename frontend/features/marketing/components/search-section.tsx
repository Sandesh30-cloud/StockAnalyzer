'use client'

import AnimatedContent from '@/components/animations/AnimatedContent'
import SpotlightCard from '@/components/animations/SpotlightCard'
import { StockSearch } from '@/features/stocks/components/stock-search'
import { HIGHLIGHT_PANELS } from '@/features/marketing/constants'

interface SearchSectionProps {
  selectedStocks: string[]
  onAddStock: (symbol: string) => void
  onRemoveStock: (symbol: string) => void
  maxStocks: number
}

export function SearchSection({
  selectedStocks,
  onAddStock,
  onRemoveStock,
  maxStocks,
}: SearchSectionProps) {
  return (
    <AnimatedContent distance={50} duration={0.8} threshold={0.15}>
      <SpotlightCard
        className="max-w-5xl mx-auto p-0 shadow-2xl shadow-primary/5"
        spotlightColor="rgba(52, 211, 153, 0.12)"
      >
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-3 text-center lg:text-left">
            <p className="text-sm font-medium text-primary">Launch your analysis</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Search a stock and turn it into a working research set.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Add up to five symbols, compare them across all tabs, and keep the same watchlist as
              you move from snapshots to deeper analysis.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {HIGHLIGHT_PANELS.map((panel) => {
                const Icon = panel.icon
                return (
                  <div
                    key={panel.title}
                    className="rounded-2xl border border-border/40 bg-card/45 p-4 text-left"
                  >
                    <div className="mb-3 inline-flex rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <h3 className="font-semibold tracking-tight">{panel.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {panel.body}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <StockSearch
              selectedStocks={selectedStocks}
              onAddStock={onAddStock}
              onRemoveStock={onRemoveStock}
              maxStocks={maxStocks}
            />
          </div>
        </div>
      </SpotlightCard>
    </AnimatedContent>
  )
}
