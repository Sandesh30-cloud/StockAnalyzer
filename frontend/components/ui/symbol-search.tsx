'use client'

import { useState, useCallback } from 'react'
import { Search, Plus, X, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { formatMarketCap } from '@/lib/format/currency'
import type { SearchStockResponse, StockResult } from '@/types/stock'

interface SymbolSearchProps {
  selectedStocks: string[]
  onAddStock: (symbol: string) => void
  onRemoveStock: (symbol: string) => void
  maxStocks?: number
}

export function SymbolSearch({
  selectedStocks,
  onAddStock,
  onRemoveStock,
  maxStocks = 5
}: SymbolSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchStock = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await apiFetch<SearchStockResponse>(
        endpoints.searchStock(searchQuery)
      )

      if (fetchError) {
        setError(fetchError)
        setResults([])
        return
      }

      if (data?.error) {
        setError(data.error)
        setResults([])
      } else {
        setResults(data?.results || [])
      }
    } catch {
      setError('Backend unavailable. Run: cd backend && python3 -m uvicorn main:app --reload --port 8000')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = () => {
    searchStock(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatMarketCapValue = (cap: number | null, currencySymbol = '$') =>
    formatMarketCap(cap, currencySymbol)

  return (
    <div className="relative w-full max-w-2xl mx-auto space-y-5">
      {/* Search Input */}
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by symbol (e.g., AAPL, MSFT, GOOGL)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-12 h-14 rounded-xl border-border/50 bg-white/5 focus:bg-background transition-colors text-lg font-medium"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="h-14 px-8 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
        >
          {isLoading ? <Loader2 className="size-5 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive text-center flex items-center justify-center gap-2">
          {error}
        </p>
      )}

      {/* Search Results Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-3 space-y-3 p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          {results.map((stock) => (
            <Card
              key={stock.symbol}
              className="py-3 rounded-xl border-white/10 bg-white/5 hover:border-emerald-500/40 hover:bg-white/10 transition-all duration-200"
            >
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg tabular-nums text-white">{stock.symbol}</span>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider rounded-md border-white/20 text-muted-foreground">
                      {stock.sector || 'N/A'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {stock.name}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-mono font-semibold text-lg tabular-nums text-white">
                      {stock.price !== null && stock.price !== undefined ? `${stock.currencySymbol || '$'}${stock.price.toFixed(2)}` : 'N/A'}
                    </p>
                    {stock.change !== null && (
                      <p
                        className={cn(
                          'text-xs flex items-center justify-end gap-1 font-medium tabular-nums',
                          stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                        )}
                      >
                        {stock.change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs hidden sm:block">
                    <p className="text-muted-foreground">Market Cap</p>
                    <p className="font-semibold tabular-nums text-white">
                      {formatMarketCapValue(stock.marketCap, stock.currencySymbol || '$')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedStocks.includes(stock.symbol) ? 'secondary' : 'default'}
                    className={cn(
                      "rounded-lg font-medium transition-all",
                      selectedStocks.includes(stock.symbol) ? "bg-white/10 text-white border-white/20" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    )}
                    onClick={() => {
                      if (selectedStocks.includes(stock.symbol)) {
                        onRemoveStock(stock.symbol)
                      } else {
                        onAddStock(stock.symbol)
                      }
                    }}
                    disabled={
                      !selectedStocks.includes(stock.symbol) &&
                      selectedStocks.length >= maxStocks
                    }
                  >
                    {selectedStocks.includes(stock.symbol) ? (
                      <>
                        <X className="size-3.5 mr-1" />
                        Remove
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
