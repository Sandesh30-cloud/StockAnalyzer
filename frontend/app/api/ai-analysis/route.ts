import { NextResponse } from 'next/server'

import { generateAIAnalysis } from '@/utils/ai-analysis'

const BACKEND_BASE_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function fetchBackendJson(path: string) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Backend request failed for ${path}`)
  }

  return response.json()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stock = searchParams.get('stock')?.trim().toUpperCase()

  if (!stock) {
    return NextResponse.json({ error: 'Missing stock query parameter' }, { status: 400 })
  }

  try {
    const [recommendation, stockInfo, news] = await Promise.all([
      fetchBackendJson(`/recommendation/${stock}`),
      fetchBackendJson(`/stock-info/${stock}`),
      fetch(`${new URL(request.url).origin}/api/news-analysis?stock=${stock}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      }).then((res) => res.json()),
    ])

    if (recommendation?.error) {
      throw new Error(recommendation.error)
    }

    const analysis = generateAIAnalysis({
      stock,
      recommendation,
      stockInfo,
      news,
    })

    return NextResponse.json(analysis)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate AI analysis'
    return NextResponse.json(
      {
        stock,
        score: null,
        confidence: null,
        view: null,
        summary: '',
        bullishFactors: [],
        bearishFactors: [],
        error: message,
      },
      { status: 200 },
    )
  }
}
