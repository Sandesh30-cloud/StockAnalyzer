'use client'

import { TrendingUp } from 'lucide-react'
import ShinyText from '@/components/ShinyText'
import StarBorder from '@/components/StarBorder'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/20">
            <TrendingUp className="size-5" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <ShinyText
                text="StockAnalyzer"
                speed={3}
                color="oklch(0.96 0.01 250)"
                shineColor="oklch(0.75 0.18 165)"
                className="font-bold"
              />
            </h1>
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
              Compare & Analyze
            </p>
          </div>
        </div>
        <StarBorder
          as="div"
          className="hidden sm:block"
          color="rgb(52, 211, 153)"
          speed="5s"
          thickness={1}
          innerClassName="px-3 py-1.5 text-xs font-semibold"
        >
          <span className="inline-flex items-center gap-1.5 text-primary">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Live Market Data
          </span>
        </StarBorder>
      </div>
    </header>
  )
}
