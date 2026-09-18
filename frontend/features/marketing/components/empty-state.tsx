'use client'

import { BarChart3 } from 'lucide-react'

import AnimatedContent from '@/components/animations/AnimatedContent'
import SpotlightCard from '@/components/animations/SpotlightCard'
import StarBorder from '@/components/animations/StarBorder'
import { QUICK_PICKS } from '@/features/marketing/constants'

interface EmptyStateProps {
  onAddStock: (symbol: string) => void
}

export function EmptyState({ onAddStock }: EmptyStateProps) {
  return (
    <AnimatedContent distance={50} duration={0.8} threshold={0.15}>
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <SpotlightCard className="border-dashed p-0" spotlightColor="rgba(52, 211, 153, 0.08)">
          <div className="flex h-full flex-col items-center justify-center py-14 px-6 text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <BarChart3 className="size-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Start with a stock set you already follow</h3>
            <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">
              Add a few symbols, then move through comparison, price action, holders, sentiment,
              and backtesting without leaving the same workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              <span className="mr-1 text-sm text-muted-foreground">Quick picks:</span>
              {QUICK_PICKS.map((symbol) => (
                <StarBorder
                  key={symbol}
                  as="button"
                  type="button"
                  onClick={() => onAddStock(symbol)}
                  color="rgb(52, 211, 153)"
                  speed="7s"
                  innerClassName="px-4 py-2 text-sm font-semibold hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  {symbol}
                </StarBorder>
              ))}
            </div>
          </div>
        </SpotlightCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <SpotlightCard className="p-0" spotlightColor="rgba(52, 211, 153, 0.08)">
            <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5">
              <p className="text-sm font-medium text-primary">Step 1</p>
              <h4 className="mt-2 text-lg font-semibold">Build your watchlist</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Search symbols from major exchanges and keep up to five names in the same
                comparison flow.
              </p>
            </div>
          </SpotlightCard>
          <SpotlightCard className="p-0" spotlightColor="rgba(52, 211, 153, 0.08)">
            <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5">
              <p className="text-sm font-medium text-primary">Step 2</p>
              <h4 className="mt-2 text-lg font-semibold">Validate the thesis</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Review fundamentals, ownership, price trends, and Python-based news sentiment before
                acting.
              </p>
            </div>
          </SpotlightCard>
          <SpotlightCard className="p-0 sm:col-span-2" spotlightColor="rgba(52, 211, 153, 0.08)">
            <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5">
              <p className="text-sm font-medium text-primary">Step 3</p>
              <h4 className="mt-2 text-lg font-semibold">Pressure-test your signal</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Use the backtesting tab to see how the trend-following strategy would have performed
                with moving averages, momentum filters, and risk-reward rules.
              </p>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </AnimatedContent>
  )
}
