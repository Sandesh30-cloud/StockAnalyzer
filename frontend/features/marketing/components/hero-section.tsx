'use client'

import { ArrowRight, Lightbulb } from 'lucide-react'

import AnimatedContent from '@/components/animations/AnimatedContent'
import BlurText from '@/components/animations/BlurText'
import CountUp from '@/components/animations/CountUp'
import ShinyText from '@/components/animations/ShinyText'
import SpotlightCard from '@/components/animations/SpotlightCard'
import StarBorder from '@/components/animations/StarBorder'
import { STATS } from '@/features/marketing/constants'

interface HeroSectionProps {
  selectedCount: number
  onQuickStart: () => void
}

export function HeroSection({ selectedCount, onQuickStart }: HeroSectionProps) {
  return (
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
              onClick={onQuickStart}
              color="rgb(52, 211, 153)"
              speed="7s"
              innerClassName="px-5 py-3 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              Start with AAPL
              <ArrowRight className="size-4" />
            </StarBorder>
            <p className="text-sm text-muted-foreground">
              Active comparison set:{' '}
              <span className="font-semibold text-foreground">{selectedCount}</span> / 5 stocks
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
              <h2 className="text-2xl font-semibold tracking-tight">
                A structured research desk built for individual investors and student analysts.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Start with a symbol, validate the financial story, inspect ownership, read recent
                headlines, then test whether the strategy rules would have held up in the past.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-card/50 px-4 py-4 text-left"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="mt-2 flex items-end gap-1">
                    <CountUp to={stat.value} className="text-2xl font-semibold" duration={1.6} />
                    <span className="pb-0.5 text-base font-semibold text-foreground">
                      {stat.suffix}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
              <p className="text-sm font-medium text-foreground">Quick path</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Search a ticker, compare it against peers, review the signal explanation, then
                validate the same idea in backtesting.
              </p>
            </div>
          </div>
        </SpotlightCard>
      </AnimatedContent>
    </section>
  )
}
