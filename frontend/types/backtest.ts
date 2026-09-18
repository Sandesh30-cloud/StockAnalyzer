export interface BacktestTrade {
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

export interface BacktestResponse {
  strategy: string
  rules: string[]
  periodStart: string
  periodEnd: string
  signals: {
    currentSignal: string
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
