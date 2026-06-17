'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { AppBackground } from '@/components/app-background'
import { StockSearch } from '@/components/stock-search'
import { ComparisonTable } from '@/components/comparison-table'
import { PriceChart } from '@/components/price-chart'
import { FinancialsView } from '@/components/financials-view'
import { HoldersView } from '@/components/holders-view'
import { Recommendation } from '@/components/recommendation'
import { NewsSentiment } from '@/components/news-sentiment'
import { BacktestingView } from '@/components/backtesting-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, LineChart, FileText, Users, Lightbulb, Newspaper, Activity, ArrowRight, BrainCircuit, ShieldCheck, Zap, Layers3, Gauge, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import BlurText from '@/components/BlurText'
import ShinyText from '@/components/ShinyText'
import SpotlightCard from '@/components/SpotlightCard'
import AnimatedContent from '@/components/AnimatedContent'
import StarBorder from '@/components/StarBorder'
import CountUp from '@/components/CountUp'

const QUICK_PICKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
const FEATURE_CARDS = [
  {
    icon: BrainCircuit,
    title: 'One research surface',
    description: 'Move from raw price action to explainable signals without juggling separate websites or spreadsheets.',
  },
  {
    icon: Layers3,
    title: 'Layered analysis',
    description: 'Combine comparison, fundamentals, holders, news sentiment, and backtesting in a single flow.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent decisions',
    description: 'Every insight is backed by visible metrics, moving averages, sentiment drivers, and strategy rules.',
  },
]

const STATS = [
  { label: 'Stocks per view', value: 5, suffix: '' },
  { label: 'Core workspaces', value: 7, suffix: '' },
  { label: 'Refresh cycle', value: 60, suffix: 's' },
]

const WORKFLOW_STEPS = [
  {
    title: 'Build a focused watchlist',
    description: 'Start with a few symbols you care about and keep them in one place for deeper review.',
  },
  {
    title: 'Read the market from multiple angles',
    description: 'Compare fundamentals, price behavior, ownership, sentiment, and AI-style reasoning side by side.',
  },
  {
    title: 'Pressure-test the signal',
    description: 'Check whether the trend-following setup would have held up through backtesting before acting.',
  },
]

const HIGHLIGHT_PANELS = [
  {
    icon: Gauge,
    title: 'Compare conviction, not just price',
    body: 'See valuation, profitability, leverage, momentum, and dividends in one grid built for faster ranking.',
  },
  {
    icon: Sparkles,
    title: 'Understand why the signal exists',
    body: 'The platform explains what is driving the view instead of returning a bare Buy, Hold, or Sell label.',
  },
  {
    icon: Zap,
    title: 'Move from thesis to test',
    body: 'Once a stock looks promising, switch to backtesting to see how the rules would have behaved historically.',
  },
]

