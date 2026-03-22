'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Activity, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface BacktestingProps {
  symbols: string[]
}

interface BacktestTrade {
  entryDate: string
  entryPrice: number
  entryRsi: number
  entrySignal: string
  exitDate: string
  exitPrice: number
  returnPercent: number
  exitRsi: number
  exitReason: string
  holdingDays: number
}

interface BacktestResponse {
  symbol: string
  strategy: string
  rules: string[]
  periodStart: string
  periodEnd: string
  signals: {
    currentSignal: 'Bullish' | 'Neutral' | 'Bearish'
    buySignals: number
    sellSignals: number
  }
  metrics: {
    totalReturnPercent: number
    buyHoldReturnPercent: number
    maxDrawdownPercent: number
    winRatePercent: number
    tradeCount: number
    exposurePercent: number
    avgTradeReturnPercent: number
    bestTradePercent: number
    worstTradePercent: number
  }
  latest: {
    close: number
    sma20: number | null
    sma50: number | null
    rsi14: number | null
  }
  trades: BacktestTrade[]
  error?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function MetricPill({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className={`rounded-xl border p-4 ${emphasis ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20'}`}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold">{value}</p>
    </div>
  )
}

export function BacktestingView({ symbols }: BacktestingProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0] || '')

  useEffect(() => {
    if (symbols.length > 0 && !symbols.includes(selectedSymbol)) {
      setSelectedSymbol(symbols[0])
    }
  }, [selectedSymbol, symbols])

  const { data, isLoading } = useSWR<BacktestResponse>(
    selectedSymbol ? `/api/backtest/${selectedSymbol}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  if (symbols.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Select stocks to run backtests</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backtesting</CardTitle>
          <CardDescription>Loading strategy performance...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Backtesting
            </CardTitle>
            <CardDescription>
              SMA20/SMA50 strategy results for {selectedSymbol}
            </CardDescription>
          </div>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              {symbols.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {data?.error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {data.error}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    <h4 className="font-medium">{data?.strategy}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Test window: {data?.periodStart} to {data?.periodEnd}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        data?.signals.currentSignal === 'Bullish'
                          ? 'success'
                          : data?.signals.currentSignal === 'Bearish'
                            ? 'destructive'
                            : 'warning'
                      }
                    >
                      Signal: {data?.signals.currentSignal}
                    </Badge>
                    <Badge variant="outline">Buy signals: {data?.signals.buySignals ?? 0}</Badge>
                    <Badge variant="outline">Sell signals: {data?.signals.sellSignals ?? 0}</Badge>
                  </div>
                </div>
              </div>
              {!!data?.rules?.length && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-medium">Strategy Rules</h5>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    {data.rules.map((rule) => (
                      <p key={rule}>{rule}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <MetricPill label="Strategy Return" value={`${data?.metrics.totalReturnPercent?.toFixed(2)}%`} emphasis />
              <MetricPill label="Buy & Hold Return" value={`${data?.metrics.buyHoldReturnPercent?.toFixed(2)}%`} />
              <MetricPill label="Max Drawdown" value={`${data?.metrics.maxDrawdownPercent?.toFixed(2)}%`} />
              <MetricPill label="Win Rate" value={`${data?.metrics.winRatePercent?.toFixed(2)}%`} />
              <MetricPill label="Trades" value={String(data?.metrics.tradeCount ?? 0)} />
              <MetricPill label="Exposure" value={`${data?.metrics.exposurePercent?.toFixed(2)}%`} />
              <MetricPill label="Avg Trade" value={`${data?.metrics.avgTradeReturnPercent?.toFixed(2)}%`} />
              <MetricPill label="Best Trade" value={`${data?.metrics.bestTradePercent?.toFixed(2)}%`} />
              <MetricPill label="Worst Trade" value={`${data?.metrics.worstTradePercent?.toFixed(2)}%`} />
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <MetricPill label="Latest Close" value={data?.latest.close?.toFixed(2) ?? 'N/A'} />
              <MetricPill label="Latest SMA20" value={data?.latest.sma20?.toFixed(2) ?? 'N/A'} />
              <MetricPill label="Latest SMA50" value={data?.latest.sma50?.toFixed(2) ?? 'N/A'} />
              <MetricPill label="Latest RSI14" value={data?.latest.rsi14?.toFixed(2) ?? 'N/A'} />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Recent Trades</h4>
              {data?.trades?.length ? (
                <div className="space-y-2">
                  {data.trades.map((trade) => (
                    <div
                      key={`${trade.entryDate}-${trade.exitDate}-${trade.entryPrice}`}
                      className="rounded-xl border border-border/50 bg-card p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            {trade.entryDate} @ {trade.entryPrice.toFixed(2)} {'->'} {trade.exitDate} @ {trade.exitPrice.toFixed(2)}
                          </p>
                          <p>
                            Entry RSI: {trade.entryRsi.toFixed(2)} | Exit RSI: {trade.exitRsi.toFixed(2)} | Hold: {trade.holdingDays} days
                          </p>
                          <p>{trade.exitReason}</p>
                        </div>
                        <Badge variant={trade.returnPercent >= 0 ? 'success' : 'destructive'}>
                          {trade.returnPercent >= 0 ? '+' : ''}
                          {trade.returnPercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
                  No trades were generated in the selected period.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
