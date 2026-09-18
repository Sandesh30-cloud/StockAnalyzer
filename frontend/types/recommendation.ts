export interface Signal {
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  message: string
}

export interface RecommendationData {
  symbol: string
  name: string
  longTerm: {
    recommendation: string
    score: number
    signals: Signal[]
  }
  shortTerm: {
    recommendation: string
    score: number
    signals: Signal[]
  }
  metrics: {
    pe: number | null
    forwardPE: number | null
    roe: number | null
    debtToEquity: number | null
    dividendYield: number | null
    beta: number | null
    priceChange1m: number | null
    priceChange3m: number | null
    volumeTrend: number | null
    sma20: number | null
    sma50: number | null
    movingAverageSignal: 'Bullish' | 'Neutral' | 'Bearish'
  }
  error?: string
}

export interface NewsAnalysisData {
  overallSentiment: 'Positive' | 'Neutral' | 'Negative'
  sentimentScore: number
  articles: Array<{
    title: string
    url: string
    sentiment: 'Positive' | 'Neutral' | 'Negative'
  }>
  error?: string
}

export interface AIAnalysisData {
  score: number | null
  confidence: number | null
  view: 'BUY' | 'HOLD' | 'SELL' | null
  summary: string
  bullishFactors: string[]
  bearishFactors: string[]
  error?: string
}