export default function HomePage() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])

  const handleAddStock = (symbol: string) => {
    if (selectedStocks.includes(symbol)) {
      toast.error('Stock already added')
      return
    }
    if (selectedStocks.length >= 5) {
      toast.error('Maximum 5 stocks can be compared')
      return
    }
    setSelectedStocks([...selectedStocks, symbol])
    toast.success(`${symbol} added to comparison`)
  }

  const handleRemoveStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter((s) => s !== symbol))
    toast.info(`${symbol} removed from comparison`)
  }

  return (
    <div className="relative min-h-screen">
      <AppBackground />
      <Header />

      <main className="container relative mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
        {/* Hero */}
        <section className="grid gap-8 py-4 sm:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <AnimatedContent distance={30} duration={0.6} threshold={0.2}>
              <StarBorder
                as="div"
                className="mx-auto w-fit lg:mx-0"
                innerClassName="px-4 py-1.5 text-sm font-medium"
                color="rgb(52, 211, 153)"
                speed="8s"
              >
                <span className="inline-flex items-center gap-2 text-primary">
                  <Lightbulb className="size-4" />
                  Applied market research for faster stock decisions
                </span>
              </StarBorder>
            </AnimatedContent>

            <BlurText
              text="Understand a stock before you commit capital."
              delay={80}
              animateBy="words"
              direction="top"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance justify-center lg:justify-start text-foreground"
            />

            <AnimatedContent distance={40} duration={0.7} delay={0.15} threshold={0.2}>
              <div className="space-y-4">
                <p className="text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-balance text-base sm:text-lg leading-relaxed">
                  StockAnalyzer turns scattered market information into a guided workflow with
                  comparison tables, financial breakdowns, holders data, news sentiment, AI-style
                  reasoning, and backtesting powered by{' '}
                  <ShinyText
                    text="live market data"
                    speed={2.5}
                    color="oklch(0.65 0.02 250)"
                    shineColor="oklch(0.75 0.18 165)"
                    className="font-medium"
                  />
                  , so you can move from curiosity to conviction with less friction.
                </p>

                <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                  <div className="rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-sm text-muted-foreground">
                    Multi-stock comparison
                  </div>
                  <div className="rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-sm text-muted-foreground">
                    Sentiment + moving averages
                  </div>
                  <div className="rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-sm text-muted-foreground">
                    Backtesting with risk controls
                  </div>
                </div>
              </div>
            </AnimatedContent>

            <AnimatedContent distance={45} duration={0.75} delay={0.2} threshold={0.2}>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                <StarBorder
                  as="button"
                  type="button"
                  onClick={() => handleAddStock('AAPL')}
                  color="rgb(52, 211, 153)"
                  speed="7s"
                  innerClassName="px-5 py-3 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  Start with AAPL
                  <ArrowRight className="size-4" />
                </StarBorder>
                <p className="text-sm text-muted-foreground">
                  Active comparison set: <span className="font-semibold text-foreground">{selectedStocks.length}</span> / 5 stocks
                </p>
              </div>
            </AnimatedContent>
          </div>

          <AnimatedContent distance={40} duration={0.75} threshold={0.2}>
            <SpotlightCard
              className="p-0 shadow-2xl shadow-primary/5"
              spotlightColor="rgba(52, 211, 153, 0.10)"
            >
              <div className="space-y-6 p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">What you can do here</p>
                  <h2 className="text-2xl font-semibold tracking-tight">A structured research desk built for individual investors and student analysts.</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Start with a symbol, validate the financial story, inspect ownership, read recent headlines,
                    then test whether the strategy rules would have held up in the past.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border/50 bg-card/50 px-4 py-4 text-left"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                      <div className="mt-2 flex items-end gap-1">
                        <CountUp to={stat.value} className="text-2xl font-semibold" duration={1.6} />
                        <span className="pb-0.5 text-base font-semibold text-foreground">{stat.suffix}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
                  <p className="text-sm font-medium text-foreground">Quick path</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Search a ticker, compare it against peers, review the signal explanation, then validate the same idea in backtesting.
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </AnimatedContent>
        </section>

        <AnimatedContent distance={40} duration={0.75} threshold={0.15}>
          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 md:grid-cols-3">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon
              return (
                <SpotlightCard
                  key={feature.title}
                  className="p-0"
                  spotlightColor="rgba(52, 211, 153, 0.08)"
                >
                  <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5">
                    <div className="mb-4 inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </SpotlightCard>
              )
            })}
            </div>

            <SpotlightCard
              className="p-0"
              spotlightColor="rgba(52, 211, 153, 0.08)"
            >
              <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5 sm:p-6">
                <p className="text-sm font-medium text-primary">How the workflow unfolds</p>
                <div className="mt-4 space-y-5">
                  {WORKFLOW_STEPS.map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold tracking-tight">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </section>
        </AnimatedContent>

        {/* Search */}
        <AnimatedContent distance={50} duration={0.8} threshold={0.15}>
          <SpotlightCard
            className="max-w-5xl mx-auto p-0 shadow-2xl shadow-primary/5"
            spotlightColor="rgba(52, 211, 153, 0.12)"
          >
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-3 text-center lg:text-left">
                <p className="text-sm font-medium text-primary">Launch your analysis</p>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Search a stock and turn it into a working research set.
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Add up to five symbols, compare them across all tabs, and keep the same
                  watchlist as you move from snapshots to deeper analysis.
                </p>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {HIGHLIGHT_PANELS.map((panel) => {
                    const Icon = panel.icon
                    return (
                      <div key={panel.title} className="rounded-2xl border border-border/40 bg-card/45 p-4 text-left">
                        <div className="mb-3 inline-flex rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <h3 className="font-semibold tracking-tight">{panel.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{panel.body}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <StockSearch
                  selectedStocks={selectedStocks}
                  onAddStock={handleAddStock}
                  onRemoveStock={handleRemoveStock}
                  maxStocks={5}
                />
              </div>
            </div>
          </SpotlightCard>
        </AnimatedContent>

        {/* Tabs */}
        {selectedStocks.length > 0 && (
          <AnimatedContent distance={60} duration={0.8} threshold={0.1}>
            <Tabs defaultValue="compare" className="space-y-6">
              <div className="overflow-x-auto pb-2">
                <TabsList className="flex h-auto min-w-max gap-1.5 rounded-2xl border border-border/50 bg-card/50 p-2 shadow-lg backdrop-blur-md md:mx-auto md:w-fit">
                <TabsTrigger value="compare" className="gap-2 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                  <BarChart3 className="size-4" />
                  <span>Comparison</span>
                </TabsTrigger>
                <TabsTrigger value="charts" className="gap-2 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                  <LineChart className="size-4" />
                  <span>Price Charts</span>
                </TabsTrigger>
                <TabsTrigger value="financials" className="gap-2 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                  <FileText className="size-4" />
                  <span>Financials</span>
                </TabsTrigger>
                <TabsTrigger value="holders" className="gap-2 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                  <Users className="size-4" />
                  <span>Holders</span>
                </TabsTrigger>
                <TabsTrigger value="recommendation" className="gap-2 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                  <Lightbulb className="size-4" />
                  <span>Insights</span>
                </TabsTrigger>
                <TabsTrigger value="news" className="gap-2 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                  <Newspaper className="size-4" />
                  <span>News & Sentiment</span>
                </TabsTrigger>
                <TabsTrigger value="backtesting" className="gap-2 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                  <Activity className="size-4" />
                  <span>Backtesting</span>
                </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="compare" className="mt-0">
                <ComparisonTable symbols={selectedStocks} />
              </TabsContent>
              <TabsContent value="charts" className="mt-0">
                <PriceChart symbols={selectedStocks} />
              </TabsContent>
              <TabsContent value="financials" className="mt-0">
                <FinancialsView symbols={selectedStocks} />
              </TabsContent>
              <TabsContent value="holders" className="mt-0">
                <HoldersView symbols={selectedStocks} />
              </TabsContent>
              <TabsContent value="recommendation" className="mt-0">
                <Recommendation symbols={selectedStocks} />
              </TabsContent>
              <TabsContent value="news" className="mt-0">
                <NewsSentiment symbols={selectedStocks} />
              </TabsContent>
              <TabsContent value="backtesting" className="mt-0">
                <BacktestingView symbols={selectedStocks} />
              </TabsContent>
            </Tabs>
          </AnimatedContent>
        )}

        {/* Empty state */}
        {selectedStocks.length === 0 && (
          <AnimatedContent distance={50} duration={0.8} threshold={0.15}>
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <SpotlightCard
                className="border-dashed p-0"
                spotlightColor="rgba(52, 211, 153, 0.08)"
              >
                <div className="flex h-full flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                    <BarChart3 className="size-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Start with a stock set you already follow</h3>
                  <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">
                    Add a few symbols, then move through comparison, price action, holders,
                    sentiment, and backtesting without leaving the same workspace.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                    <span className="mr-1 text-sm text-muted-foreground">Quick picks:</span>
                    {QUICK_PICKS.map((symbol) => (
                      <StarBorder
                        key={symbol}
                        as="button"
                        type="button"
                        onClick={() => handleAddStock(symbol)}
                        color="rgb(52, 211, 153)"
                        speed="7s"
                        innerClassName="px-4 py-2 text-sm font-semibold hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        {symbol}
                      </StarBorder>
                    ))}
                  </div>
                </div>
              </SpotlightCard>

              <div className="grid gap-4 sm:grid-cols-2">
                <SpotlightCard className="p-0" spotlightColor="rgba(52, 211, 153, 0.08)">
                  <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5">
                    <p className="text-sm font-medium text-primary">Step 1</p>
                    <h4 className="mt-2 text-lg font-semibold">Build your watchlist</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Search symbols from major exchanges and keep up to five names in the same comparison flow.
                    </p>
                  </div>
                </SpotlightCard>
                <SpotlightCard className="p-0" spotlightColor="rgba(52, 211, 153, 0.08)">
                  <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5">
                    <p className="text-sm font-medium text-primary">Step 2</p>
                    <h4 className="mt-2 text-lg font-semibold">Validate the thesis</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Review fundamentals, ownership, price trends, and Python-based news sentiment before acting.
                    </p>
                  </div>
                </SpotlightCard>
                <SpotlightCard className="p-0 sm:col-span-2" spotlightColor="rgba(52, 211, 153, 0.08)">
                  <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5">
                    <p className="text-sm font-medium text-primary">Step 3</p>
                    <h4 className="mt-2 text-lg font-semibold">Pressure-test your signal</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Use the backtesting tab to see how the trend-following strategy would have performed
                      with moving averages, momentum filters, and risk-reward rules.
                    </p>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </AnimatedContent>
        )}
      </main>

      <footer className="relative border-t border-border/40 py-10 mt-20 bg-background/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stock data provided by Yahoo Finance. This platform is for informational purposes only
            and should not be considered financial advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
