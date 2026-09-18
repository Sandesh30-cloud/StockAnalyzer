export interface NewsArticle {
  title: string
  description?: string
  url: string
  publishedAt?: string
  provider?: string
  sentiment?: 'Positive' | 'Neutral' | 'Negative'
  sentimentScore?: number
}

export interface NewsAnalysisResponse {
  stock: string
  overallSentiment: 'Positive' | 'Neutral' | 'Negative'
  sentimentScore: number
  counts: {
    positive: number
    neutral: number
    negative: number
  }
  articles: NewsArticle[]
  error?: string
}
