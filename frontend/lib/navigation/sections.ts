export const APP_SECTIONS = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/compare', label: 'Comparison' },
  { href: '/charts', label: 'Charts' },
  { href: '/financials', label: 'Financials' },
  { href: '/holders', label: 'Holders' },
  { href: '/insights', label: 'Insights' },
  { href: '/news', label: 'News' },
  { href: '/backtesting', label: 'Backtesting' },
  { href: '/ipo', label: 'IPO' },
] as const

export const ANALYSIS_SECTIONS = APP_SECTIONS.filter(
  (section) =>
    !['/', '/search', '/ipo'].includes(section.href)
)
