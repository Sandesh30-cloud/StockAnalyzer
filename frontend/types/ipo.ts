export interface IpoAdvisorResponse {
  companyName: string
  strategy: string
  verdict: string
  score: number
  confidence: number
  summary: string
  positives: string[]
  risks: string[]
  watchouts: string[]
  source?: {
    url?: string
    domain?: string
    fetchedAt?: string
  }
  metrics: {
    issuePrice: number | null
    expectedListingGainPct: number | null
    expectedListingPrice: number | null
    gmp: number | null
    ipoPe: number | null
    peerPe: number | null
    valuationGapPct: number | null
    roe: number | null
    roce: number | null
    issueSizeCr: number | null
    issueSizeToMarketCapPct: number | null
    weightedSubscription: number | null
    qibSubscription: number | null
    hniSubscription: number | null
    retailSubscription: number | null
    debtToEquity: number | null
    revenueGrowth: number | null
    profitGrowth: number | null
    freshIssuePct: number | null
    ofsPct: number | null
  }
  error?: string
}
