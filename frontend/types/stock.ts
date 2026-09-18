export interface StockResult {
  symbol: string
  name: string
  sector: string
  industry: string
  marketCap: number | null
  price: number | null
  change: number | null
  currency?: string
  currencySymbol?: string
}

export interface ComparisonStock {
  symbol: string
  name: string
  currency?: string
  currencySymbol?: string
  sector: string
  price: number | null
  change: number | null
  marketCap: number | null
  marketCapFormatted: string | null
  revenue: number | null
  revenueFormatted: string | null
  netProfit: number | null
  netProfitFormatted: string | null
  roe: number | null
  pe: number | null
  forwardPE: number | null
  debtToEquity: number | null
  eps: number | null
  dividendYield: number | null
  beta: number | null
  error?: string
}

export interface SearchStockResponse {
  results?: StockResult[]
  error?: string
}

export interface CompareResponse {
  comparison: ComparisonStock[]
  error?: string
}
