export const endpoints = {
  searchStock: (query: string) =>
    `/api/search-stock?query=${encodeURIComponent(query)}`,
  compare: (symbols: string[]) => `/api/compare?symbols=${symbols.join(',')}`,
  priceHistory: (symbol: string, period = '1y') =>
    `/api/price-history/${symbol}?period=${period}`,
  financials: (symbol: string, statement: string) =>
    `/api/financials/${symbol}?statement=${statement}`,
  holders: (symbol: string) => `/api/holders/${symbol}`,
  recommendation: (symbol: string) => `/api/recommendation/${symbol}`,
  newsAnalysis: (symbol: string) => `/api/news-analysis/${symbol}`,
  aiAnalysis: (symbol: string) => `/api/ai-analysis/${symbol}`,
  backtest: (symbol: string, period = '2y') =>
    `/api/backtest/${symbol}?period=${period}`,
  ipoAdvisor: () => '/api/ipo-advisor',
} as const
