'use client'

import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useWatchlist } from '@/providers/watchlist-provider'

interface WatchlistGuardProps {
  children: (symbols: string[]) => React.ReactNode
  minStocks?: number
  message?: string
}

export function WatchlistGuard({
  children,
  minStocks = 1,
  message = 'Add stocks to your watchlist before using this section.',
}: WatchlistGuardProps) {
  const { selectedStocks, isReady } = useWatchlist()

  if (!isReady) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading watchlist...
        </CardContent>
      </Card>
    )
  }

  if (selectedStocks.length < minStocks) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <BarChart3 className="size-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Watchlist required</h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {message}
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/search'}
            className="px-6 py-2"
          >
            Go to Search
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children(selectedStocks)}</>
}
