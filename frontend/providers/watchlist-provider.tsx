'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { toast } from 'sonner'

const STORAGE_KEY = 'stockanalyzer.watchlist'
const DEFAULT_MAX_STOCKS = 5

interface WatchlistContextValue {
  selectedStocks: string[]
  addStock: (symbol: string) => void
  removeStock: (symbol: string) => void
  maxStocks: number
  isReady: boolean
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null)

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSelectedStocks(JSON.parse(stored) as string[])
      }
    } catch {
      setSelectedStocks([])
    } finally {
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isReady) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedStocks))
  }, [isReady, selectedStocks])

  const addStock = useCallback((symbol: string) => {
    const normalized = symbol.toUpperCase()

    setSelectedStocks((current) => {
      if (current.includes(normalized)) {
        toast.error('Stock already added')
        return current
      }

      if (current.length >= DEFAULT_MAX_STOCKS) {
        toast.error(`Maximum ${DEFAULT_MAX_STOCKS} stocks can be compared`)
        return current
      }

      toast.success(`${normalized} added to comparison`)
      return [...current, normalized]
    })
  }, [])

  const removeStock = useCallback((symbol: string) => {
    setSelectedStocks((current) => current.filter((item) => item !== symbol))
    toast.info(`${symbol} removed from comparison`)
  }, [])

  const value = useMemo(
    () => ({
      selectedStocks,
      addStock,
      removeStock,
      maxStocks: DEFAULT_MAX_STOCKS,
      isReady,
    }),
    [addStock, isReady, removeStock, selectedStocks]
  )

  return (
    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)

  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider')
  }

  return context
}
