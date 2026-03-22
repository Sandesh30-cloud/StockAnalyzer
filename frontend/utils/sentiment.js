const POSITIVE_TERMS = [
  'beat',
  'growth',
  'surge',
  'gain',
  'record',
  'upgrade',
  'bullish',
  'profit',
  'strong',
  'expand',
  'rebound',
  'outperform',
  'innovation',
  'partnership',
  'approval',
]

const NEGATIVE_TERMS = [
  'miss',
  'drop',
  'fall',
  'weak',
  'downgrade',
  'bearish',
  'lawsuit',
  'risk',
  'decline',
  'warning',
  'cut',
  'loss',
  'slowdown',
  'investigation',
  'recall',
]

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function classifyScore(score) {
  if (score > 1) {
    return 'Positive'
  }

  if (score < -1) {
    return 'Negative'
  }

  return 'Neutral'
}

export function analyzeArticleSentiment(article) {
  const text = `${article.title ?? ''} ${article.description ?? ''}`.trim()
  const tokens = tokenize(text)
  const positiveMatches = tokens.filter((token) => POSITIVE_TERMS.includes(token)).length
  const negativeMatches = tokens.filter((token) => NEGATIVE_TERMS.includes(token)).length
  const score = positiveMatches - negativeMatches
  const sentiment = classifyScore(score)

  return {
    ...article,
    sentiment,
    sentimentScore: score,
  }
}

export function analyzeArticles(articles) {
  return articles.map(analyzeArticleSentiment)
}

export function aggregateSentiment(articles) {
  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  }

  const sentimentScore = articles.reduce((score, article) => {
    if (article.sentiment === 'Positive') {
      counts.positive += 1
      return score + 1
    }

    if (article.sentiment === 'Negative') {
      counts.negative += 1
      return score - 1
    }

    counts.neutral += 1
    return score
  }, 0)

  const overallSentiment =
    sentimentScore > 0 ? 'Positive' : sentimentScore < 0 ? 'Negative' : 'Neutral'

  return {
    overallSentiment,
    sentimentScore,
    counts,
  }
}
