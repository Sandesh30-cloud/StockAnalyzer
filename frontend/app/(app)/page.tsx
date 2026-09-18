'use client'

import Link from 'next/link'
import { ArrowRight, Lightbulb, Rocket, BarChart3, TrendingUp } from 'lucide-react'

import AnimatedContent from '@/components/animations/AnimatedContent'
import BlurText from '@/components/animations/BlurText'
import ShinyText from '@/components/animations/ShinyText'
import StarBorder from '@/components/animations/StarBorder'
import { Card, CardContent } from '@/components/ui/card'
import { SymbolSearch } from '@/components/ui/symbol-search'
import { useWatchlist } from '@/hooks/use-watchlist'
import { FEATURE_CARDS } from '@/features/marketing/constants'

export default function HomePage() {
  const { selectedStocks, addStock, removeStock } = useWatchlist()

  return (
    <div className="space-y-16 py-6">
      {/* Header Section: Eyebrow -> H1 -> Subtext -> Primary Action */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <Lightbulb className="size-3" />
          Market Intelligence
        </div>

        <BlurText
          text="Understand a stock before you commit capital."
          delay={80}
          animateBy="words"
          direction="top"
          className="text-4xl sm:text-6xl font-bold tracking-tight text-balance text-white"
        />

        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg leading-relaxed">
          StockAnalyzer turns scattered market information into a guided workflow with
          comparison tables, financial breakdowns, holders data, and backtesting powered by{' '}
          <ShinyText
            text="live market data"
            speed={2.5}
            color="oklch(0.65 0.02 250)"
            shineColor="oklch(0.75 0.18 165)"
            className="font-medium"
          />
          . Move from curiosity to conviction with less friction.
        </p>

        {/* Primary Action: Symbol Search */}
        <div className="w-full max-w-2xl pt-4">
          <SymbolSearch
            selectedStocks={selectedStocks}
            onAddStock={addStock}
            onRemoveStock={removeStock}
          />
        </div>
      </div>

      {/* Content Grid: Feature Cards */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Professional Research Suite</h2>
          <p className="text-muted-foreground">Everything you need to validate an investment thesis in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="group flex flex-col h-full">
                <CardContent className="p-6 space-y-4 flex flex-col h-full">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Final CTA */}
      <div className="flex flex-col items-center text-center space-y-6 py-12 border-t border-white/5">
        <h2 className="text-3xl font-bold text-white">Ready to analyze?</h2>
        <p className="text-muted-foreground max-w-xl">
          Build your watchlist on the Search page, then open each analysis section from the navigation bar to start your research.
        </p>
        <StarBorder
          as={Link}
          href="/search"
          color="rgb(52, 211, 153)"
          speed="7s"
          innerClassName="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white"
        >
          Open Search
          <ArrowRight className="size-4" />
        </StarBorder>
      </div>
    </div>
  )
}
