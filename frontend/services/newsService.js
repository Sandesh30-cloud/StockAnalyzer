import axios from 'axios'

const DEFAULT_ARTICLE_LIMIT = 8
const BACKEND_BASE_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'

function normalizeArticle(article) {
  if (!article?.title || !article?.url) {
    return null
  }

  return {
    title: article.title,
    description: article.description ?? '',
    url: article.url,
    publishedAt: article.publishedAt ?? new Date().toISOString(),
  }
}

async function fetchYahooNews(symbol, limit) {
  const url = `${BACKEND_BASE_URL}/news/${symbol}?limit=${limit}`

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    const articles = Array.isArray(response.data?.articles) ? response.data.articles : []

    return articles
      .map((article) =>
        normalizeArticle({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
        }),
      )
      .filter(Boolean)
      .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
      .slice(0, limit)
  } catch (error) {
    if (error.response?.status === 429) {
      return { error: 'Daily news limit reached' }
    }
    return { error: 'Failed to fetch news' }
  }
}

export async function fetchStockNews(symbol, limit = DEFAULT_ARTICLE_LIMIT) {
  const normalizedSymbol = symbol.trim().toUpperCase()
  if (!normalizedSymbol) {
    throw new Error('Stock symbol is required')
  }

  return fetchYahooNews(normalizedSymbol, limit)
}
