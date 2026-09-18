'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useWatchlist } from '@/hooks/use-watchlist'
import { Header } from '@/components/layout/header'
import { MainNav } from '@/components/layout/main-nav'
import { AppBackground } from '@/components/layout/app-background'
import { SiteFooter } from '@/components/layout/site-footer'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const { selectedStocks, removeStock } = useWatchlist()

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white">
      <AppBackground />
      
      {/* Top Navigation */}
      <Header />

      {/* Persistent Watchlist Bar */}
      {selectedStocks.length > 0 && (
        <div className="sticky top-16 z-40 w-full bg-black/60 backdrop-blur-md border-b border-white/10 transition-all">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 whitespace-nowrap">
                Watchlist
              </span>
              <div className="flex gap-2">
                {selectedStocks.slice(0, 5).map((symbol: string) => (
                  <Badge 
                    key={symbol} 
                    className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border-white/10 text-white py-1 px-3 rounded-full transition-all"
                  >
                    <span className="font-mono font-bold tabular-nums">{symbol}</span>
                    <button 
                      onClick={() => removeStock(symbol)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            {selectedStocks.length > 0 && (
              <span className="hidden sm:block text-[10px] text-muted-foreground font-medium">
                {selectedStocks.length} symbols tracked
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <MainNav />
      </div>

      {/* Page Content */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 flex-1">
        {children}
      </main>

      <SiteFooter />
    </div>
  )
}
