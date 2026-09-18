'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, BriefcaseBusiness, Calculator, CheckCircle2, Gauge, LineChart, Search, ShieldAlert, Target } from 'lucide-react'
import SpotlightCard from '@/components/animations/SpotlightCard'
import type { IpoAdvisorResponse } from '@/types/ipo'
import { endpoints } from '@/lib/api/endpoints'
import { BACKEND_UNAVAILABLE_MESSAGE } from '@/lib/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'


function verdictVariant(verdict: string) {
  if (verdict === 'Apply Aggressively') return 'success'
  if (verdict === 'Apply for Listing Gain') return 'success'
  if (verdict === 'Apply Selectively') return 'warning'
  return 'destructive'
}

function formatValue(value: number | null | undefined, suffix = '', decimals = 1) {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(decimals)}${suffix}`
}

function MetricTile({
  label,
  value,
  helper,
  className,
}: {
  label: string
  value: string
  helper?: string
  className?: string
}) {
  return (
    <div className={cn('rounded-2xl border border-border/50 bg-muted/35 p-4', className)}>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

export function IpoAdvisor() {
  const [companyName, setCompanyName] = useState('Indo-MIM')
  const [result, setResult] = useState<IpoAdvisorResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!companyName.trim()) return

    setError(null)
    startTransition(async () => {
      try {
        const response = await fetch(endpoints.ipoAdvisor(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: companyName.trim(),
          }),
        })

        const data: IpoAdvisorResponse = await response.json()
        if (!response.ok || data.error) {
          setResult(null)
          setError(data.error || 'Unable to fetch IPO data right now.')
          return
        }

        setResult(data)
      } catch {
        setResult(null)
        setError(BACKEND_UNAVAILABLE_MESSAGE)
      }
    })
  }

  return (
    <SpotlightCard className="p-0" spotlightColor="rgba(245, 158, 11, 0.12)">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit border-amber-500/30 bg-amber-500/10 text-amber-200">
                Listing gain only
              </Badge>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="size-5 text-amber-300" />
                Smart IPO Investment Advisor
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                Enter the IPO company name and the app fetches the issue data online before scoring it for
                listing-gain participation. The model emphasizes demand quality, valuation stretch, ROE, ROCE,
                issue size pressure, and promoter exit mix.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Company name only</Badge>
              <Badge variant="outline">Live IPO details</Badge>
              <Badge variant="outline">P/E + ROE + ROCE</Badge>
              <Badge variant="outline">Subscription strength</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">IPO company name</span>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="e.g. Indo-MIM, NSDL, Hero FinCorp"
                      className="h-12 rounded-xl bg-background/40 pl-11"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending || !companyName.trim()}
                    className="h-12 rounded-xl px-5 shadow-lg shadow-amber-500/20"
                  >
                    <Calculator className="size-4" />
                    {isPending ? 'Fetching...' : 'Analyze IPO'}
                  </Button>
                </div>
              </label>

              {error ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="rounded-2xl border border-border/50 bg-card/50 p-5 text-sm leading-6 text-muted-foreground">
                The app looks up the IPO online, extracts issue price, GMP, subscription, issue size, P/E,
                ROE, ROCE, debt, and financial growth, then converts that into a listing-gain recommendation.
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-amber-500/20 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                <div className="flex items-center gap-2 text-sm text-amber-100/80">
                  <BriefcaseBusiness className="size-4" />
                  Automatic online sourcing
                </div>
                <h3 className="mt-3 text-2xl font-semibold">What gets pulled in</h3>
                <div className="mt-4 grid gap-3">
                  <MetricTile label="Valuation" value="Issue price, IPO P/E, peer P/E" helper="Checks premium or discount versus peers." />
                  <MetricTile label="Profitability" value="ROE, ROCE, growth, leverage" helper="Quality still matters for listing demand." />
                  <MetricTile label="Supply" value="Issue size, fresh issue, OFS" helper="Heavy supply can cap debut upside." />
                  <MetricTile label="Demand" value="GMP, QIB, HNI, retail" helper="Institutional demand gets the highest weight." />
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/50 p-5 text-sm leading-6 text-muted-foreground">
                Best results come from current or recently listed IPO names with a public issue page available online.
              </div>
            </div>
          </div>

          {result ? (
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-border/50 bg-card/70 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{result.companyName}</p>
                      <h3 className="text-2xl font-semibold">{result.verdict}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{result.summary}</p>
                    </div>
                    <div className="flex flex-col gap-2 md:items-end">
                      <Badge variant={verdictVariant(result.verdict)} className="px-3 py-1 text-sm">
                        {result.verdict}
                      </Badge>
                      <Badge variant="outline">Score: {result.score}/100</Badge>
                      <Badge variant="outline">Confidence: {result.confidence}%</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricTile
                    label="Expected Gain"
                    value={formatValue(result.metrics.expectedListingGainPct, '%')}
                    helper={result.metrics.expectedListingPrice !== null ? `Implied listing price Rs ${result.metrics.expectedListingPrice.toFixed(2)}` : 'No listing estimate available'}
                  />
                  <MetricTile
                    label="Issue Price / GMP"
                    value={
                      result.metrics.issuePrice !== null
                        ? `Rs ${result.metrics.issuePrice.toFixed(2)} / ${result.metrics.gmp !== null ? `Rs ${result.metrics.gmp.toFixed(0)}` : 'N/A'}`
                        : 'N/A'
                    }
                    helper="Upper end of the IPO price band is used as issue price"
                  />
                  <MetricTile
                    label="IPO P/E vs Peer P/E"
                    value={`${formatValue(result.metrics.ipoPe, '', 2)} / ${formatValue(result.metrics.peerPe, '', 2)}`}
                    helper={result.metrics.valuationGapPct !== null ? `${result.metrics.valuationGapPct >= 0 ? '+' : ''}${result.metrics.valuationGapPct.toFixed(1)}% premium/discount` : 'Peer comparison unavailable'}
                  />
                  <MetricTile
                    label="ROE / ROCE"
                    value={`${formatValue(result.metrics.roe, '%')} / ${formatValue(result.metrics.roce, '%')}`}
                    helper="Capital efficiency from the fetched IPO data"
                  />
                  <MetricTile
                    label="Weighted Demand"
                    value={result.metrics.weightedSubscription !== null ? `${result.metrics.weightedSubscription.toFixed(1)}x` : 'N/A'}
                    helper="QIB carries the biggest weight in the model"
                  />
                  <MetricTile
                    label="Issue Size Pressure"
                    value={
                      result.metrics.issueSizeToMarketCapPct !== null
                        ? `${result.metrics.issueSizeToMarketCapPct.toFixed(1)}% of m-cap`
                        : result.metrics.issueSizeCr !== null
                          ? `Rs ${result.metrics.issueSizeCr.toFixed(0)} Cr`
                          : 'N/A'
                    }
                    helper="Bigger supply can limit listing-day upside"
                  />
                  <MetricTile
                    label="Growth"
                    value={`${formatValue(result.metrics.revenueGrowth, '%')} / ${formatValue(result.metrics.profitGrowth, '%')}`}
                    helper="Revenue growth / profit growth"
                  />
                  <MetricTile
                    label="Issue Mix"
                    value={`${formatValue(result.metrics.freshIssuePct, '%')} / ${formatValue(result.metrics.ofsPct, '%')}`}
                    helper="Fresh issue % / OFS %"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <h4 className="font-medium">What supports the IPO</h4>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.positives.length > 0 ? result.positives.map((item) => (
                      <p key={item}>• {item}</p>
                    )) : <p>No strong support signals were detected.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-rose-400" />
                    <h4 className="font-medium">What can hurt listing gains</h4>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.risks.length > 0 ? result.risks.map((item) => (
                      <p key={item}>• {item}</p>
                    )) : <p>No major downside signal stood out in the current inputs.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-300" />
                    <h4 className="font-medium">Watchouts</h4>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.watchouts.length > 0 ? result.watchouts.map((item) => (
                      <p key={item}>• {item}</p>
                    )) : <p>No major missing-data warning was triggered.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4 text-primary" />
                    <h4 className="font-medium">Demand snapshot</h4>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MetricTile label="QIB" value={result.metrics.qibSubscription !== null ? `${result.metrics.qibSubscription.toFixed(1)}x` : 'N/A'} />
                    <MetricTile label="HNI / NII" value={result.metrics.hniSubscription !== null ? `${result.metrics.hniSubscription.toFixed(1)}x` : 'N/A'} />
                    <MetricTile label="Retail" value={result.metrics.retailSubscription !== null ? `${result.metrics.retailSubscription.toFixed(1)}x` : 'N/A'} />
                  </div>
                </div>

                {result.source?.url ? (
                  <div className="rounded-2xl border border-border/50 bg-card/50 p-5 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Online source</p>
                    <p className="mt-2 break-all">{result.source.url}</p>
                    {result.source.fetchedAt ? (
                      <p className="mt-1">Fetched at: {result.source.fetchedAt}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300">
                <LineChart className="size-7" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Run an IPO listing-gain analysis</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Enter the company name and the advisor will pull the IPO data from the web, then decide whether
                the issue looks attractive purely for listing gains.
              </p>
            </div>
          )}

          <p className="text-xs leading-5 text-muted-foreground">
            Disclaimer: This module is optimized for IPO listing-gain analysis only. Online GMP and subscription data can change quickly, and real listing outcomes can differ materially from model estimates.
          </p>
        </CardContent>
      </Card>
    </SpotlightCard>
  )
}
