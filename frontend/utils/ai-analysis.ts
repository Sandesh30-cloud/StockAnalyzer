type RecommendationMetrics = {
  pe: number | null
  forwardPE: number | null
  roe: number | null
  debtToEquity: number | null
  dividendYield: number | null
  beta: number | null
  priceChange1m: number | null
  priceChange3m: number | null
  volumeTrend: number | null
}

type RecommendationPayload = {
  symbol: string
  name: string
  metrics: RecommendationMetrics
}

type NewsPayload = {
  overallSentiment: 'Positive' | 'Neutral' | 'Negative'
  sentimentScore: number
  articles: Array<{
    title: string
    sentiment: 'Positive' | 'Neutral' | 'Negative'
  }>
}

type StockInfoPayload = {
  symbol: string
  name: string
  price: number | null
  change: number | null
  currency?: string
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function pushReason(reasons: string[], condition: boolean, message: string) {
  if (condition) reasons.push(message)
}

export function generateAIAnalysis({
  stock,
  recommendation,
  stockInfo,
  news,
}: {
  stock: string
  recommendation: RecommendationPayload
  stockInfo: StockInfoPayload
  news: NewsPayload
}) {
  let score = 50
  const bullish: string[] = []
  const bearish: string[] = []

  const metrics = recommendation.metrics

  if (typeof metrics.roe === 'number') {
    if (metrics.roe >= 20) {
      score += 14
      bullish.push(`Strong ROE of ${metrics.roe.toFixed(1)}%`)
    } else if (metrics.roe >= 12) {
      score += 8
      bullish.push(`Healthy ROE of ${metrics.roe.toFixed(1)}%`)
    } else if (metrics.roe < 6) {
      score -= 10
      bearish.push(`Low ROE of ${metrics.roe.toFixed(1)}%`)
    }
  }

  if (typeof metrics.debtToEquity === 'number') {
    if (metrics.debtToEquity <= 0.5) {
      score += 10
      bullish.push(`Low debt-to-equity at ${metrics.debtToEquity.toFixed(2)}`)
    } else if (metrics.debtToEquity >= 2) {
      score -= 12
      bearish.push(`High debt-to-equity at ${metrics.debtToEquity.toFixed(2)}`)
    }
  }

  if (typeof metrics.forwardPE === 'number' && typeof metrics.pe === 'number') {
    if (metrics.forwardPE < metrics.pe) {
      score += 6
      bullish.push('Forward P/E is below trailing P/E')
    } else if (metrics.forwardPE > metrics.pe * 1.2) {
      score -= 6
      bearish.push('Forward P/E is materially above trailing P/E')
    }
  }

  if (typeof metrics.priceChange3m === 'number') {
    if (metrics.priceChange3m >= 10) {
      score += 12
      bullish.push(`Strong 3-month momentum at +${metrics.priceChange3m.toFixed(1)}%`)
    } else if (metrics.priceChange3m > 0) {
      score += 5
      bullish.push(`Positive 3-month momentum at +${metrics.priceChange3m.toFixed(1)}%`)
    } else if (metrics.priceChange3m <= -10) {
      score -= 12
      bearish.push(`Weak 3-month momentum at ${metrics.priceChange3m.toFixed(1)}%`)
    } else if (metrics.priceChange3m < 0) {
      score -= 5
      bearish.push(`Negative 3-month momentum at ${metrics.priceChange3m.toFixed(1)}%`)
    }
  }

  if (typeof metrics.priceChange1m === 'number') {
    if (metrics.priceChange1m >= 4) {
      score += 4
    } else if (metrics.priceChange1m <= -4) {
      score -= 4
    }
  }

  if (news.overallSentiment === 'Positive') {
    score += 10
    bullish.push(`Recent news flow is positive across ${news.articles.length} articles`)
  } else if (news.overallSentiment === 'Negative') {
    score -= 10
    bearish.push(`Recent news flow is negative across ${news.articles.length} articles`)
  }

  if (typeof metrics.dividendYield === 'number' && metrics.dividendYield >= 0.02) {
    score += 4
    bullish.push(`Dividend yield of ${(metrics.dividendYield * 100).toFixed(2)}% supports shareholder returns`)
  }

  if (typeof metrics.beta === 'number' && metrics.beta >= 1.7) {
    score -= 4
    bearish.push(`High beta of ${metrics.beta.toFixed(2)} increases volatility risk`)
  }

  score = clamp(score, 0, 100)

  const view = score >= 65 ? 'BUY' : score <= 35 ? 'SELL' : 'HOLD'
  const confidence = clamp(Math.round(45 + Math.abs(score - 50) * 1.2), 45, 92)

  const topBullish = bullish.slice(0, 3)
  const topBearish = bearish.slice(0, 3)

  const lines = [
    `Outlook`,
    `${recommendation.name || stock} currently scores ${score}/100 in the local AI engine, which results in an ${view} view with ${confidence}% confidence.`,
    ``,
    `Drivers`,
    ...(topBullish.length > 0 ? topBullish.map((item) => `- ${item}`) : ['- No strong bullish drivers were detected from the available data.']),
    ``,
    `Risks`,
    ...(topBearish.length > 0 ? topBearish.map((item) => `- ${item}`) : ['- No major risk signal stood out in the current dataset.']),
    ``,
    `AI View: ${view}`,
  ]

  return {
    stock,
    score,
    confidence,
    view,
    bullishFactors: bullish,
    bearishFactors: bearish,
    summary: lines.join('\n'),
    meta: {
      price: stockInfo.price,
      dailyChange: stockInfo.change,
      newsSentiment: news.overallSentiment,
      articleCount: news.articles.length,
    },
  }
}
