'use client'

import { TrendingUp } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">StockAnalyzer</h1>
            <p className="text-xs text-muted-foreground">Compare & Analyze</p>
          </div>
        </div>
      </div>
    </header>
  )
}
