'use client'

import { AppBackground } from '@/components/layout/app-background'
import { Header } from '@/components/layout/header'
import { MainNav } from '@/components/layout/main-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import { WatchlistProvider } from '@/providers/watchlist-provider'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WatchlistProvider>
      <div className="relative min-h-screen">
        <AppBackground />
        <Header />
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <MainNav />
        </div>
        <main className="container relative mx-auto max-w-7xl px-4 sm:px-6 py-8">
          {children}
        </main>
        <SiteFooter />
      </div>
    </WatchlistProvider>
  )
}
