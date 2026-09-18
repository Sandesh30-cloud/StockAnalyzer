import {
  BrainCircuit,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export const QUICK_PICKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']

export const FEATURE_CARDS: Array<{
  icon: LucideIcon
  title: string
  description: string
}> = [
  {
    icon: BrainCircuit,
    title: 'One research surface',
    description:
      'Move from raw price action to explainable signals without juggling separate websites or spreadsheets.',
  },
  {
    icon: Layers3,
    title: 'Layered analysis',
    description:
      'Combine comparison, fundamentals, holders, news sentiment, and backtesting in a single flow.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent decisions',
    description:
      'Every insight is backed by visible metrics, moving averages, sentiment drivers, and strategy rules.',
  },
]

export const STATS = [
  { label: 'Stocks per view', value: 5, suffix: '' },
  { label: 'Core workspaces', value: 7, suffix: '' },
  { label: 'Refresh cycle', value: 60, suffix: 's' },
]

export const WORKFLOW_STEPS = [
  {
    title: 'Build a focused watchlist',
    description:
      'Start with a few symbols you care about and keep them in one place for deeper review.',
  },
  {
    title: 'Read the market from multiple angles',
    description:
      'Compare fundamentals, price behavior, ownership, sentiment, and AI-style reasoning side by side.',
  },
  {
    title: 'Pressure-test the signal',
    description:
      'Check whether the trend-following setup would have held up through backtesting before acting.',
  },
]

export const HIGHLIGHT_PANELS: Array<{
  icon: LucideIcon
  title: string
  body: string
}> = [
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
